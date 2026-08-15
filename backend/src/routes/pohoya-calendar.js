const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/pohoya-calendar — index of years (for the Sathara Pohoya
// Calendar index page's year links).
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT year, image_url FROM pohoya_calendar ORDER BY year DESC;');
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

module.exports = router;
