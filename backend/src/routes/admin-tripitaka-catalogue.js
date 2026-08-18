const express = require('express');
const { pool } = require('../db');
const { CATALOGUE } = require('../config/catalogue');

const router = express.Router();

const DB_COLUMNS = CATALOGUE.columns.map((c) => c.dbColumn);
const COLUMN_META = CATALOGUE.columns.map(({ key, label }) => ({ key, label }));
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Same escaping as the public catalogue/dictionaries search routes — see
// backend/src/routes/tripitaka-catalogue.js.
function escapeLikePattern(raw) {
  return raw.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

// GET /api/admin/tripitaka-catalogue?q=&page=&pageSize= — search+paginate
// over all 11 raw columns (unresolved — the public route's link resolution
// against pdf_books happens only at public-read time, see
// backend/src/routes/tripitaka-catalogue.js; nothing to duplicate here).
router.get('/', async (req, res, next) => {
  try {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
    const query = rawQuery.normalize('NFC').trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE));
    const offset = (page - 1) * pageSize;

    const whereClause = query
      ? `WHERE ${CATALOGUE.searchColumns.map((col) => `${col} ILIKE $1 ESCAPE '\\'`).join(' OR ')}`
      : '';
    const likeParam = query ? `%${escapeLikePattern(query)}%` : null;

    const countSql = `SELECT count(*) FROM tripitaka_catalogue ${whereClause};`;
    const countParams = query ? [likeParam] : [];
    const pageSql = query
      ? `SELECT id, ${DB_COLUMNS.join(', ')}, source FROM tripitaka_catalogue ${whereClause} ORDER BY id LIMIT $2 OFFSET $3;`
      : `SELECT id, ${DB_COLUMNS.join(', ')}, source FROM tripitaka_catalogue ORDER BY id LIMIT $1 OFFSET $2;`;
    const pageParams = query ? [likeParam, pageSize, offset] : [pageSize, offset];

    const [countResult, pageResult] = await Promise.all([
      pool.query(countSql, countParams),
      pool.query(pageSql, pageParams),
    ]);
    const totalRows = Number(countResult.rows[0].count);

    res.json({
      columns: COLUMN_META,
      page,
      pageSize,
      totalRows,
      totalPages: Math.max(1, Math.ceil(totalRows / pageSize)),
      rows: pageResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM tripitaka_catalogue WHERE id = $1;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ row: result.rows[0], columns: COLUMN_META });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.sutta_name || !String(body.sutta_name).trim()) {
      return res.status(400).json({ error: 'sutta_name is required' });
    }
    const values = DB_COLUMNS.map((col) => (body[col] != null ? String(body[col]) : null));
    const placeholders = values.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO tripitaka_catalogue (${DB_COLUMNS.join(', ')}, source)
       VALUES (${placeholders.join(', ')}, 'admin')
       RETURNING *;`,
      values
    );
    res.status(201).json({ row: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.sutta_name || !String(body.sutta_name).trim()) {
      return res.status(400).json({ error: 'sutta_name is required' });
    }
    const values = DB_COLUMNS.map((col) => (body[col] != null ? String(body[col]) : null));
    // Any admin edit reclassifies the row as source='admin' — including a
    // fix to a still-legacy row — so a future re-import (see
    // scripts/import-legacy-data.js) refuses to silently revert it.
    const setClause = DB_COLUMNS.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE tripitaka_catalogue SET ${setClause}, source = 'admin'
       WHERE id = $${values.length + 1}
       RETURNING *;`,
      [...values, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ row: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM tripitaka_catalogue WHERE id = $1 RETURNING id;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
