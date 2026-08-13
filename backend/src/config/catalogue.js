// Tripitaka Catalogue (build-spec §6) registry entry.
//
// `linkable: true` marks the 4 columns whose spec label contains "PDF"
// (the only ones the original site actually hyperlinked — see §6's column
// list and docs/data-notes.md). The other columns hold printed-book page
// references, not downloadable files, and are always rendered as plain
// text regardless of their content.
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
    { dbColumn: 'sutta_name', key: 'sutta_name', label: 'සූත්‍ර නාමය', linkable: false },
    { dbColumn: 'pitaka', key: 'pitaka', label: 'පිටකය', linkable: false },
    { dbColumn: 'nikaya', key: 'nikaya', label: 'නිකාය', linkable: false },
    { dbColumn: 'vagga', key: 'vagga', label: 'වග්ගය', linkable: false },
    { dbColumn: 'printed_page_no', key: 'printed_page_no', label: 'පෙළ පිටු අංක', linkable: false },
    { dbColumn: 'pdf_page_no', key: 'pdf_page_no', label: 'PDF පෙළ පිටු අංක', linkable: true },
    { dbColumn: 'pdf_pali_atthakatha', key: 'pdf_pali_atthakatha', label: 'PDF පාළි අටුවාව', linkable: true },
    { dbColumn: 'sinhala_atthakatha', key: 'sinhala_atthakatha', label: 'සිංහල අටුවාව', linkable: false },
    { dbColumn: 'pdf_sinhala_atthakatha', key: 'pdf_sinhala_atthakatha', label: 'PDF සිංහල අටුවාව', linkable: true },
    { dbColumn: 'pdf_pali_tika', key: 'pdf_pali_tika', label: 'PDF පාළි ටීකා', linkable: true },
    { dbColumn: 'pali_sinhala_tika', key: 'pali_sinhala_tika', label: 'පාළි - සිංහල ටීකා', linkable: false },
  ],
};

module.exports = { CATALOGUE };
