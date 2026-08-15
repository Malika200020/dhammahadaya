const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../db');
const { sendEmail } = require('../email');

const router = express.Router();

// Email-OTP two-factor (build-spec §19). Defaults ON — only an explicit
// "false" turns it off, so a fresh/production environment is secure by
// default and skipping it is always a deliberate, visible opt-out (e.g.
// backend/.env sets it to false for local dev, so testing isn't blocked
// waiting on a code in the console).
const TWO_FACTOR_ENABLED = process.env.TWO_FACTOR_ENABLED !== 'false';
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function clearOtpSession(sess) {
  delete sess.otpPendingUserId;
  delete sess.otpPendingEmail;
  delete sess.otpCodeHash;
  delete sess.otpExpiresAt;
  delete sess.otpAttempts;
}

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

    if (!TWO_FACTOR_ENABLED) {
      return req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.adminUserId = user.id;
        req.session.adminEmail = user.email;
        res.json({ email: user.email });
      });
    }

    // Password alone only earns a "pending" session — adminUserId is never
    // set here, so requireAdminAuth (and GET /me) still treat this session
    // as unauthenticated until the code is verified too.
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    req.session.regenerate(async (err) => {
      if (err) return next(err);
      req.session.otpPendingUserId = user.id;
      req.session.otpPendingEmail = user.email;
      req.session.otpCodeHash = hashOtp(code);
      req.session.otpExpiresAt = Date.now() + OTP_TTL_MS;
      req.session.otpAttempts = 0;
      try {
        await sendEmail({
          to: user.email,
          subject: 'Your Dhammahadaya admin login code',
          text: `Your login code is ${code}. It expires in 10 minutes.\n\nIf you didn't try to sign in, you can ignore this email.`,
        });
      } catch (emailErr) {
        return next(emailErr);
      }
      res.json({ otpRequired: true, email: user.email });
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { code } = req.body || {};
    if (!req.session || !req.session.otpPendingUserId) {
      return res.status(400).json({ error: 'No login in progress. Please sign in again.' });
    }
    if (Date.now() > req.session.otpExpiresAt) {
      clearOtpSession(req.session);
      return res.status(401).json({ error: 'Code expired. Please sign in again.' });
    }
    if (!code || hashOtp(String(code).trim()) !== req.session.otpCodeHash) {
      req.session.otpAttempts = (req.session.otpAttempts || 0) + 1;
      if (req.session.otpAttempts >= OTP_MAX_ATTEMPTS) {
        clearOtpSession(req.session);
        return res.status(401).json({ error: 'Too many incorrect attempts. Please sign in again.' });
      }
      return res.status(401).json({ error: 'Incorrect code.' });
    }

    const userId = req.session.otpPendingUserId;
    const userEmail = req.session.otpPendingEmail;
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.adminUserId = userId;
      req.session.adminEmail = userEmail;
      res.json({ email: userEmail });
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
