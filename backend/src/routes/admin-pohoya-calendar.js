const express = require('express');
const { pool } = require('../db');

const router = express.Router();

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return 'rows must be a non-empty array';
  for (const r of rows) {
    if (!r || typeof r.date !== 'string' || typeof r.weekday !== 'string' || typeof r.poya !== 'string') {
      return 'each row needs date, weekday, and poya strings (month_si_en may be null for a continuation row)';
    }
  }
  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT year, rows, image_url FROM pohoya_calendar ORDER BY year DESC;');
    res.json({ years: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:year', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT year, rows, image_url FROM pohoya_calendar WHERE year = $1;', [req.params.year]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ calendar: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { year, rows, image_url } = req.body || {};
    if (!Number.isInteger(Number(year))) return res.status(400).json({ error: 'A valid year is required' });
    const rowsError = validateRows(rows);
    if (rowsError) return res.status(400).json({ error: rowsError });

    const result = await pool.query(
      `INSERT INTO pohoya_calendar (year, rows, image_url) VALUES ($1, $2, $3) RETURNING *;`,
      [Number(year), JSON.stringify(rows), image_url || null]
    );
    res.status(201).json({ calendar: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'That year already exists' });
    next(err);
  }
});

router.put('/:year', async (req, res, next) => {
  try {
    const { rows, image_url } = req.body || {};
    const rowsError = validateRows(rows);
    if (rowsError) return res.status(400).json({ error: rowsError });

    const result = await pool.query(
      `UPDATE pohoya_calendar SET rows = $1, image_url = $2, updated_at = now()
       WHERE year = $3 RETURNING *;`,
      [JSON.stringify(rows), image_url || null, req.params.year]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ calendar: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:year', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM pohoya_calendar WHERE year = $1 RETURNING year;', [req.params.year]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
