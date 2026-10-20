const { pool } = require('../db');

// Mounted after requireAdminAuth on the routers that are super-admin-only
// (sponsorship, meditation applications, inquiries, newsletter subscribers,
// admin-user management). Unlike requireAdminAuth, which only checks that a
// session exists (no DB hit, kept cheap since it guards every single
// content-tier request), this re-reads the admin's current role from the
// database on every call instead of trusting a value cached in the session
// at login time — so demoting or deleting an admin takes effect on their
// very next request, not whenever their 7-day session cookie happens to
// expire.
async function requireSuperAdmin(req, res, next) {
  try {
    const result = await pool.query('SELECT role FROM admin_users WHERE id = $1;', [req.session.adminUserId]);
    const role = result.rows[0]?.role;
    if (!role) {
      // The account was deleted after this session was issued.
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireSuperAdmin };
