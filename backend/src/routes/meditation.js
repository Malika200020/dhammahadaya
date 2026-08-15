const express = require('express');
const { pool } = require('../db');
const { verifyRecaptcha } = require('../recaptcha');

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_STAY_DAYS = 7;

// POST /api/meditation-applications — the residential meditation program
// registration form (build-spec §13). "Notify the monastery" is satisfied
// by the admin dashboard list (backend/src/routes/admin-meditation.js),
// not a separate email — simpler, and the spec explicitly allows either.
router.post('/', async (req, res, next) => {
  try {
    const {
      name, email, phone, from_date, to_date, experience,
      meditation_types, previous_teachers, current_diseases, agreed, recaptcha_token,
    } = req.body || {};

    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' });
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'Phone number is required' });
    if (!DATE_RE.test(from_date || '') || !DATE_RE.test(to_date || '')) {
      return res.status(400).json({ error: 'from_date and to_date are required, as YYYY-MM-DD' });
    }
    if (to_date < from_date) return res.status(400).json({ error: 'to_date must be on or after from_date' });

    // Inclusive day count (from_date and to_date both count as stay days),
    // enforced here — not just in the UI — so a direct API call can't
    // bypass the 7-day cap.
    const stayDays = Math.round((new Date(to_date) - new Date(from_date)) / (1000 * 60 * 60 * 24)) + 1;
    if (stayDays > MAX_STAY_DAYS) {
      return res.status(400).json({ error: `Stay must be at most ${MAX_STAY_DAYS} days (from_date through to_date, inclusive)` });
    }

    if (experience !== 'yes' && experience !== 'no') {
      return res.status(400).json({ error: 'experience must be "yes" or "no"' });
    }
    if (!agreed) return res.status(400).json({ error: 'You must agree to the terms' });

    const recaptchaOk = await verifyRecaptcha(recaptcha_token);
    if (!recaptchaOk) return res.status(400).json({ error: 'reCAPTCHA verification failed' });

    const result = await pool.query(
      `INSERT INTO meditation_application
         (name, email, phone, from_date, to_date, experience, meditation_types, previous_teachers, current_diseases, agreed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *;`,
      [
        name.trim(),
        email.trim(),
        phone.trim(),
        from_date,
        to_date,
        experience,
        meditation_types || null,
        previous_teachers || null,
        current_diseases || null,
        true,
      ]
    );
    res.status(201).json({ application: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
