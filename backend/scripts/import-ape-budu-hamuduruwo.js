// Imports the JSON produced by scrape-ape-budu-hamuduruwo.js into the real
// `entries` table (type = 'budu_hamuduruwo'). Kept as a separate step from
// scraping deliberately, so the JSON can be spot-checked for encoding
// correctness before anything touches the database.
//
// published_at is synthesized (the source pages don't display real publish
// dates) as a strictly *decreasing* sequence keyed to the scraped post
// number `n` — episode 1 gets the newest date, episode 426 the oldest,
// one day apart, ending 2017-05-03 (the monastery's own founding date per
// aboutContent.js — just a stable, plausible anchor, not a claim about
// when these were actually written).
//
// Direction matters and is easy to get backwards (did, once, while
// building this): both the listing and the prev/next query sort by
// published_at DESC as "newest first", same as newsletters. Since these
// are numbered episodes meant to be read 1→426 in order, episode 1 must
// sort first (newest) so the listing shows them in reading order and so
// the "Next" link (which moves toward older published_at) actually
// advances 1→2→…→426 instead of dead-ending on episode 1.
//
// Usage: node scripts/import-ape-budu-hamuduruwo.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const JSON_PATH = path.join(__dirname, 'ape-budu-hamuduruwo-scraped.json');
const OLDEST_DATE = new Date('2017-05-03T00:00:00Z');
const MAX_N = 426;

async function main() {
  const { results, failures } = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log(`Loaded ${results.length} scraped entries (${failures.length} failures on record).`);

  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  const existing = await client.query("SELECT count(*)::int AS n FROM entries WHERE type = 'budu_hamuduruwo';");
  if (existing.rows[0].n > 0) {
    console.error(`Refusing to import: entries already has ${existing.rows[0].n} budu_hamuduruwo rows. Delete them first if you want to re-import.`);
    await client.end();
    process.exitCode = 1;
    return;
  }

  results.sort((a, b) => a.n - b.n);

  let inserted = 0;
  for (const entry of results) {
    const publishedAt = new Date(OLDEST_DATE.getTime() + (MAX_N - entry.n) * 24 * 60 * 60 * 1000);
    await client.query(
      `INSERT INTO entries (type, title_si, excerpt, body, published_at, "order")
       VALUES ('budu_hamuduruwo', $1, $2, $3, $4, $5);`,
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
