const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/katina — every year's organizer list, newest first. Photo
// galleries are fetched separately via GET /api/galleries/katina?key=<year>
// (the reusable gallery from step 7), same two-fetch pattern as Buddha Puja.
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT year, organizers FROM katina_year ORDER BY year DESC;');
    res.json({ years: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:year', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT year, organizers FROM katina_year WHERE year = $1;', [req.params.year]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ year: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
