const express = require('express');
const { pool } = require('../db');
const { getEntryType } = require('../config/entryTypes');

const router = express.Router();

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// GET /api/entries/:slug — listing (cards: title + excerpt), newest first.
// Home page's "newest 4" is just this with pageSize=4.
router.get('/:slug', async (req, res, next) => {
  try {
    const entryType = getEntryType(req.params.slug);
    if (!entryType) return res.status(404).json({ error: `Unknown entry type "${req.params.slug}"` });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE)
    );
    const offset = (page - 1) * pageSize;

    const [countResult, pageResult] = await Promise.all([
      pool.query('SELECT count(*) FROM entries WHERE type = $1;', [entryType.type]),
      pool.query(
        `SELECT id, title_si, title_en, excerpt, cover_image, published_at
         FROM entries WHERE type = $1
         ORDER BY published_at DESC, id DESC
         LIMIT $2 OFFSET $3;`,
        [entryType.type, pageSize, offset]
      ),
    ]);

    const totalRows = Number(countResult.rows[0].count);
    res.json({
      slug: entryType.slug,
      titleEn: entryType.titleEn,
      titleSi: entryType.titleSi,
      page,
      pageSize,
      totalRows,
      totalPages: Math.max(1, Math.ceil(totalRows / pageSize)),
      entries: pageResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/entries/:slug/:id — full entry + prev/next in the same listing
// order (newest first): "next" = the next-older entry, "prev" = the
// next-newer entry.
router.get('/:slug/:id', async (req, res, next) => {
  try {
    const entryType = getEntryType(req.params.slug);
    if (!entryType) return res.status(404).json({ error: `Unknown entry type "${req.params.slug}"` });

    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    const entryResult = await pool.query(
      `SELECT id, title_si, title_en, excerpt, body, cover_image, published_at
       FROM entries WHERE type = $1 AND id = $2;`,
      [entryType.type, id]
    );
    const entry = entryResult.rows[0];
    if (!entry) return res.status(404).json({ error: 'Not found' });

    const [prevResult, nextResult] = await Promise.all([
      // prev = next-newer (appears earlier in the newest-first list)
      pool.query(
        `SELECT id, title_si FROM entries WHERE type = $1
         AND (published_at, id) > ($2, $3)
         ORDER BY published_at ASC, id ASC LIMIT 1;`,
        [entryType.type, entry.published_at, entry.id]
      ),
      // next = next-older (appears later in the newest-first list)
      pool.query(
        `SELECT id, title_si FROM entries WHERE type = $1
         AND (published_at, id) < ($2, $3)
         ORDER BY published_at DESC, id DESC LIMIT 1;`,
        [entryType.type, entry.published_at, entry.id]
      ),
    ]);

    res.json({
      slug: entryType.slug,
      titleEn: entryType.titleEn,
      titleSi: entryType.titleSi,
      entry,
      prev: prevResult.rows[0] || null,
      next: nextResult.rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
