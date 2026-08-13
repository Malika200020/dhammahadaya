const express = require('express');
const { pool } = require('../db');
const { getDictionary } = require('../config/dictionaries');

const router = express.Router();

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Escapes ILIKE wildcard characters in user input so a literal "%" or "_"
// typed by a user is searched for literally, not treated as a pattern.
function escapeLikePattern(raw) {
  return raw.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

router.get('/:slug/search', async (req, res, next) => {
  try {
    const dictionary = getDictionary(req.params.slug);
    if (!dictionary) {
      return res.status(404).json({ error: `Unknown dictionary "${req.params.slug}"` });
    }

    const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
    // NFC-normalize the query the same way data was normalized on import
    // (docs/data-notes.md) — otherwise a query typed/pasted in a different
    // normalization form silently fails to match stored text.
    const query = rawQuery.normalize('NFC').trim();

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE)
    );
    const offset = (page - 1) * pageSize;

    const { table, searchColumn, columns } = dictionary;
    const selectColumns = columns.map((c) => c.dbColumn).join(', ');

    const whereClause = query ? `WHERE ${searchColumn} ILIKE $1 ESCAPE '\\'` : '';
    const likeParam = query ? `%${escapeLikePattern(query)}%` : null;

    const countSql = `SELECT count(*) FROM ${table} ${whereClause};`;
    const countParams = query ? [likeParam] : [];

    const pageSql = query
      ? `SELECT ${selectColumns} FROM ${table} ${whereClause} ORDER BY ${searchColumn} LIMIT $2 OFFSET $3;`
      : `SELECT ${selectColumns} FROM ${table} ORDER BY ${searchColumn} LIMIT $1 OFFSET $2;`;
    const pageParams = query ? [likeParam, pageSize, offset] : [pageSize, offset];

    const [countResult, pageResult] = await Promise.all([
      pool.query(countSql, countParams),
      pool.query(pageSql, pageParams),
    ]);

    const totalRows = Number(countResult.rows[0].count);
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

    res.json({
      slug: dictionary.slug,
      titleEn: dictionary.titleEn,
      titleSi: dictionary.titleSi,
      columns: columns.map(({ key, label }) => ({ key, label })),
      query,
      page,
      pageSize,
      totalRows,
      totalPages,
      rows: pageResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
