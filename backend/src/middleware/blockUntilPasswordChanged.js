// Mounted (after requireAdminAuth) on every content/management router in
// app.js — a normal admin who hasn't changed their first-login temporary
// password yet cannot call ANY of those endpoints, not just be steered away
// from them in the UI. Deliberately NOT mounted on the admin-auth router:
// /login, /logout, /me, and /change-password all need to stay reachable
// regardless of this flag (otherwise an admin could never clear it, and the
// frontend could never even find out the flag is set). req.session.
// mustChangePassword is set at login time from admin_users.must_change_password
// (see routes/admin-auth.js).
function blockUntilPasswordChanged(req, res, next) {
  if (req.session.mustChangePassword) {
    return res.status(403).json({ error: 'Password change required', mustChangePassword: true });
  }
  next();
}

module.exports = { blockUntilPasswordChanged };
