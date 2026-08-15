const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/:slug', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM static_document WHERE slug = $1;', [req.params.slug]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ document: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
