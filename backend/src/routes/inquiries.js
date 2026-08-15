const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /api/inquiries — the small "get in touch" form (build-spec §4.10),
// first implemented here for the Contact Us page; the home page will reuse
// this same endpoint (via the same InquiryForm component) once it's built.
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' });
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });

    const result = await pool.query(
      `INSERT INTO inquiry_message (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [name.trim(), email.trim(), phone ? phone.trim() : null, message.trim()]
    );
    res.status(201).json({ inquiry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
