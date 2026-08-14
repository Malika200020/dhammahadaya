const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM video_series ORDER BY "order" ASC;`);
    res.json({ series: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { slug, name_si, name_en, order } = req.body || {};
    if (!slug || !name_si) return res.status(400).json({ error: 'slug and name_si are required' });
    const result = await pool.query(
      `INSERT INTO video_series (slug, name_si, name_en, "order") VALUES ($1, $2, $3, COALESCE($4, 0)) RETURNING *;`,
      [slug, name_si, name_en || null, order ?? null]
    );
    res.status(201).json({ series: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: `A series with slug "${req.body?.slug}" already exists` });
    next(err);
  }
});

router.put('/:slug', async (req, res, next) => {
  try {
    const { name_si, name_en, order } = req.body || {};
    if (!name_si) return res.status(400).json({ error: 'name_si is required' });
    const result = await pool.query(
      `UPDATE video_series SET name_si = $1, name_en = $2, "order" = COALESCE($3, "order") WHERE slug = $4 RETURNING *;`,
      [name_si, name_en || null, order ?? null, req.params.slug]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ series: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:slug', async (req, res, next) => {
  try {
    const result = await pool.query(`DELETE FROM video_series WHERE slug = $1 RETURNING slug;`, [req.params.slug]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    // videos.series_slug -> video_series.slug is ON DELETE RESTRICT: a
    // series with videos still in it can't be silently wiped out along
    // with them. Surface that as a clear 409, not a raw 500.
    if (err.code === '23503') {
      return res.status(409).json({ error: 'This series still has videos in it. Delete or move them first.' });
    }
    next(err);
  }
});

module.exports = router;
