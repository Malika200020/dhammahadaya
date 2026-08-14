const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { gallery, key } = req.query;
    if (!gallery) return res.status(400).json({ error: 'gallery is required' });
    const result = await pool.query(
      key
        ? `SELECT * FROM gallery_images WHERE gallery = $1 AND gallery_key = $2 ORDER BY "order" ASC, id ASC;`
        : `SELECT * FROM gallery_images WHERE gallery = $1 AND gallery_key IS NULL ORDER BY "order" ASC, id ASC;`,
      key ? [gallery, key] : [gallery]
    );
    res.json({ images: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { gallery, gallery_key, image_url, image_date, caption, order } = req.body || {};
    if (!gallery || !image_url) return res.status(400).json({ error: 'gallery and image_url are required' });
    const result = await pool.query(
      `INSERT INTO gallery_images (gallery, gallery_key, image_url, image_date, caption, "order")
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 0))
       RETURNING *;`,
      [gallery, gallery_key || null, image_url, image_date || null, caption || null, order ?? null]
    );
    res.status(201).json({ image: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { image_date, caption, order } = req.body || {};
    const result = await pool.query(
      `UPDATE gallery_images SET image_date = $1, caption = $2, "order" = COALESCE($3, "order")
       WHERE id = $4 RETURNING *;`,
      [image_date || null, caption || null, order ?? null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ image: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM gallery_images WHERE id = $1 RETURNING id;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
