const express = require('express');
const { pool } = require('../db');
const { CATALOGUE } = require('../config/catalogue');
const { getPdfBooksIndex } = require('../pdfBooksIndex');

const router = express.Router();

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Same escaping as the dictionaries route — see backend/src/routes/dictionaries.js.
function escapeLikePattern(raw) {
  return raw.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

// A catalogue cell can hold more than one reference, "/"-separated (e.g.
// "PT14_DN1 - 026 / PT17_DN4 - 107"). Each segment either resolves to a
// real PDF link (found in pdf_books, by (prefix, bookCode)) or doesn't —
// segments that aren't a recognizable code at all (e.g. a bare "-" for "no
// reference yet") just render as their original text with no link.
function extractReferenceSegment(rawSegment, pdfBooksIndex) {
  const text = rawSegment.trim();
  if (!text) return null;
  const cleaned = text.replace(/^"PDF"\s*/i, '').trim();
  const match = cleaned.match(/^([A-Za-z]+)(\d*)_([A-Za-z0-9]+)/);
  if (!match) return { text, url: null };
  const key = `${match[1].toUpperCase()}|${match[3].toUpperCase()}`;
  const found = pdfBooksIndex.get(key);
  return { text, url: found && found.link_url ? found.link_url : null };
}

function resolveLinkableCell(cellText, pdfBooksIndex) {
  if (cellText == null || cellText === '') return [];
  return cellText
    .split('/')
    .map((segment) => extractReferenceSegment(segment, pdfBooksIndex))
    .filter(Boolean);
}

router.get('/search', async (req, res, next) => {
  try {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
    const query = rawQuery.normalize('NFC').trim();

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE)
    );
    const offset = (page - 1) * pageSize;

    const { table, columns, searchColumns } = CATALOGUE;
    const selectColumns = columns.map((c) => c.dbColumn).join(', ');

    const whereClause = query
      ? `WHERE ${searchColumns.map((col) => `${col} ILIKE $1 ESCAPE '\\'`).join(' OR ')}`
      : '';
    const likeParam = query ? `%${escapeLikePattern(query)}%` : null;

    const countSql = `SELECT count(*) FROM ${table} ${whereClause};`;
    const countParams = query ? [likeParam] : [];

    // Ordered by id (original catalogue/import order = canonical Tipitaka
    // reading order: Nikaya -> Vagga -> Sutta), not alphabetically — more
    // useful for a reference catalogue than sorting sutta names A-Z.
    const pageSql = query
      ? `SELECT ${selectColumns} FROM ${table} ${whereClause} ORDER BY id LIMIT $2 OFFSET $3;`
      : `SELECT ${selectColumns} FROM ${table} ORDER BY id LIMIT $1 OFFSET $2;`;
    const pageParams = query ? [likeParam, pageSize, offset] : [pageSize, offset];

    const [pdfBooksIndex, countResult, pageResult] = await Promise.all([
      getPdfBooksIndex(),
      pool.query(countSql, countParams),
      pool.query(pageSql, pageParams),
    ]);

    const totalRows = Number(countResult.rows[0].count);
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

    const rows = pageResult.rows.map((row) => {
      const out = {};
      for (const col of columns) {
        out[col.key] = col.linkable
          ? resolveLinkableCell(row[col.dbColumn], pdfBooksIndex)
          : row[col.dbColumn];
      }
      return out;
    });

    res.json({
      slug: CATALOGUE.slug,
      titleEn: CATALOGUE.titleEn,
      titleSi: CATALOGUE.titleSi,
      columns: columns.map(({ key, label, group, nowrap, sticky }) => ({ key, label, group, nowrap, sticky })),
      query,
      page,
      pageSize,
      totalRows,
      totalPages,
      rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
