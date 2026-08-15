const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/admin/meditation-applications — the "viewable in admin" side of
// build-spec §13. View-only aside from delete (for cleaning up test/spam
// rows) — a registration isn't something admin should be editing.
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM meditation_application ORDER BY created_at DESC;');
    res.json({ applications: result.rows });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM meditation_application WHERE id = $1 RETURNING id;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
