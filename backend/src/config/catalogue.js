// Tripitaka Catalogue (build-spec §6) registry entry.
//
// `linkable: true` marks the 4 columns whose spec label contains "PDF"
// (the only ones the original site actually hyperlinked — see §6's column
// list and docs/data-notes.md). The other columns hold printed-book page
// references, not downloadable files, and are always rendered as plain
// text regardless of their content.
//
// `group` clusters columns under a shared second-tier header in the UI
// (SearchableTable renders it only when at least one column sets it) —
// this table has 11 flat columns, which reads as a wall of text without
// grouping. `nowrap` marks columns whose values are short fixed-format
// codes (e.g. "SP_DN1 - 002") that should never line-wrap; free-text
// columns like sutta_name omit it.
const CATALOGUE = {
  slug: 'tripitaka-catalogue',
  titleEn: 'Tripitaka Catalogue',
  titleSi: 'ත්‍රිපිටක නාමාවලිය',
  table: 'tripitaka_catalogue',
  // sutta_name is the primary lookup key; nikaya/vagga are worth matching
  // too (see import-legacy-data.js for the cardinality check that ruled
  // pitaka out — 1 distinct value across all 268 rows).
  searchColumns: ['sutta_name', 'nikaya', 'vagga'],
  columns: [
    { dbColumn: 'sutta_name', key: 'sutta_name', label: 'සූත්‍ර නාමය', linkable: false, group: 'සූත්‍රය', sticky: true },
    { dbColumn: 'pitaka', key: 'pitaka', label: 'පිටකය', linkable: false, group: 'සූත්‍රය', nowrap: true },
    { dbColumn: 'nikaya', key: 'nikaya', label: 'නිකාය', linkable: false, group: 'සූත්‍රය', nowrap: true },
    { dbColumn: 'vagga', key: 'vagga', label: 'වග්ගය', linkable: false, group: 'සූත්‍රය', nowrap: true },
    { dbColumn: 'printed_page_no', key: 'printed_page_no', label: 'මුද්‍රිත පිටුව', linkable: false, group: 'බුද්ධ ජයන්ති මුද්‍රණය', nowrap: true },
    { dbColumn: 'pdf_page_no', key: 'pdf_page_no', label: 'PDF', linkable: true, group: 'බුද්ධ ජයන්ති මුද්‍රණය', nowrap: true },
    { dbColumn: 'pdf_pali_atthakatha', key: 'pdf_pali_atthakatha', label: 'පාළි අටුවාව PDF', linkable: true, group: 'අටුවාව', nowrap: true },
    { dbColumn: 'sinhala_atthakatha', key: 'sinhala_atthakatha', label: 'සිංහල අටුවාව', linkable: false, group: 'අටුවාව', nowrap: true },
    { dbColumn: 'pdf_sinhala_atthakatha', key: 'pdf_sinhala_atthakatha', label: 'සිංහල අටුවාව PDF', linkable: true, group: 'අටුවාව', nowrap: true },
    { dbColumn: 'pdf_pali_tika', key: 'pdf_pali_tika', label: 'පාළි ටීකා PDF', linkable: true, group: 'ටීකා', nowrap: true },
    { dbColumn: 'pali_sinhala_tika', key: 'pali_sinhala_tika', label: 'පාළි - සිංහල ටීකා', linkable: false, group: 'ටීකා', nowrap: true },
  ],
};

module.exports = { CATALOGUE };
