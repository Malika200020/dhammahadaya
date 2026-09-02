// Imports the 6 Buddha Puja videos that live on page 2 of the live site's
// gallery (https://dhammahadaya.net/buddha-puja/ — "1 of 2" pagination),
// which weren't part of the original migration (only page 1's 12 sample
// rows were captured in docs/Dhammahadaya.net.txt). Scraped the same way
// as scrape-dhamma-sermons.js: the live YotuWP gallery renders nothing in
// raw HTML, so a real browser + its own AJAX pagination endpoint was used
// to reach page 2. Continues the existing "order" sequence (1-12 already
// in the table) at 13.
//
// Usage: node scripts/import-buddha-puja-page2.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

const PAGE_2_VIDEOS = [
  { youtube_id: 'ODkRxm0gNJg', title_si: '2025 මැදින්' },
  { youtube_id: 'Z-xZwA9KNt8', title_si: '2025 බක්' },
  { youtube_id: 'N4ITFVnJu2E', title_si: '2024 බක්' },
  { youtube_id: 'r8RY7rJzhnE', title_si: '2024 පොසොන්' },
  { youtube_id: '1kc7GdGWKfc', title_si: '2024 නවම්' },
  { youtube_id: 'hb3zelUpLDg', title_si: '2024 දුරුතු' },
];

async function main() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  const existing = await client.query("SELECT max(\"order\")::int AS max_order FROM videos WHERE section = 'buddha_puja';");
  let order = (existing.rows[0].max_order || 0) + 1;

  let inserted = 0;
  for (const video of PAGE_2_VIDEOS) {
    const dup = await client.query("SELECT id FROM videos WHERE section = 'buddha_puja' AND youtube_id = $1;", [video.youtube_id]);
    if (dup.rows.length > 0) {
      console.log(`Skipping ${video.youtube_id} (${video.title_si}) — already present.`);
      continue;
    }
    await client.query(
      `INSERT INTO videos (section, youtube_id, title_si, "order") VALUES ('buddha_puja', $1, $2, $3);`,
      [video.youtube_id, video.title_si, order]
    );
    order++;
    inserted++;
  }

  console.log(`Inserted ${inserted} videos.`);
  await client.end();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exitCode = 1;
});
