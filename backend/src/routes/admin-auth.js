const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash FROM admin_users WHERE email = $1;',
      [String(email).toLowerCase().trim()]
    );
    const user = result.rows[0];
    // Compare against a dummy hash when the user doesn't exist, so the
    // response time doesn't leak whether the email is registered.
    const hashToCheck = user ? user.password_hash : '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinval';
    const passwordMatches = await bcrypt.compare(password, hashToCheck);

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.adminUserId = user.id;
      req.session.adminEmail = user.email;
      res.json({ email: user.email });
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session || !req.session.adminUserId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ email: req.session.adminEmail });
});

module.exports = router;
