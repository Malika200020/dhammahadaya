// One-time migration ahead of hosting on Render (whose filesystem doesn't
// persist local uploads across deploys/restarts, same underlying reason
// Cloudinary was adopted for new uploads — see storage/cloudinaryStorage.js).
// This covers everything saved *before* that switch: 224 files still
// sitting in backend/uploads/ (git-ignored — they'd simply be missing on
// any server this repo is deployed to), referenced by /uploads/... URLs in
// three places: gallery_images.image_url, pohoya_calendar.image_url, and
// in-content <img src="/uploads/...">/<a href="/uploads/..."> tags inside
// entries.body.
//
// For each distinct local file still referenced anywhere: read it off
// disk, upload it via the storage abstraction (STORAGE_DRIVER=cloudinary
// must already be set — this reuses the exact same saveFile() the app
// uses for new uploads, not a separate one-off Cloudinary call), then
// rewrite every reference to the resulting Cloudinary URL. entries.body
// gets the same single-pass string-replace treatment already used by
// fix-in-content-dhammahadaya-links.js.
//
// Usage: node scripts/migrate-local-uploads-to-cloudinary.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const storage = require('../src/storage');
const { UPLOAD_DIR } = require('../src/storage/localStorage');

function guessMimetype(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.pdf') return 'application/pdf';
  return 'image/jpeg';
}

async function main() {
  if ((process.env.STORAGE_DRIVER || 'local') !== 'cloudinary') {
    throw new Error('Set STORAGE_DRIVER=cloudinary in backend/.env before running this migration.');
  }

  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  // 1. Collect every distinct /uploads/<file> reference across all three
  // locations, and remember which rows need rewriting.
  const galleryRows = (await client.query("SELECT id, image_url FROM gallery_images WHERE image_url LIKE '/uploads/%'")).rows;
  const calendarRows = (await client.query("SELECT year, image_url FROM pohoya_calendar WHERE image_url LIKE '/uploads/%'")).rows;
  const entryRows = (await client.query("SELECT id, body FROM entries WHERE body LIKE '%/uploads/%'")).rows;

  const localUrlRe = /\/uploads\/[A-Za-z0-9._-]+/g;
  const distinctUrls = new Set();
  for (const r of galleryRows) distinctUrls.add(r.image_url);
  for (const r of calendarRows) distinctUrls.add(r.image_url);
  for (const r of entryRows) {
    let m;
    localUrlRe.lastIndex = 0;
    while ((m = localUrlRe.exec(r.body))) distinctUrls.add(m[0]);
  }
  console.log(
    `Found ${distinctUrls.size} distinct local files referenced (${galleryRows.length} gallery rows, ${calendarRows.length} calendar rows, ${entryRows.length} entry rows).`
  );

  // 2. Upload each to Cloudinary.
  const replacements = new Map(); // old '/uploads/xyz.jpg' -> new Cloudinary url
  let done = 0;
  let failed = 0;
  for (const oldUrl of distinctUrls) {
    const filename = oldUrl.replace('/uploads/', '');
    const filePath = path.join(UPLOAD_DIR, filename);
    try {
      const buffer = fs.readFileSync(filePath);
      const { url: newUrl } = await storage.saveFile(buffer, filename, guessMimetype(filename));
      replacements.set(oldUrl, newUrl);
      done++;
    } catch (err) {
      failed++;
      console.error(`  FAILED for ${oldUrl}: ${err.message}`);
    }
  }
  console.log(`Uploaded ${done}/${distinctUrls.size} files to Cloudinary (${failed} failed).\n`);

  if (failed > 0) {
    console.log('Refusing to rewrite the database while some uploads failed — fix the failures above and re-run.');
    await client.end();
    process.exitCode = 1;
    return;
  }

  // 3. Rewrite every reference.
  let galleryUpdated = 0;
  for (const r of galleryRows) {
    const newUrl = replacements.get(r.image_url);
    if (newUrl) {
      await client.query('UPDATE gallery_images SET image_url = $1 WHERE id = $2', [newUrl, r.id]);
      galleryUpdated++;
    }
  }
  let calendarUpdated = 0;
  for (const r of calendarRows) {
    const newUrl = replacements.get(r.image_url);
    if (newUrl) {
      await client.query('UPDATE pohoya_calendar SET image_url = $1 WHERE year = $2', [newUrl, r.year]);
      calendarUpdated++;
    }
  }
  let entriesUpdated = 0;
  for (const r of entryRows) {
    let newBody = r.body;
    for (const [oldUrl, newUrl] of replacements) {
      newBody = newBody.split(`"${oldUrl}"`).join(`"${newUrl}"`);
    }
    if (newBody !== r.body) {
      await client.query('UPDATE entries SET body = $1 WHERE id = $2', [newBody, r.id]);
      entriesUpdated++;
    }
  }

  console.log(`Updated ${galleryUpdated} gallery_images rows, ${calendarUpdated} pohoya_calendar rows, ${entriesUpdated} entries rows.`);
  await client.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exitCode = 1;
});
