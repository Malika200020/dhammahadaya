const express = require('express');
const { pool } = require('../db');
const { sendEmail } = require('../email');

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 186; // ~6 months — generous for "current + next month" but bounds an unauthenticated query

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/sponsorship/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
// Only exposes date + status for active (pending/booked) bookings — never
// the booker's name/email/phone, this endpoint is public. Any date in the
// requested range with no row here is implicitly "available".
router.get('/calendar', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!DATE_RE.test(from || '') || !DATE_RE.test(to || '')) {
      return res.status(400).json({ error: 'from and to are required, as YYYY-MM-DD' });
    }
    const days = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
    if (days < 0 || days > MAX_RANGE_DAYS) {
      return res.status(400).json({ error: `Range must be between 0 and ${MAX_RANGE_DAYS} days` });
    }
    const result = await pool.query(
      `SELECT date, status FROM sponsorship_booking
       WHERE date BETWEEN $1 AND $2 AND status IN ('pending', 'booked')
       ORDER BY date ASC;`,
      [from, to]
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/sponsorship/bookings — a lay supporter books a date. Goes
// straight to "pending"; admin confirms it to "booked" separately.
router.post('/bookings', async (req, res, next) => {
  try {
    const { date, name, email, phone, objective, mailing_address } = req.body || {};

    if (!DATE_RE.test(date || '')) return res.status(400).json({ error: 'A valid date (YYYY-MM-DD) is required' });
    if (date < todayIso()) return res.status(400).json({ error: 'Date must be today or later' });
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' });
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'Phone number is required' });
    if (!objective || !objective.trim()) return res.status(400).json({ error: 'Objective is required' });

    const result = await pool.query(
      `INSERT INTO sponsorship_booking (date, name, email, phone, objective, mailing_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [date, name.trim(), email.trim(), phone.trim(), objective.trim(), mailing_address ? mailing_address.trim() : null]
    );
    const booking = result.rows[0];
    res.status(201).json({ booking });

    // Best-effort "notify the monastery on submission" (build-spec §10) —
    // fired after responding, and never allowed to fail the booking itself;
    // the sponsor's own confirmation email (on admin approval) is the one
    // that matters to them and is handled separately in admin-sponsorship.js.
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: 'New sponsorship booking pending review',
        text:
          `A new sponsorship booking needs review.\n\n` +
          `Date: ${booking.date}\n` +
          `Name: ${booking.name}\n` +
          `Email: ${booking.email}\n` +
          `Phone: ${booking.phone}\n` +
          `Objective: ${booking.objective}\n` +
          (booking.mailing_address ? `Mailing address: ${booking.mailing_address}\n` : '') +
          `\nConfirm or decline it from the admin panel.`,
      }).catch((err) => console.error('Failed to send admin booking-notification email:', err));
    }
  } catch (err) {
    // The partial unique index on (date) WHERE status IN ('pending','booked')
    // is the actual double-booking guard — this catches its violation
    // rather than doing a separate check-then-insert (which would race).
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That date is no longer available. Please choose another date.' });
    }
    next(err);
  }
});

module.exports = router;
