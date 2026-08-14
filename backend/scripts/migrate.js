// Creates the app's own tables (admin_users, entries, session) if they
// don't already exist. Unlike import-legacy-data.js / import-pdf-books.js
// — which DROP+CREATE because they're always regenerated from the source
// files — these tables hold real, ongoing data (admin accounts, sessions,
// content admins create), so this is additive/idempotent only. Safe to
// run repeatedly.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Entry shape per build-spec §3: the Article-list pattern, shared by
  // Newsletters/Posts, Ape Budu Hamuduruwo, and Important Articles —
  // distinguished only by `type`.
  await client.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('newsletter', 'budu_hamuduruwo', 'important_article')),
      title_si TEXT NOT NULL,
      title_en TEXT,
      excerpt TEXT NOT NULL,
      body TEXT NOT NULL,
      cover_image TEXT,
      published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_entries_type_published_at
      ON entries (type, published_at DESC);
  `);

  // connect-pg-simple's own documented schema for its session store.
  await client.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);
  `);
  await client.query(`
    ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
  `);
  await client.query(`
    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `);

  console.log('Schema is up to date: admin_users, entries, session.');
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
