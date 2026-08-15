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

module.exports = router;
