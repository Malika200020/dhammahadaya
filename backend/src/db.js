const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool, types } = require('pg');

// DATE columns (oid 1082) are calendar dates with no time/timezone
// component, but pg's default parser turns them into a local-midnight JS
// Date — which then serializes to a UTC ISO string that can land on the
// previous day depending on the server's timezone offset (confirmed: a
// booking for 2026-09-30 round-tripped as "2026-09-29" in Sri Lanka's
// UTC+5:30). Keep DATE columns as plain 'YYYY-MM-DD' strings instead.
types.setTypeParser(1082, (val) => val);

// DATABASE_URL (what Neon and most hosted Postgres providers hand you as a
// single connection string) takes priority when set; falls back to the
// discrete PG* vars for local dev against a plain local Postgres. Hosted
// Postgres providers require TLS and commonly present a cert not in the
// default trust store, so `rejectUnauthorized: false` is needed — the
// connection itself is still encrypted, this only skips CA verification.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    });

module.exports = { pool };
