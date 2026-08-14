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
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});

module.exports = sessionMiddleware;
