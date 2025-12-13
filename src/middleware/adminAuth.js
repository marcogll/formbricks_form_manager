function ensureAdminToken(req, res, next) {
  const expectedToken = process.env.ADMIN_API_TOKEN;
  if (!expectedToken) {
    return res.status(503).json({ error: 'Admin token is not configured.' });
  }

  const providedToken = req.header('x-admin-token');
  if (providedToken !== expectedToken) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}

module.exports = ensureAdminToken;
