// Seeds an admin_users row. There is no public signup endpoint by design
// (build-spec §19: "correct auth practices for admin login/signup") — new
// admin accounts are created by whoever already has server access, via
// this script.
//
// Usage: node scripts/create-admin-user.js <email> <password>
//
// Reuses ../src/db.js's own `pool` (client request, 2026-09: "make sure it
// will work on the live web application as well") rather than opening a
// separate raw connection — that pool already picks DATABASE_URL (what
// Neon/production sets) over the discrete PG* vars (local dev only) and
// handles the TLS quirks hosted Postgres needs, so this script connects
// exactly the same way the app itself does in whichever environment it's
// run in, instead of drifting out of sync with that logic over time.

const bcrypt = require('bcryptjs');
const { pool } = require('../src/db');

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: node scripts/create-admin-user.js <email> <password>');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;`,
    [email.toLowerCase().trim(), passwordHash]
  );

  console.log(`Admin user ready: ${email}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
