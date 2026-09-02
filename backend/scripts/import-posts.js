// Imports the JSON produced by scrape-posts.js into the real `entries`
// table (type = 'newsletter'). Kept as a separate step from scraping
// deliberately, so the JSON can be spot-checked for encoding correctness
// before anything touches the database.
//
// published_at is synthesized (the source pages don't display real publish
// dates, same situation as Ape Budu Hamuduruwo / Important Articles) as a
// strictly *decreasing* sequence keyed to the scraped listing position `n`
// — post 1 (newest, first in the live site's reading order) gets the
// newest date, the oldest post gets the oldest date, one day apart, ending
// 2017-05-03 (same stable anchor reused across all three migrations —
// harmless since sorting is always scoped to a single `type`).
//
// Refuses to run if 'newsletter' rows already exist, same guard as the
// other import scripts — as of this migration the only existing rows are 3
// placeholder/test fixtures (bodies literally read "පූර්ණ පෙළ මෙහි දැක්වේ"
// / "full text shown here"), not real content, so they must be deleted
// first with a plain DELETE before running this.
//
// Usage: node scripts/import-posts.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const JSON_PATH = path.join(__dirname, 'posts-scraped.json');
const OLDEST_DATE = new Date('2017-05-03T00:00:00Z');

async function main() {
  const { results, failures } = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log(`Loaded ${results.length} scraped entries (${failures.length} failures on record).`);

  const maxN = results.reduce((max, e) => Math.max(max, e.n), 0);

  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  const existing = await client.query("SELECT count(*)::int AS n FROM entries WHERE type = 'newsletter';");
  if (existing.rows[0].n > 0) {
    console.error(`Refusing to import: entries already has ${existing.rows[0].n} newsletter rows. Delete them first if you want to re-import.`);
    await client.end();
    process.exitCode = 1;
    return;
  }

  results.sort((a, b) => a.n - b.n);

  let inserted = 0;
  for (const entry of results) {
    const publishedAt = new Date(OLDEST_DATE.getTime() + (maxN - entry.n) * 24 * 60 * 60 * 1000);
    await client.query(
      `INSERT INTO entries (type, title_si, excerpt, body, published_at, "order")
       VALUES ('newsletter', $1, $2, $3, $4, $5);`,
      [entry.title, entry.excerpt, entry.body, publishedAt.toISOString(), entry.n]
    );
    inserted++;
  }

  console.log(`Inserted ${inserted} entries.`);
  if (failures.length) {
    console.log(`Note: ${failures.length} source pages failed to scrape and were NOT imported: ${failures.map((f) => f.n).join(', ')}`);
  }
  await client.end();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exitCode = 1;
});
