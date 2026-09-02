// Imports the JSON produced by scrape-important-articles.js into the real
// `entries` table (type = 'important_article'). Kept as a separate step
// from scraping deliberately, so the JSON can be spot-checked for encoding
// correctness before anything touches the database.
//
// published_at is synthesized (the source pages don't display real publish
// dates, same situation as Ape Budu Hamuduruwo) as a strictly *decreasing*
// sequence keyed to the scraped listing position `n` — post 1 (first in the
// live site's reading order) gets the newest date, post 150 the oldest, one
// day apart, ending 2017-05-03 (same stable anchor used for Ape Budu
// Hamuduruwo — harmless to reuse since sorting is always scoped to a single
// `type`).
//
// Direction matters (see import-ape-budu-hamuduruwo.js for the same note):
// the listing sorts by published_at DESC, so post 1 must sort first
// (newest) to preserve the live site's reading order.
//
// Usage: node scripts/import-important-articles.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const JSON_PATH = path.join(__dirname, 'important-articles-scraped.json');
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

  const existing = await client.query("SELECT count(*)::int AS n FROM entries WHERE type = 'important_article';");
  if (existing.rows[0].n > 0) {
    console.error(`Refusing to import: entries already has ${existing.rows[0].n} important_article rows. Delete them first if you want to re-import.`);
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
       VALUES ('important_article', $1, $2, $3, $4, $5);`,
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
