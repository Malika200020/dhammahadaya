const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../db');
const { sendEmail } = require('../email');
const { requireAdminAuth } = require('../middleware/requireAdminAuth');

const router = express.Router();

// Email-OTP two-factor (build-spec §19) — super admins only (2026-10: normal
// admins use plain username + password, no OTP, since many don't check
// email reliably and use low-end devices). Defaults ON for super admins —
// only an explicit "false" turns it off, so a fresh/production environment
// is secure by default and skipping it is always a deliberate, visible
// opt-out (e.g. backend/.env sets it to false for local dev, so testing
// isn't blocked waiting on a code in the console).
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

function clearChangePasswordOtpSession(sess) {
  delete sess.pwdOtpCodeHash;
  delete sess.pwdOtpExpiresAt;
  delete sess.pwdOtpAttempts;
  delete sess.pwdOtpNewPasswordHash;
}

async function sendOtpEmail(email, code) {
  await sendEmail({
    to: email,
    subject: 'Your Dhammahadaya admin login code',
    text: `Your login code is ${code}. It expires in 10 minutes.\n\nIf you didn't try to sign in, you can ignore this email.`,
  });
}

// POST /login — { identifier, password }. identifier is an email (super
// admins) or a username (normal admins); looked up against whichever
// column actually matches, so the frontend needs just one field instead of
// asking the visitor which kind of account they have.
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: 'identifier and password are required' });
    }
    const normalized = String(identifier).toLowerCase().trim();

    const result = await pool.query(
      `SELECT id, email, username, password_hash, role, must_change_password
       FROM admin_users WHERE LOWER(email) = $1 OR LOWER(username) = $1;`,
      [normalized]
    );
    const user = result.rows[0];
    // Compare against a dummy hash when the user doesn't exist, so the
    // response time doesn't leak whether the identifier is registered.
    const hashToCheck = user ? user.password_hash : '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinval';
    const passwordMatches = await bcrypt.compare(password, hashToCheck);

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const loginLabel = user.email || user.username;

    if (user.role !== 'super_admin' || !TWO_FACTOR_ENABLED) {
      return req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.adminUserId = user.id;
        req.session.adminEmail = user.email;
        req.session.adminRole = user.role;
        req.session.mustChangePassword = user.must_change_password;
        res.json({
          email: user.email,
          username: user.username,
          role: user.role,
          mustChangePassword: user.must_change_password,
        });
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
        await sendOtpEmail(loginLabel, code);
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
    const result = await pool.query('SELECT role, must_change_password FROM admin_users WHERE id = $1;', [userId]);
    const user = result.rows[0];
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.adminUserId = userId;
      req.session.adminEmail = userEmail;
      req.session.adminRole = user?.role || 'super_admin';
      req.session.mustChangePassword = user?.must_change_password || false;
      res.json({ email: userEmail, role: req.session.adminRole, mustChangePassword: req.session.mustChangePassword });
    });
  } catch (err) {
    next(err);
  }
});

// POST /change-password — the normal-admin first-login forced change (also
// reachable any time after, not just the first login — there's just no UI
// entry point for it besides the forced redirect). Requires an active
// session but deliberately rejects super admins: they have their own
// OTP-protected /change-own-password/* flow below, and this endpoint has no
// OTP step, so letting a super admin use it would be a way to dodge their
// own 2FA requirement.
router.post('/change-password', requireAdminAuth, async (req, res, next) => {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    const result = await pool.query('SELECT role FROM admin_users WHERE id = $1;', [req.session.adminUserId]);
    const role = result.rows[0]?.role;
    if (role === 'super_admin') {
      return res.status(403).json({ error: 'Super admins must use the OTP-protected password change instead.' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE admin_users SET password_hash = $1, must_change_password = false WHERE id = $2;',
      [passwordHash, req.session.adminUserId]
    );
    req.session.mustChangePassword = false;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /change-own-password/request — super admin only. Current password
// must match before an OTP is even sent, so a hijacked-but-not-fully-
// compromised session (e.g. someone at an unlocked computer) can't trigger
// a password-change email on its own. Pending state lives in its own
// session keys (pwdOtp*), separate from the login-OTP ones, so this can't
// collide with (or be confused with) an in-progress login elsewhere.
router.post('/change-own-password/request', requireAdminAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Current password and a new password (min. 8 characters) are required.' });
    }
    const result = await pool.query(
      'SELECT email, password_hash, role FROM admin_users WHERE id = $1;',
      [req.session.adminUserId]
    );
    const user = result.rows[0];
    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    req.session.pwdOtpCodeHash = hashOtp(code);
    req.session.pwdOtpExpiresAt = Date.now() + OTP_TTL_MS;
    req.session.pwdOtpAttempts = 0;
    req.session.pwdOtpNewPasswordHash = await bcrypt.hash(newPassword, 12);
    await sendOtpEmail(user.email, code);
    res.json({ otpRequired: true });
  } catch (err) {
    next(err);
  }
});

router.post('/change-own-password/verify', requireAdminAuth, async (req, res, next) => {
  try {
    const { code } = req.body || {};
    if (!req.session.pwdOtpCodeHash) {
      return res.status(400).json({ error: 'No password change in progress. Please start again.' });
    }
    if (Date.now() > req.session.pwdOtpExpiresAt) {
      clearChangePasswordOtpSession(req.session);
      return res.status(401).json({ error: 'Code expired. Please start again.' });
    }
    if (!code || hashOtp(String(code).trim()) !== req.session.pwdOtpCodeHash) {
      req.session.pwdOtpAttempts = (req.session.pwdOtpAttempts || 0) + 1;
      if (req.session.pwdOtpAttempts >= OTP_MAX_ATTEMPTS) {
        clearChangePasswordOtpSession(req.session);
        return res.status(401).json({ error: 'Too many incorrect attempts. Please start again.' });
      }
      return res.status(401).json({ error: 'Incorrect code.' });
    }

    await pool.query('UPDATE admin_users SET password_hash = $1 WHERE id = $2;', [
      req.session.pwdOtpNewPasswordHash,
      req.session.adminUserId,
    ]);
    clearChangePasswordOtpSession(req.session);
    res.json({ ok: true });
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

router.get('/me', async (req, res, next) => {
  try {
    if (!req.session || !req.session.adminUserId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const result = await pool.query('SELECT email, username FROM admin_users WHERE id = $1;', [req.session.adminUserId]);
    const user = result.rows[0];
    if (!user) {
      // Deleted after this session was issued.
      return req.session.destroy(() => res.status(401).json({ error: 'Not authenticated' }));
    }
    res.json({
      email: user.email,
      username: user.username,
      role: req.session.adminRole || 'super_admin',
      mustChangePassword: !!req.session.mustChangePassword,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
