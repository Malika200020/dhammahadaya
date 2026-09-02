// Creates the app's own tables (admin_users, entries, session) if they
// don't already exist. Unlike import-legacy-data.js / import-pdf-books.js
// — which DROP+CREATE because they're always regenerated from the source
// files — these tables hold real, ongoing data (admin accounts, sessions,
// content admins create), so this is additive/idempotent only. Safe to
// run repeatedly.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  // DATABASE_URL (Neon/hosted Postgres) takes priority; falls back to the
  // discrete PG* vars for local dev — same rule as backend/src/db.js, so
  // this can run unchanged as a deploy-time step against production.
  const client = process.env.DATABASE_URL
    ? new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    : new Client({
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

  // sponsorship_booking (build-spec §10). "available" is never stored as a
  // row — it's the absence of an active (pending/booked) row for a date, so
  // there's no need for a background job to pre-populate every future
  // calendar date. `declined` isn't in the spec's status list but is added
  // so admin has a way to release a mistakenly-pending date back to
  // available (otherwise a bad request would permanently lock that date).
  // Double-booking is prevented at the DB level, not just in app code: the
  // partial unique index below lets Postgres itself reject a second
  // pending/booked row for the same date, even under a concurrent race
  // between two submissions — the INSERT either succeeds or throws a unique
  // violation (23505) that the route catches and turns into a 409.
  await client.query(`
    CREATE TABLE IF NOT EXISTS sponsorship_booking (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'declined')),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      objective TEXT,
      mailing_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      confirmed_at TIMESTAMPTZ
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_sponsorship_booking_active_date
      ON sponsorship_booking (date) WHERE status IN ('pending', 'booked');
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_sponsorship_booking_status_date
      ON sponsorship_booking (status, date);
  `);

  // meditation_application (build-spec §13). The 7-day max stay is enforced
  // in the route (a CHECK using date arithmetic would work too, but the
  // route already has to validate everything else about the submission, so
  // keeping the one time-based rule there avoids splitting validation logic
  // across two places for no real safety gain — unlike the sponsorship
  // double-booking guard, there's no concurrent-write race here to defend
  // against at the DB level).
  await client.query(`
    CREATE TABLE IF NOT EXISTS meditation_application (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      from_date DATE NOT NULL,
      to_date DATE NOT NULL,
      experience TEXT NOT NULL CHECK (experience IN ('yes', 'no')),
      meditation_types TEXT,
      previous_teachers TEXT,
      current_diseases TEXT,
      agreed BOOLEAN NOT NULL CHECK (agreed = true),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // katina_year (build-spec §11). `organizers` is just a flat list of names
  // (nothing in the spec gives them further structure), so a Postgres array
  // column is enough — no need for a separate organizers table. The photo
  // gallery reuses gallery_images from step 7 via gallery='katina',
  // gallery_key=<year>, exactly the per-year scoping it was built for.
  await client.query(`
    CREATE TABLE IF NOT EXISTS katina_year (
      year INTEGER PRIMARY KEY,
      organizers TEXT[] NOT NULL DEFAULT '{}'
    );
  `);

  // pohoya_calendar (build-spec §16) — `rows` matches the spec's own data
  // model shape (an array of {month_si_en, date, weekday, poya}) so it's
  // stored as JSONB rather than a normalized child table; each year's table
  // is always read/written as a whole, never queried row-by-row.
  await client.query(`
    CREATE TABLE IF NOT EXISTS pohoya_calendar (
      year INTEGER PRIMARY KEY,
      rows JSONB NOT NULL,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  const seedYears = [
    [2025, require('../src/content/pohoyaCalendar2025.json')],
    [2026, require('../src/content/pohoyaCalendar2026.json')],
  ];
  for (const [year, rows] of seedYears) {
    await client.query(
      `INSERT INTO pohoya_calendar (year, rows, image_url) VALUES ($1, $2, NULL)
       ON CONFLICT (year) DO NOTHING;`,
      [year, JSON.stringify(rows)]
    );
  }

  // special_thanks (build-spec §17.2). `donors` is a flat name list, same
  // reasoning as katina_year.organizers — no structure beyond a name is
  // given for any donor. Seeded from the source table's Section/Purpose
  // columns; `donors` seeds empty because the source only lists notable
  // donor names as "repeated across sections" without saying which donor
  // belongs to which specific section — inventing that mapping would
  // misattribute real people's real contributions, so it's left for admin
  // to fill in correctly.
  await client.query(`
    CREATE TABLE IF NOT EXISTS special_thanks (
      id SERIAL PRIMARY KEY,
      section_en TEXT,
      section_si TEXT NOT NULL,
      purpose TEXT,
      donors TEXT[] NOT NULL DEFAULT '{}',
      "order" INTEGER NOT NULL DEFAULT 0
    );
  `);
  const SPECIAL_THANKS_SECTIONS = [
    ['Offering of Dhammahadaya Senasanaya to the Maha Sanga', 'ධම්මහදය සේනාසනය පූජා කිරීම', 'Land/monastery offering'],
    ['Sima Malakaya & Vihara Puja Ceremony', 'සිමා මාලකය සහ විහාරය පූජා කිරීම', 'Sīmā & vihāra ceremony'],
    ['Supply of Drinking Water', 'පානිය ජලය ලබාදීම', 'Drinking water'],
    ['Donation of Vehicle', 'වාහනය පූජා කිරීම', 'Vehicle donation'],
    ['Residential two-storied Kuti with Buddha Kuti', 'බුදු කුටිය සහිත නේවාසික දෙමහල් කුටිය', 'Residential kuti'],
    ['Offering the Statue', 'පිළිම වහන්සේ පූජා කිරීම', 'Buddha statue'],
    [null, 'ආගන්තුක ස්වාමීන් වහන්සේලා සඳහා කුටිය', "Guest monks' kuti"],
  ];
  const existingSpecialThanks = await client.query('SELECT count(*) FROM special_thanks;');
  if (Number(existingSpecialThanks.rows[0].count) === 0) {
    for (let i = 0; i < SPECIAL_THANKS_SECTIONS.length; i++) {
      const [sectionEn, sectionSi, purpose] = SPECIAL_THANKS_SECTIONS[i];
      await client.query(
        `INSERT INTO special_thanks (section_en, section_si, purpose, "order") VALUES ($1, $2, $3, $4);`,
        [sectionEn, sectionSi, purpose, i]
      );
    }
  }

  // static_document (build-spec §17.3/§17.4) — a generic single-record
  // rich-text page, reused for both Honorable Tribute and Siri Sugatha
  // Sasana Bandumathi rather than two near-identical tables. Seeded with
  // only the known structured facts (recipient, honor, date, issuer) as a
  // plain placeholder, NOT a fabricated formal letter/certificate — the
  // source note only summarizes these documents, it doesn't contain their
  // actual verbatim prose, so admin needs to supply the real text.
  await client.query(`
    CREATE TABLE IF NOT EXISTS static_document (
      slug TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_si TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  const STATIC_DOCUMENTS = [
    [
      'honorable-tribute',
      'Honorable tribute',
      'ගෞරව උපහාරයයි',
      '<p><em>Full tribute text pending — to be supplied by the monastery.</em></p>' +
        '<p>Recipient: Most Venerable Karagoda Uyangoda Maitreya Murthi Maha Nayaka Thero (Amarapura Maha Nikaya)</p>',
    ],
    [
      'siri-sugatha-sasana-bandumathi',
      'Siri Sugatha Sasana Bandumathi',
      'සිරි සුගත ශාසන බන්දුමතී',
      '<p><em>Full certificate text pending — to be supplied by the monastery.</em></p>' +
        '<p>Recipient: Dr. Shiryani Abeysuriya, Rajagiriya</p>' +
        '<p>Honor: Siri Sugatha Sasana Bandumathi</p>' +
        '<p>Date/place: 3 May 2025, Dhammahadaya Senasanaya, Balangoda</p>' +
        '<p>Conferred by: Most Ven. Agalabada Piyasiri Maha Nayaka Thero and Most Ven. Galpatha Sumana Anunayaka Thero</p>',
    ],
  ];
  for (const [slug, titleEn, titleSi, body] of STATIC_DOCUMENTS) {
    await client.query(
      `INSERT INTO static_document (slug, title_en, title_si, body) VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO NOTHING;`,
      [slug, titleEn, titleSi, body]
    );
  }

  // inquiry_message + newsletter_subscriber (build-spec §4.10/§4.11) — the
  // Contact Us page's inquiry form and newsletter signup. These don't exist
  // anywhere yet (the home page they were originally specced on hasn't been
  // built), so they're built fresh here as the first real implementation;
  // the home page will reuse the same components/endpoints later.
  await client.query(`
    CREATE TABLE IF NOT EXISTS inquiry_message (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscriber (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // pdf_books (build-spec §8) — previously owned entirely by
  // scripts/import-pdf-books.js, which DROPped and recreated this table on
  // every run. Moved here so it follows the same idempotent
  // CREATE-TABLE-IF-NOT-EXISTS pattern as every other admin-writable
  // table, and gains a `source` column so the importer can tell untouched
  // legacy CSV rows apart from admin-added/edited ones and refuse to run
  // if any admin rows exist, instead of silently wiping them (see
  // scripts/import-pdf-books.js). New rows default to 'admin' — anything
  // not explicitly tagged as a legacy import is treated as admin-owned.
  await client.query(`
    CREATE TABLE IF NOT EXISTS pdf_books (
      id SERIAL PRIMARY KEY,
      category TEXT,
      section TEXT,
      subsection TEXT,
      title TEXT,
      link_url TEXT,
      link_status TEXT,
      link_prefix TEXT,
      link_book_code TEXT,
      source TEXT NOT NULL DEFAULT 'admin'
    );
  `);
  await client.query(`ALTER TABLE pdf_books ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'admin';`);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_pdf_books_link_ref ON pdf_books (link_prefix, link_book_code);
  `);

  // tripitaka_catalogue (build-spec §6) — previously owned entirely by
  // scripts/import-legacy-data.js, which DROPped and recreated it on every
  // run. Moved here (same reasoning as pdf_books in the admin-security
  // hardening step): now that admin CRUD writes to this table, the
  // importer needs a `source` column to tell untouched legacy rows apart
  // from admin-added/edited ones and refuse to overwrite the latter — see
  // scripts/import-legacy-data.js. New rows default to 'admin'.
  await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS tripitaka_catalogue (
      id SERIAL PRIMARY KEY,
      sutta_name TEXT,
      pitaka TEXT,
      nikaya TEXT,
      vagga TEXT,
      printed_page_no TEXT,
      pdf_page_no TEXT,
      pdf_pali_atthakatha TEXT,
      sinhala_atthakatha TEXT,
      pdf_sinhala_atthakatha TEXT,
      pdf_pali_tika TEXT,
      pali_sinhala_tika TEXT,
      source TEXT NOT NULL DEFAULT 'admin'
    );
  `);
  await client.query(`ALTER TABLE tripitaka_catalogue ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'admin';`);
  for (const col of ['sutta_name', 'nikaya', 'vagga']) {
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_tripitaka_catalogue_${col}_trgm ON tripitaka_catalogue USING GIN (${col} gin_trgm_ops);`
    );
  }

  console.log('Schema is up to date: admin_users, entries, session, video_series, videos, gallery_images, sponsorship_booking, meditation_application, katina_year, pohoya_calendar, special_thanks, static_document, inquiry_message, newsletter_subscriber, pdf_books, tripitaka_catalogue.');
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
