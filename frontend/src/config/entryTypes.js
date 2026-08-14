// Mirrors backend/src/config/entryTypes.js's type/slug pairing — used to
// build admin nav links and labels. Adding a fourth Article-list section
// means adding one entry here (and one on the backend), not new pages.
export const ENTRY_TYPES = [
  { type: 'newsletter', slug: 'post', label: 'Posts / Newsletters' },
  { type: 'budu_hamuduruwo', slug: 'ape-budu-hamuduruwo-all', label: 'Ape Budu Hamuduruwo' },
  { type: 'important_article', slug: 'important-articles', label: 'Important Articles' },
];

export const ENTRY_TYPE_LABELS = Object.fromEntries(ENTRY_TYPES.map((t) => [t.type, t.label]));
