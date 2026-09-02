// Imports Kathina Ceremony data (build-spec §11) scraped from the live
// site's two "eael-advance-tabs" widgets (raw HTTP + cheerio — Elementor
// renders these tabs server-side, unlike the JS-only YotuWP video
// galleries, so no browser automation was needed here):
//   - Widget 1: past years 2017-2025, each tab = organizers list (+ a
//     photo gallery for 2022/2023/2024 only — the other years never had
//     photos uploaded on the live site).
//   - Widget 2: upcoming years 2026-2031, each tab = organizers list
//     (2030/2031 have none assigned yet — expected, not a scraping gap).
// Source files: kathina-extracted.json (organizers per year) and
// kathina-images.json (photo URLs per year), both produced by ad-hoc
// inspection scripts against a raw fetch of https://dhammahadaya.net/kathina-ceremony/.
//
// Gallery photos use the same "-300x200" WordPress thumbnail URL already
// present in the source page (this is a plain grid display, not a
// lightbox — see PhotoGallery.jsx — so no need to resolve full-resolution
// originals, which run ~200x larger).
//
// Usage: node scripts/import-kathina.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ORGANIZERS_BY_YEAR = {
  2017: ['Dr. Shiryani Abeysuriya', 'Mrs. Nirma Jayaweera & family', 'Mrs. Yishani Karunanayake'],
  2018: ['Dr. Shiryani Abeysuriya', 'Mrs. Nirma Jayaweera & family', 'Mrs. Yishani Karunanayake'],
  2019: ['Dr. Thushara & family', 'Dr. W.A.K.M Weerakkody & family'],
  2020: ['Dr. Nimanthi Pathirana & family', 'Mr. Harsha Siriwardena & family'],
  2021: ['Mrs. Nirma Jayaweera & family'],
  2022: ['Mrs. Janitha Palihena & family', 'Mr. Asitha Wijesekera & Mrs. Karmini Wijesekara'],
  2023: ['Mr. Saman Kumara & family', 'Balangoda Hospital Staff'],
  2024: ['Mr. Suranga Jayaweera & family', 'Mr. Chathuranga J Vitharana & family', 'Mr. Upul Sanjeewa & family'],
  2025: ['Mrs. Madhurika Jayawardana', 'Ms. Sandhaya Samaratunga'],
  2026: ['Dr. Shiryani Abeysuriya', 'Mrs. Yishani Karunanayake'],
  2027: ['Mr. Asitha Kodippilikanda & family'],
  2028: ['Mr. Keshara Senadreera & family'],
  2029: ['Mr. Mahi Wellalage & family'],
  2030: [],
  2031: [],
};

async function main() {
  const imagesByYear = JSON.parse(fs.readFileSync(path.join(__dirname, 'kathina-images.json'), 'utf8'));

  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  const existingYears = await client.query('SELECT count(*)::int AS n FROM katina_year;');
  if (existingYears.rows[0].n > 0) {
    console.error(`Refusing to import: katina_year already has ${existingYears.rows[0].n} rows. Delete them first if you want to re-import.`);
    await client.end();
    process.exitCode = 1;
    return;
  }

  let yearsInserted = 0;
  for (const [year, organizers] of Object.entries(ORGANIZERS_BY_YEAR)) {
    await client.query('INSERT INTO katina_year (year, organizers) VALUES ($1, $2);', [Number(year), organizers]);
    yearsInserted++;
  }
  console.log(`Inserted ${yearsInserted} katina_year rows (2017-2031).`);

  let imagesInserted = 0;
  for (const [year, imgs] of Object.entries(imagesByYear)) {
    let order = 1;
    for (const img of imgs) {
      await client.query(
        `INSERT INTO gallery_images (gallery, gallery_key, image_url, "order") VALUES ('katina', $1, $2, $3);`,
        [year, img.src, order]
      );
      order++;
      imagesInserted++;
    }
  }
  console.log(`Inserted ${imagesInserted} gallery_images rows (katina, years ${Object.keys(imagesByYear).join(', ')}).`);

  await client.end();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exitCode = 1;
});
