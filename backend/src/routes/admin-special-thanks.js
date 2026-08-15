const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM special_thanks ORDER BY "order" ASC, id ASC;');
    res.json({ sections: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM special_thanks WHERE id = $1;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ section: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { section_en, section_si, purpose, donors, order } = req.body || {};
    if (!section_si || !section_si.trim()) return res.status(400).json({ error: 'section_si is required' });
    const result = await pool.query(
      `INSERT INTO special_thanks (section_en, section_si, purpose, donors, "order")
       VALUES ($1, $2, $3, $4, COALESCE($5, 0))
       RETURNING *;`,
      [section_en || null, section_si.trim(), purpose || null, Array.isArray(donors) ? donors : [], order ?? null]
    );
    res.status(201).json({ section: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { section_en, section_si, purpose, donors, order } = req.body || {};
    if (!section_si || !section_si.trim()) return res.status(400).json({ error: 'section_si is required' });
    const result = await pool.query(
      `UPDATE special_thanks SET
         section_en = $1, section_si = $2, purpose = $3, donors = $4, "order" = COALESCE($5, "order")
       WHERE id = $6
       RETURNING *;`,
      [section_en || null, section_si.trim(), purpose || null, Array.isArray(donors) ? donors : [], order ?? null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ section: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM special_thanks WHERE id = $1 RETURNING id;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
