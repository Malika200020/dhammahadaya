const express = require('express');
const { pool } = require('../db');
const { sendEmail } = require('../email');
const { sendWhatsappMessage } = require('../whatsapp');

const router = express.Router();

const STATUSES = new Set(['pending', 'booked', 'declined']);

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
      await sendEmail({
        to: booking.email,
        subject: 'Your Dhammahadaya sponsorship booking is confirmed',
        text:
          `Dear ${booking.name},\n\n` +
          `Your sponsorship booking for ${booking.date} has been confirmed by Dhammahadaya Senasanaya.\n\n` +
          `Objective: ${booking.objective}\n\n` +
          `Thank you for your generosity. May the Triple-gem protect you!\n` +
          `Dhammahadaya Forest Monastery`,
      });
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

// POST /api/admin/sponsorship/:id/decline — pending -> declined, freeing the date.
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
    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
