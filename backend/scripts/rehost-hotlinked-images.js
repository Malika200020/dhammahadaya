// Fixes a real bug reported by the user: images migrated from
// dhammahadaya.net (Kathina Ceremony galleries + Sathara Pohoya Calendar
// posters) were stored as direct hotlinks to the live WordPress site.
// dhammahadaya.net has anti-hotlink protection that keys off the request's
// Referer header: a request with no Referer (or one matching its own
// domain) gets the real photo; a request whose Referer is a *different*
// site — exactly what a visitor's browser sends when our page loads
// `<img src="https://dhammahadaya.net/...">` — gets back a 200 OK with a
// 200x200 "Stop! This image was hotlinked" warning PNG instead. Confirmed
// via curl: no-Referer request → real 300x200 JPEG; cross-origin Referer →
// the warning PNG. This is why an earlier `naturalWidth > 0` browser check
// didn't catch it — the warning image is itself a valid, non-zero-sized
// image, just the wrong content.
//
// Fix: download every affected image now (server-to-server fetch, which
// sends no Referer, so it gets the real files) and re-host them through
// the app's own local storage (`backend/uploads/`, same mechanism as
// admin-uploaded photos — see src/storage/localStorage.js), then repoint
// the DB rows at the new local URL. This also makes the migration
// independent of dhammahadaya.net staying up.
//
// Usage: node scripts/rehost-hotlinked-images.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');
const storage = require('../src/storage');

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DhammahadayaMigration/1.0)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  // gallery_images — currently only the Katina galleries hotlink from
  // dhammahadaya.net; scope to that host defensively so this script is
  // safe to re-run later if other galleries get real (non-hotlinked)
  // uploads by then.
  const galleryRows = await client.query(
    "SELECT id, image_url FROM gallery_images WHERE image_url LIKE 'https://dhammahadaya.net/%' ORDER BY id;"
  );
  console.log(`Found ${galleryRows.rows.length} gallery_images rows hotlinking dhammahadaya.net.`);

  let galleryFixed = 0;
  for (const row of galleryRows.rows) {
    try {
      const buffer = await download(row.image_url);
      const originalName = row.image_url.split('/').pop();
      const { url } = await storage.saveFile(buffer, originalName, 'image/jpeg');
      await client.query('UPDATE gallery_images SET image_url = $1 WHERE id = $2;', [url, row.id]);
      galleryFixed++;
      if (galleryFixed % 10 === 0) console.log(`  ${galleryFixed}/${galleryRows.rows.length} done...`);
    } catch (err) {
      console.error(`  FAILED for gallery_images id=${row.id} (${row.image_url}): ${err.message}`);
    }
  }
  console.log(`Re-hosted ${galleryFixed}/${galleryRows.rows.length} gallery images.`);

  // pohoya_calendar — the 2025/2026 calendar poster images.
  const calRows = await client.query(
    "SELECT year, image_url FROM pohoya_calendar WHERE image_url LIKE 'https://dhammahadaya.net/%' ORDER BY year;"
  );
  console.log(`\nFound ${calRows.rows.length} pohoya_calendar rows hotlinking dhammahadaya.net.`);

  let calFixed = 0;
  for (const row of calRows.rows) {
    try {
      const buffer = await download(row.image_url);
      const originalName = row.image_url.split('/').pop();
      const mimetype = originalName.endsWith('.png') ? 'image/png' : 'image/webp';
      const { url } = await storage.saveFile(buffer, originalName, mimetype);
      await client.query('UPDATE pohoya_calendar SET image_url = $1 WHERE year = $2;', [url, row.year]);
      calFixed++;
      console.log(`  ${row.year}: re-hosted.`);
    } catch (err) {
      console.error(`  FAILED for pohoya_calendar year=${row.year} (${row.image_url}): ${err.message}`);
    }
  }
  console.log(`Re-hosted ${calFixed}/${calRows.rows.length} calendar images.`);

  await client.end();
}

main().catch((err) => {
  console.error('Rehost failed:', err);
  process.exitCode = 1;
});
