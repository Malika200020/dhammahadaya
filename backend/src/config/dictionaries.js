// Registry of dictionaries exposed by the search API.
//
// Deliberately only lists the two dictionaries the build spec (§15) gives a
// page to. Tables `sinhala_dictionary_concise` (20571) and `akshara_vinyasa`
// (22809) are imported into Postgres but have no route in the spec yet —
// whether they get their own page is a pending client decision (see
// docs/data-notes.md "Open questions"). Do not add them here as a shortcut;
// add them once that decision is made.
//
// `table` and every `columns[].dbColumn` / `searchColumn` value below are
// fixed, server-defined identifiers — never derived from request input —
// so they're safe to interpolate directly into SQL.

const DICTIONARIES = {
  'pali-sinhalese-dictionary': {
    slug: 'pali-sinhalese-dictionary',
    titleEn: 'Pali Sinhalese Dictionary',
    titleSi: 'පාළි සිංහල ශබ්දකෝෂය',
    table: 'pali_sinhala_dictionary',
    searchColumn: 'pali_word',
    columns: [
      { dbColumn: 'pali_word', key: 'pali_word', label: 'පාලි වචනය' },
      { dbColumn: 'sinhala_translation', key: 'sinhala_translation', label: 'සිංහල පරිවර්තනය' },
    ],
  },
  'sinhala-dictionary': {
    slug: 'sinhala-dictionary',
    titleEn: 'Sinhala Dictionary',
    titleSi: 'සිංහල ශබ්දකෝෂය',
    table: 'sinhala_dictionary',
    searchColumn: 'word',
    columns: [
      { dbColumn: 'word', key: 'word', label: 'වචනය' },
      { dbColumn: 'meaning', key: 'meaning', label: 'සමාන පදමාලාව' },
    ],
  },
};

function getDictionary(slug) {
  return DICTIONARIES[slug] || null;
}

module.exports = { DICTIONARIES, getDictionary };
