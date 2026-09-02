const session = require('express-session');
const pgSessionStore = require('connect-pg-simple')(session);
const { pool } = require('./db');

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set (see backend/.env.example)');
}

const sessionMiddleware = session({
  store: new pgSessionStore({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // Frontend (Cloudflare Pages) and backend (Render) live on different
    // subdomains in production, so the admin session cookie is always
    // cross-site there — SameSite=None is required for the browser to send
    // it on those requests, and None requires Secure. Locally, frontend and
    // backend are same-site (via Vite's dev proxy), so Lax is fine and lets
    // this run over plain http in dev without a cert.
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});

module.exports = sessionMiddleware;
