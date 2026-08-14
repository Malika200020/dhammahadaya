// The Article-list pattern (build-spec §3) is one data model — `entries`,
// distinguished by `type` — reused by three public sections. Adding a
// fourth section that fits this pattern is just adding an entry here, not
// new backend code (see routes/entries.js and routes/admin-entries.js,
// which are entirely generic over this config).
const ENTRY_TYPES = {
  newsletter: {
    type: 'newsletter',
    slug: 'post',
    titleEn: 'Posts',
    titleSi: null, // spec's own nav label is just "Posts" — no Sinhala variant given
  },
  budu_hamuduruwo: {
    type: 'budu_hamuduruwo',
    slug: 'ape-budu-hamuduruwo-all',
    titleEn: 'Ape Budu Hamuduruwo',
    titleSi: 'අපේ බුදු හාමුදුරුවෝ', // build-spec §5.1 / raw note header
  },
  important_article: {
    type: 'important_article',
    slug: 'important-articles',
    titleEn: 'Important Articles',
    titleSi: null,
  },
};

function getEntryType(slug) {
  return Object.values(ENTRY_TYPES).find((t) => t.slug === slug) || null;
}

module.exports = { ENTRY_TYPES, getEntryType };
