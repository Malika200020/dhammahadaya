const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// No create/delete — build-spec §17.3/§17.4 each describe one fixed
// document per slug ("one static rich-text record"), seeded by the
// migration. Admin can only edit title/body.
router.get('/:slug', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM static_document WHERE slug = $1;', [req.params.slug]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ document: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:slug', async (req, res, next) => {
  try {
    const { title_en, title_si, body } = req.body || {};
    if (!title_si || !title_si.trim()) return res.status(400).json({ error: 'title_si is required' });
    const result = await pool.query(
      `UPDATE static_document SET title_en = $1, title_si = $2, body = $3, updated_at = now()
       WHERE slug = $4
       RETURNING *;`,
      [title_en || null, title_si.trim(), body || '', req.params.slug]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ document: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
