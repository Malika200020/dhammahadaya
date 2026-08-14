// Seeds an admin_users row. There is no public signup endpoint by design
// (build-spec §19: "correct auth practices for admin login/signup") — new
// admin accounts are created by whoever already has server access, via
// this script.
//
// Usage: node scripts/create-admin-user.js <email> <password>

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

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

  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  const passwordHash = await bcrypt.hash(password, 12);
  await client.query(
    `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;`,
    [email.toLowerCase().trim(), passwordHash]
  );

  console.log(`Admin user ready: ${email}`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
