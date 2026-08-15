// Imports backend/previous_system_files/pdf-books.csv (293 PDF download
// links) into Postgres, deriving a (link_prefix, link_book_code) pair from
// each title for cross-referencing against the Tripitaka catalogue's
// embedded PDF reference codes (see docs/data-notes.md and the catalogue
// route for how that cross-reference is used).
//
// Titles that carry a code look like "SP_DN1_Dighanikaya 01 – ..." or
// "PA06_DN1_Seelakkandhavagga_Attakatha – ..." — a letter prefix, an
// optional sequence number, then the book code (DN1, VP1, MN2, ...). The
// catalogue's own embedded codes sometimes omit that sequence number
// (e.g. "SA_DN1" rather than "SA06_DN1"), so matching is done on
// (prefix, bookCode) and ignores the number in between — see
// extractReference() in backend/src/routes/tripitaka-catalogue.js, which
// uses the same regex.
//
// Titles from sections that don't use this coding scheme (AP De Zoysa
// Tripitaka, PTS/ENG Tripitaka, Other Valuable Books) simply get a null
// link_prefix/link_book_code and are never matched — expected, not a bug.
//
// This only ever replaces rows tagged source='legacy_import' — it refuses
// to run at all if any source='admin' row exists (admin-created or
// admin-edited, see backend/src/routes/admin-pdf-books.js), so it can't
// silently wipe real admin work. The table itself is owned by
// scripts/migrate.js (CREATE TABLE IF NOT EXISTS) — run that first.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { extractLinkCode } = require('../src/pdfBookCode');

const CSV_PATH = path.join(__dirname, '..', 'previous_system_files', 'pdf-books.csv');

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else cur += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

async function main() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = raw.split(/\r\n|\n/).filter((l) => l.length > 0);
  const header = parseCsvLine(lines[0]);
  const expectedHeader = ['category', 'section', 'subsection', 'title', 'link_url', 'link_status'];
  if (header.join(',') !== expectedHeader.join(',')) {
    throw new Error(`Unexpected pdf-books.csv header: ${header.join(', ')}`);
  }

  const rows = lines.slice(1).map(parseCsvLine);
  console.log('Rows to import:', rows.length);

  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  const adminRows = await client.query(`SELECT count(*) FROM pdf_books WHERE source = 'admin';`);
  const adminRowCount = Number(adminRows.rows[0].count);
  if (adminRowCount > 0) {
    console.error(
      `Refusing to run: ${adminRowCount} pdf_books row(s) are admin-added/edited (source='admin'). ` +
        `Re-importing the legacy CSV would silently overwrite them. If you really intend to reset ` +
        `everything to the original CSV, back up/export those rows first, then delete them (or run ` +
        `\`DELETE FROM pdf_books WHERE source = 'admin';\`) before re-running this script.`
    );
    await client.end();
    process.exitCode = 1;
    return;
  }

  await client.query(`DELETE FROM pdf_books WHERE source = 'legacy_import';`);

  let normalizedFieldCount = 0;
  let matchedCodeCount = 0;
  const params = [];
  const valueRows = [];
  for (const [category, section, subsection, title, linkUrl, linkStatus] of rows) {
    const normalized = [category, section, subsection, title, linkUrl, linkStatus].map((v) => {
      const n = v.normalize('NFC');
      if (n !== v) normalizedFieldCount++;
      return n;
    });
    const [nCategory, nSection, nSubsection, nTitle, nLinkUrl, nLinkStatus] = normalized;

    const { linkPrefix, linkBookCode } = extractLinkCode(nTitle);
    if (linkPrefix) matchedCodeCount++;

    const rowValues = [nCategory, nSection, nSubsection, nTitle, nLinkUrl, nLinkStatus, linkPrefix, linkBookCode, 'legacy_import'];
    const placeholders = rowValues.map((_, idx) => `$${params.length + idx + 1}`);
    valueRows.push(`(${placeholders.join(', ')})`);
    params.push(...rowValues);
  }
  await client.query(
    `INSERT INTO pdf_books (category, section, subsection, title, link_url, link_status, link_prefix, link_book_code, source)
     VALUES ${valueRows.join(', ')};`,
    params
  );

  await client.query('ANALYZE pdf_books;');

  const countRes = await client.query(`SELECT count(*) FROM pdf_books WHERE source = 'legacy_import';`);
  console.log('Imported rows:', countRes.rows[0].count, '(expected 293)');
  console.log('Rows with a derived link_prefix/link_book_code:', matchedCodeCount, '(expected 161)');
  console.log('Fields needing NFC normalization:', normalizedFieldCount);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
