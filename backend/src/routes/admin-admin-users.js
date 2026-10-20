const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const router = express.Router();

// Mounted behind requireAdminAuth + requireSuperAdmin in app.js. Scoped to
// normal admins only — super admins are seeded via scripts/create-admin-user.js
// (per the client's spec, "seeded" accounts, not UI-managed), so this list
// never shows or touches role = 'super_admin' rows.

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, username, must_change_password, created_at FROM admin_users
       WHERE role = 'admin' ORDER BY created_at DESC;`
    );
    res.json({ admins: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    const normalizedUsername = String(username).toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO admin_users (username, password_hash, role, must_change_password)
       VALUES ($1, $2, 'admin', true)
       RETURNING id, username, must_change_password, created_at;`,
      [normalizedUsername, passwordHash]
    );
    res.status(201).json({ admin: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username is already taken.' });
    }
    next(err);
  }
});

async function findNormalAdmin(id) {
  const result = await pool.query(`SELECT id, role FROM admin_users WHERE id = $1;`, [id]);
  const row = result.rows[0];
  return row && row.role === 'admin' ? row : null;
}

router.post('/:id/reset-password', async (req, res, next) => {
  try {
    const target = await findNormalAdmin(req.params.id);
    if (!target) return res.status(404).json({ error: 'Not found' });
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    // Forces them to change it again on next login — consistent with how a
    // freshly-created account behaves, and means the super admin doesn't
    // have to separately communicate a permanent password.
    await pool.query('UPDATE admin_users SET password_hash = $1, must_change_password = true WHERE id = $2;', [
      passwordHash,
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const target = await findNormalAdmin(req.params.id);
    if (!target) return res.status(404).json({ error: 'Not found' });
    await pool.query('DELETE FROM admin_users WHERE id = $1;', [req.params.id]);
    // Kills any session(s) they're currently using immediately, rather than
    // leaving a deleted account logged in for up to 7 days (the session
    // cookie's max age) until it naturally expires.
    await pool.query(`DELETE FROM session WHERE sess::jsonb ->> 'adminUserId' = $1;`, [String(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
