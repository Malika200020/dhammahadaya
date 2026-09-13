const express = require('express');
const { pool } = require('../db');
const { sendEmail } = require('../email');
const {
  bookingConfirmedEmail,
  bookingDeclinedEmail,
  bookingCancelledEmail,
  bookingDateChangedEmail,
} = require('../email/bookingEmailTemplates');
const { sendWhatsappMessage } = require('../whatsapp');

const router = express.Router();

const STATUSES = new Set(['pending', 'booked', 'declined', 'cancelled']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EDITABLE_FIELDS = ['date', 'name', 'email', 'phone', 'objective', 'mailing_address'];

// GET /api/admin/sponsorship?status=pending — omit status for all bookings.
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    if (status && !STATUSES.has(status)) {
      return res.status(400).json({ error: `status must be one of: ${[...STATUSES].join(', ')}` });
    }
    const result = await pool.query(
      status
        ? `SELECT * FROM sponsorship_booking WHERE status = $1 ORDER BY date ASC;`
        : `SELECT * FROM sponsorship_booking ORDER BY date ASC;`,
      status ? [status] : []
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/sponsorship/:id/confirm — pending -> booked, then emails the sponsor.
router.post('/:id/confirm', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE sponsorship_booking SET status = 'booked', confirmed_at = now()
       WHERE id = $1 AND status = 'pending'
       RETURNING *;`,
      [req.params.id]
    );
    const booking = result.rows[0];
    if (!booking) {
      const existing = await pool.query('SELECT status FROM sponsorship_booking WHERE id = $1;', [req.params.id]);
      if (!existing.rows[0]) return res.status(404).json({ error: 'Not found' });
      return res.status(409).json({ error: `Booking is already ${existing.rows[0].status}` });
    }

    let emailSent = true;
    try {
      await sendEmail({ to: booking.email, ...bookingConfirmedEmail(booking) });
    } catch (emailErr) {
      console.error('Failed to send sponsorship confirmation email:', emailErr);
      emailSent = false;
    }

    // Best-effort second channel alongside the email above — never allowed
    // to affect this response either way. sendWhatsappMessage never throws
    // (returns {sent:false, reason} instead), but this is wrapped anyway in
    // case whatsapp-web.js itself misbehaves unexpectedly.
    let whatsappSent = false;
    try {
      const result = await sendWhatsappMessage(
        booking.phone,
        `Dear ${booking.name},\n\n` +
          `Your sponsorship booking for ${booking.date} has been confirmed by Dhammahadaya Senasanaya.\n\n` +
          `Objective: ${booking.objective}\n\n` +
          `Thank you for your generosity. May the Triple-gem protect you!\n` +
          `Dhammahadaya Forest Monastery`
      );
      whatsappSent = result.sent;
      if (!result.sent) console.log(`WhatsApp confirmation not sent for booking ${booking.id}: ${result.reason}`);
    } catch (waErr) {
      console.error('Failed to send sponsorship confirmation WhatsApp message:', waErr);
    }

    res.json({ booking, emailSent, whatsappSent });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/sponsorship/:id/decline — pending -> declined, freeing the
// date, then emails the sponsor that their request wasn't confirmed.
router.post('/:id/decline', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE sponsorship_booking SET status = 'declined'
       WHERE id = $1 AND status = 'pending'
       RETURNING *;`,
      [req.params.id]
    );
    const booking = result.rows[0];
    if (!booking) {
      const existing = await pool.query('SELECT status FROM sponsorship_booking WHERE id = $1;', [req.params.id]);
      if (!existing.rows[0]) return res.status(404).json({ error: 'Not found' });
      return res.status(409).json({ error: `Booking is already ${existing.rows[0].status}` });
    }

    let emailSent = true;
    try {
      await sendEmail({ to: booking.email, ...bookingDeclinedEmail(booking) });
    } catch (emailErr) {
      console.error('Failed to send sponsorship decline email:', emailErr);
      emailSent = false;
    }

    res.json({ booking, emailSent });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/sponsorship/:id/cancel — booked -> cancelled. Distinct
// from decline: this withdraws a booking that was already confirmed, so it
// gets its own status (see migrate.js) and its own sponsor-facing wording.
// The date frees up the instant this UPDATE commits, because the partial
// unique index (idx_sponsorship_booking_active_date) only covers
// status IN ('pending','booked') — 'cancelled' falls outside it, so a new
// booking can immediately claim the same date with no separate cleanup step.
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE sponsorship_booking SET status = 'cancelled', cancelled_at = now()
       WHERE id = $1 AND status = 'booked'
       RETURNING *;`,
      [req.params.id]
    );
    const booking = result.rows[0];
    if (!booking) {
      const existing = await pool.query('SELECT status FROM sponsorship_booking WHERE id = $1;', [req.params.id]);
      if (!existing.rows[0]) return res.status(404).json({ error: 'Not found' });
      return res.status(409).json({ error: `Only a booked (confirmed) booking can be cancelled — this one is ${existing.rows[0].status}` });
    }

    let emailSent = true;
    try {
      await sendEmail({ to: booking.email, ...bookingCancelledEmail(booking) });
    } catch (emailErr) {
      console.error('Failed to send sponsorship cancellation email:', emailErr);
      emailSent = false;
    }

    res.json({ booking, emailSent });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/sponsorship/:id — edit a booked (confirmed) booking's
// fields. Scoped to 'booked' only: a pending booking is edited by the
// sponsor re-submitting (or admin declining and letting them resubmit), and
// declined/cancelled rows are historical, not live bookings to adjust.
//
// A date change and a same-row UPDATE (not delete+insert) are what make
// this safe under the double-booking guard: the partial unique index is
// re-checked by Postgres on UPDATE exactly as it is on INSERT, so if the
// requested new date is already taken by another active booking the
// UPDATE itself fails with a 23505 (caught below as a clean 409) and the
// row's original date is left completely untouched — there's no
// intermediate state where the date is free or the row is half-changed.
router.patch('/:id', async (req, res, next) => {
  try {
    const current = await pool.query('SELECT * FROM sponsorship_booking WHERE id = $1;', [req.params.id]);
    const before = current.rows[0];
    if (!before) return res.status(404).json({ error: 'Not found' });
    if (before.status !== 'booked') {
      return res.status(409).json({ error: `Only a booked (confirmed) booking can be edited — this one is ${before.status}` });
    }

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body?.[field] === undefined) continue;
      updates[field] = req.body[field];
    }

    if (updates.date !== undefined) {
      if (!DATE_RE.test(updates.date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    }
    if (updates.name !== undefined && !String(updates.name).trim()) {
      return res.status(400).json({ error: 'name cannot be empty' });
    }
    if (updates.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    if (updates.phone !== undefined && !String(updates.phone).trim()) {
      return res.status(400).json({ error: 'phone cannot be empty' });
    }

    const fields = Object.keys(updates);
    if (fields.length === 0) return res.status(400).json({ error: 'No editable fields provided' });

    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map((f) => (typeof updates[f] === 'string' ? updates[f].trim() : updates[f]));

    let result;
    try {
      result = await pool.query(
        `UPDATE sponsorship_booking SET ${setClause} WHERE id = $1 AND status = 'booked' RETURNING *;`,
        [req.params.id, ...values]
      );
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'That date is no longer available. Please choose another date.' });
      }
      throw err;
    }
    const booking = result.rows[0];
    // Guards a race between the SELECT above and this UPDATE — e.g. another
    // admin cancelled/declined the same booking in between. WHERE status =
    // 'booked' then matches no row, so this returns 0 rows rather than
    // silently updating a booking that's no longer confirmed.
    if (!booking) {
      return res.status(409).json({ error: 'This booking changed status before the edit could be applied — please refresh and try again.' });
    }

    const dateChanged = fields.includes('date') && before.date !== booking.date;

    // Only a date change is emailed — it's the one thing that materially
    // changes what the sponsor is expecting to happen (their commitment
    // moved to a different day). A typo fix to their own name/phone/email/
    // objective isn't something they need to be told about by the
    // monastery: they already know their own details, and an unexpected
    // "your booking was changed" email over an internal correction reads as
    // more alarming/spammy than helpful. If you'd rather every edit always
    // notify the sponsor, that's a one-line change here.
    let emailSent = null;
    if (dateChanged) {
      emailSent = true;
      try {
        await sendEmail({ to: booking.email, ...bookingDateChangedEmail(before.date, booking) });
      } catch (emailErr) {
        console.error('Failed to send sponsorship date-change email:', emailErr);
        emailSent = false;
      }
    }

    res.json({ booking, emailSent });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
