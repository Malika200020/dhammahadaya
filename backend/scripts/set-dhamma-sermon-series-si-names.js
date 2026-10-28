// One-time content fix (client request, 2026-10): video_series.name_si held
// the English name for all 6 Dhamma Sermon series (seeded that way — see
// scripts/migrate.js's DHAMMA_SERMON_SERIES array, which only ever had one
// name per series). name_en already holds the correct English text, so
// this only touches name_si. Best-effort Sinhala translations/transliterations
// — editable anytime via Admin → Dhamma Sermon Series if the client wants
// different wording. Idempotent (safe to re-run): always sets name_si to
// the same fixed value per slug.
//
// Usage: node scripts/set-dhamma-sermon-series-si-names.js

const { pool } = require('../src/db');

const NAMES_SI = {
  'australia-dhamma-sermons': 'ඕස්ට්‍රේලියා ධර්ම දේශනා',
  'calgary-dhamma-sermons': 'කැල්ගරි ධර්ම දේශනා',
  'katina-pinkam-dhamma-sermons': 'කඨින පිංකම් ධර්ම දේශනා',
  'london-dhamma-sermons': 'ලන්ඩන් ධර්ම දේශනා',
  'sadaham-sakmana-dhamma-sermons': 'සඳහම් සක්මන ධර්ම දේශනා',
  'the-buddhist-tv-dhamma-sermon': 'The Buddhist TV ධර්ම දේශනාව',
};

async function main() {
  for (const [slug, nameSi] of Object.entries(NAMES_SI)) {
    const result = await pool.query('UPDATE video_series SET name_si = $1 WHERE slug = $2 RETURNING slug;', [nameSi, slug]);
    console.log(result.rowCount ? `Updated: ${slug}` : `Not found (skipped): ${slug}`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
