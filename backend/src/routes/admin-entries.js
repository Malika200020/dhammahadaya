const express = require('express');
const { pool } = require('../db');
const { ENTRY_TYPES } = require('../config/entryTypes');

const router = express.Router();
const VALID_TYPES = new Set(Object.keys(ENTRY_TYPES));

// GET /api/admin/entries?type=newsletter — admin list view (all entries of
// a type, not just a page of them; the admin table is expected to be
// small enough per type that this is fine).
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;
    if (!VALID_TYPES.has(type)) {
      return res.status(400).json({ error: `type must be one of: ${[...VALID_TYPES].join(', ')}` });
    }
    const result = await pool.query(
      `SELECT id, type, title_si, title_en, excerpt, cover_image, published_at, "order"
       FROM entries WHERE type = $1
       ORDER BY published_at DESC, id DESC;`,
      [type]
    );
    res.json({ entries: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM entries WHERE id = $1;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ entry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { type, title_si, title_en, excerpt, body, cover_image, published_at, order } = req.body || {};
    if (!VALID_TYPES.has(type)) {
      return res.status(400).json({ error: `type must be one of: ${[...VALID_TYPES].join(', ')}` });
    }
    if (!title_si || !excerpt || !body) {
      return res.status(400).json({ error: 'title_si, excerpt, and body are required' });
    }
    const result = await pool.query(
      `INSERT INTO entries (type, title_si, title_en, excerpt, body, cover_image, published_at, "order")
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, now()), COALESCE($8, 0))
       RETURNING *;`,
      [type, title_si, title_en || null, excerpt, body, cover_image || null, published_at || null, order ?? null]
    );
    res.status(201).json({ entry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title_si, title_en, excerpt, body, cover_image, published_at, order } = req.body || {};
    if (!title_si || !excerpt || !body) {
      return res.status(400).json({ error: 'title_si, excerpt, and body are required' });
    }
    const result = await pool.query(
      `UPDATE entries SET
         title_si = $1, title_en = $2, excerpt = $3, body = $4, cover_image = $5,
         published_at = COALESCE($6, published_at), "order" = COALESCE($7, "order"),
         updated_at = now()
       WHERE id = $8
       RETURNING *;`,
      [title_si, title_en || null, excerpt, body, cover_image || null, published_at || null, order ?? null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ entry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM entries WHERE id = $1 RETURNING id;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
