const express = require('express');
const { pool } = require('../db');
const { getPdfBookCategory } = require('../config/pdfBookCategories');
const { extractLinkCode } = require('../pdfBookCode');
const { invalidatePdfBooksIndex } = require('../pdfBooksIndex');

const router = express.Router();

const VALID_STATUSES = new Set(['available', 'available_new', 'no_link_yet']);

// GET /api/admin/pdf-books?category=tripitaka-pdf — full admin list for one
// category page (every entry, any status — unlike the public route this
// isn't meant to hide anything).
router.get('/', async (req, res, next) => {
  try {
    const categoryConfig = getPdfBookCategory(req.query.category);
    if (!categoryConfig) {
      return res.status(400).json({ error: 'category must be one of: tripitaka-pdf, atthakatha, tika, other-valuable-books' });
    }
    const result = await pool.query(
      `SELECT id, category, section, subsection, title, link_url, link_status
       FROM pdf_books WHERE category = $1 ORDER BY id ASC;`,
      [categoryConfig.category]
    );
    res.json({ entries: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM pdf_books WHERE id = $1;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ entry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { category, section, subsection, title, link_url, link_status } = req.body || {};
    const categoryConfig = getPdfBookCategory(category);
    if (!categoryConfig) {
      return res.status(400).json({ error: 'category must be one of: tripitaka-pdf, atthakatha, tika, other-valuable-books' });
    }
    if (!section || !subsection || !title) {
      return res.status(400).json({ error: 'section, subsection, and title are required' });
    }
    if (!VALID_STATUSES.has(link_status)) {
      return res.status(400).json({ error: `link_status must be one of: ${[...VALID_STATUSES].join(', ')}` });
    }
    const { linkPrefix, linkBookCode } = extractLinkCode(title);
    const result = await pool.query(
      `INSERT INTO pdf_books (category, section, subsection, title, link_url, link_status, link_prefix, link_book_code, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'admin')
       RETURNING *;`,
      [categoryConfig.category, section, subsection, title, link_url || '', link_status, linkPrefix, linkBookCode]
    );
    invalidatePdfBooksIndex();
    res.status(201).json({ entry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { category, section, subsection, title, link_url, link_status } = req.body || {};
    const categoryConfig = getPdfBookCategory(category);
    if (!categoryConfig) {
      return res.status(400).json({ error: 'category must be one of: tripitaka-pdf, atthakatha, tika, other-valuable-books' });
    }
    if (!section || !subsection || !title) {
      return res.status(400).json({ error: 'section, subsection, and title are required' });
    }
    if (!VALID_STATUSES.has(link_status)) {
      return res.status(400).json({ error: `link_status must be one of: ${[...VALID_STATUSES].join(', ')}` });
    }
    const { linkPrefix, linkBookCode } = extractLinkCode(title);
    // Any admin edit — including fixing up a legacy row — reclassifies it
    // as source='admin', so a future re-run of the CSV importer refuses to
    // touch it instead of silently reverting the edit.
    const result = await pool.query(
      `UPDATE pdf_books SET
         category = $1, section = $2, subsection = $3, title = $4,
         link_url = $5, link_status = $6, link_prefix = $7, link_book_code = $8, source = 'admin'
       WHERE id = $9
       RETURNING *;`,
      [categoryConfig.category, section, subsection, title, link_url || '', link_status, linkPrefix, linkBookCode, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    invalidatePdfBooksIndex();
    res.json({ entry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM pdf_books WHERE id = $1 RETURNING id;', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    invalidatePdfBooksIndex();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
