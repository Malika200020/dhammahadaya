// Imports the JSON produced by scrape-dhamma-sermons.js into the real
// `videos` table (section = 'dhamma_sermon'). Kept as a separate step from
// scraping deliberately, so the JSON can be spot-checked before anything
// touches the database.
//
// `order` is the video's position within its own series in the live site's
// display order (1 = first on page 1) — matches how the API/frontend sort
// videos within a series (see routes/videos.js: ORDER BY "order" ASC).
//
// Usage: node scripts/import-dhamma-sermons.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const JSON_PATH = path.join(__dirname, 'dhamma-sermons-scraped.json');

async function main() {
  const series = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  const existing = await client.query("SELECT count(*)::int AS n FROM videos WHERE section = 'dhamma_sermon';");
  if (existing.rows[0].n > 0) {
    console.error(`Refusing to import: videos already has ${existing.rows[0].n} dhamma_sermon rows. Delete them first if you want to re-import.`);
    await client.end();
    process.exitCode = 1;
    return;
  }

  let inserted = 0;
  for (const s of series) {
    if (s.error) {
      console.log(`Skipping ${s.slug}: scrape recorded an error (${s.error})`);
      continue;
    }
    let order = 0;
    for (const v of s.videos) {
      order++;
      await client.query(
        `INSERT INTO videos (section, series_slug, title_si, youtube_id, "order")
         VALUES ('dhamma_sermon', $1, $2, $3, $4);`,
        [s.slug, v.title_si, v.youtube_id, order]
      );
      inserted++;
    }
    console.log(`${s.slug}: inserted ${order} videos.`);
  }

  console.log(`\nTotal inserted: ${inserted}.`);
  await client.end();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exitCode = 1;
});
