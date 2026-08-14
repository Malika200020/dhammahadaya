function requireAdminAuth(req, res, next) {
  if (!req.session || !req.session.adminUserId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

module.exports = { requireAdminAuth };
