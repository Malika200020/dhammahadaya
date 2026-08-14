const express = require('express');
const { pool } = require('../db');
const { getPdfBookCategory } = require('../config/pdfBookCategories');

const router = express.Router();

// Groups a flat, id-ordered row list into section -> subsection ->
// entries, preserving first-seen order at every level (Map iteration
// order == insertion order in JS) — the grouping is whatever the source
// CSV's row order already encodes, never re-sorted/invented.
function groupBySectionAndSubsection(rows) {
  const bySection = new Map();
  for (const row of rows) {
    if (!bySection.has(row.section)) bySection.set(row.section, new Map());
    const bySubsection = bySection.get(row.section);
    if (!bySubsection.has(row.subsection)) bySubsection.set(row.subsection, []);
    bySubsection.get(row.subsection).push({
      id: row.id,
      title: row.title,
      link_url: row.link_url,
      link_status: row.link_status,
    });
  }
  return [...bySection.entries()].map(([section, bySubsection]) => ({
    section,
    subsections: [...bySubsection.entries()].map(([subsection, entries]) => ({
      subsection,
      entries,
    })),
  }));
}

// GET /api/pdf-books/:slug — grouped entries for one of the 4 category pages.
router.get('/:slug', async (req, res, next) => {
  try {
    const categoryConfig = getPdfBookCategory(req.params.slug);
    if (!categoryConfig) return res.status(404).json({ error: `Unknown PDF book category "${req.params.slug}"` });

    const result = await pool.query(
      `SELECT id, section, subsection, title, link_url, link_status
       FROM pdf_books WHERE category = $1 ORDER BY id ASC;`,
      [categoryConfig.category]
    );

    res.json({
      slug: categoryConfig.slug,
      titleEn: categoryConfig.titleEn,
      titleSi: categoryConfig.titleSi,
      sections: groupBySectionAndSubsection(result.rows),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
