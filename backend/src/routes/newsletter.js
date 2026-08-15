const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /api/newsletter-subscribers — build-spec §4.11. Re-subscribing with
// the same email is treated as a success (idempotent), not an error — the
// visitor doesn't need to know or care that they were already on the list.
router.post('/', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' });

    const result = await pool.query(
      `INSERT INTO newsletter_subscriber (email) VALUES ($1)
       ON CONFLICT (email) DO NOTHING
       RETURNING *;`,
      [email.trim()]
    );
    res.status(201).json({ subscriber: result.rows[0] || { email: email.trim() } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
