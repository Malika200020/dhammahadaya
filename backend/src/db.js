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

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

module.exports = { pool };
