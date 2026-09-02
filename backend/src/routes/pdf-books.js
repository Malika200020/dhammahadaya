const express = require('express');
const { pool } = require('../db');
const { getPdfBookCategory } = require('../config/pdfBookCategories');

const router = express.Router();

// The live site (dhammahadaya.net/tripitaka-pdf/) presents each Tripitaka
// edition as three pitaka tabs (Vinaya / Sutta / Abhidhamma) rather than a
// flat scroll — this classifies a subsection label into the pitaka it
// belongs under, purely from naming convention (no stored column), so the
// same detection works for any edition that follows the pattern.
const PITAKA_GROUPS = [
  { key: 'vinaya', label: 'Vinayapitakaya | විනය පිටකය', test: (s) => /Vinayapitakaya/i.test(s) || /Vinaya\s+(Atthakatha|Texts|Tika)/i.test(s) || s === 'Vinaya Texts (older PTS edition)' },
  { key: 'sutta', label: 'Suttapitakaya | සූත්‍ර පිටකය', test: (s) => /nik[aā]ya/i.test(s) },
  { key: 'abhidhamma', label: 'Abhidhammapitaka | අභිධර්ම පිටකය', test: (s) => /Abhidhammapitaka/i.test(s) },
];

function classifyPitaka(subsection) {
  const match = PITAKA_GROUPS.find((g) => g.test(subsection));
  return match ? match.key : null;
}

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
  return [...bySection.entries()].map(([section, bySubsection]) => {
    const subsections = [...bySubsection.entries()].map(([subsection, entries]) => ({
      subsection,
      entries,
    }));

    // Only expose pitaka tabs when every subsection in this section
    // classifies cleanly into one — a section with any leftover
    // unrecognized subsection (e.g. a category that doesn't follow the
    // Vinaya/Sutta/Abhidhamma convention at all) falls back to the flat
    // `subsections` list instead, so nothing is ever silently dropped.
    const classified = subsections.map((s) => ({ ...s, pitaka: classifyPitaka(s.subsection) }));
    const allClassified = classified.every((s) => s.pitaka);
    let groups = null;
    if (allClassified && subsections.length > 1) {
      const byPitaka = new Map();
      for (const s of classified) {
        if (!byPitaka.has(s.pitaka)) byPitaka.set(s.pitaka, []);
        byPitaka.get(s.pitaka).push({ subsection: s.subsection, entries: s.entries });
      }
      groups = PITAKA_GROUPS.filter((g) => byPitaka.has(g.key)).map((g) => ({
        key: g.key,
        label: g.label,
        subsections: byPitaka.get(g.key),
      }));
    }

    return { section, subsections, groups };
  });
}

// For categories flagged `tabsBySection` (currently just Other Valuable
// Books) the live site tabs across the top-level sections themselves —
// Abhidhamma / Rerukane Chandawimala Thero / Other — rather than nesting
// pitaka tabs inside each section. Reuses the exact {key, label,
// subsections} shape SectionTabs already renders for pitaka groups.
function buildSectionTabs(sections) {
  return sections.map((s) => ({
    key: s.section.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label: s.section,
    subsections: s.subsections,
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

    const sections = groupBySectionAndSubsection(result.rows);

    res.json({
      slug: categoryConfig.slug,
      titleEn: categoryConfig.titleEn,
      titleSi: categoryConfig.titleSi,
      sections,
      sectionTabs: categoryConfig.tabsBySection ? buildSectionTabs(sections) : null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
