const { pool } = require('./db');

// pdf_books is 293+ rows — small enough to hold in memory rather than
// re-querying per catalogue cell. Memoized for the process lifetime, but
// invalidated (see invalidatePdfBooksIndex) whenever the admin PDF Books
// CRUD writes to the table, so the catalogue's link resolution doesn't
// serve stale data until a restart.
let cachedIndexPromise = null;

async function loadPdfBooksIndex() {
  const result = await pool.query(
    `SELECT link_prefix, link_book_code, link_url, link_status
     FROM pdf_books
     WHERE link_prefix IS NOT NULL AND link_book_code IS NOT NULL;`
  );
  const index = new Map();
  for (const row of result.rows) {
    const key = `${row.link_prefix.toUpperCase()}|${row.link_book_code.toUpperCase()}`;
    if (!index.has(key)) index.set(key, row);
  }
  return index;
}

function getPdfBooksIndex() {
  if (!cachedIndexPromise) cachedIndexPromise = loadPdfBooksIndex();
  return cachedIndexPromise;
}

function invalidatePdfBooksIndex() {
  cachedIndexPromise = null;
}

module.exports = { getPdfBooksIndex, invalidatePdfBooksIndex };
