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

  // video_series: the six Dhamma Sermons series (build-spec §9). Buddha
  // Puja isn't a "series" — it's a single section of `videos`, so
  // videos.series_slug is only ever set for section='dhamma_sermon'.
  await client.query(`
    CREATE TABLE IF NOT EXISTS video_series (
      slug TEXT PRIMARY KEY,
      name_si TEXT NOT NULL,
      name_en TEXT,
      "order" INTEGER NOT NULL DEFAULT 0
    );
  `);
  const DHAMMA_SERMON_SERIES = [
    ['australia-dhamma-sermons', 'Australia Dhamma Sermons', 1],
    ['calgary-dhamma-sermons', 'Calgary Dhamma Sermons', 2],
    ['katina-pinkam-dhamma-sermons', 'Katina Pinkam Dhamma Sermons', 3],
    ['london-dhamma-sermons', 'London Dhamma Sermons', 4],
    ['sadaham-sakmana-dhamma-sermons', 'Sadaham Sakmana Dhamma Sermons', 5],
    ['the-buddhist-tv-dhamma-sermon', 'The Buddhist TV Dhamma Sermon', 6],
  ];
  for (const [slug, nameEn, order] of DHAMMA_SERMON_SERIES) {
    await client.query(
      `INSERT INTO video_series (slug, name_si, name_en, "order") VALUES ($1, $2, $2, $3)
       ON CONFLICT (slug) DO NOTHING;`,
      [slug, nameEn, order]
    );
  }

  // videos: shared by Dhamma Sermons (§9, scoped to a series) and Buddha
  // Puja (§12, its own section with no series — video_type/year are its
  // extra dimensions, speaker is a sermon-only dimension).
  await client.query(`
    CREATE TABLE IF NOT EXISTS videos (
      id SERIAL PRIMARY KEY,
      section TEXT NOT NULL CHECK (section IN ('dhamma_sermon', 'buddha_puja')),
      series_slug TEXT REFERENCES video_series(slug) ON DELETE RESTRICT,
      title_si TEXT NOT NULL,
      title_en TEXT,
      youtube_id TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      year INTEGER,
      speaker TEXT,
      video_type TEXT CHECK (video_type IN ('full_moon', 'gilanpasa')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT videos_series_slug_matches_section CHECK (
        (section = 'dhamma_sermon' AND series_slug IS NOT NULL) OR
        (section = 'buddha_puja' AND series_slug IS NULL)
      )
    );
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_videos_section_series_order
      ON videos (section, series_slug, "order");
  `);

  // gallery_images: generic admin-uploaded photo gallery, not specific to
  // Buddha Puja — `gallery` discriminates the section (buddha_puja now;
  // katina, about later per build-spec §11/§14), `gallery_key` scopes
  // within it where needed (e.g. Katina's per-year galleries).
  await client.query(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id SERIAL PRIMARY KEY,
      gallery TEXT NOT NULL,
      gallery_key TEXT,
      image_url TEXT NOT NULL,
      image_date DATE,
      caption TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_key_order
      ON gallery_images (gallery, gallery_key, "order");
  `);

  console.log('Schema is up to date: admin_users, entries, session, video_series, videos, gallery_images.');
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
