// Mirrors the 6 series seeded in backend/scripts/migrate.js — used to
// generate the public routes and the admin nav. The API is still the
// source of truth for series metadata (name/order); this list only needs
// to match on `slug` for routing purposes.
export const DHAMMA_SERMON_SERIES_SLUGS = [
  'australia-dhamma-sermons',
  'calgary-dhamma-sermons',
  'katina-pinkam-dhamma-sermons',
  'london-dhamma-sermons',
  'sadaham-sakmana-dhamma-sermons',
  'the-buddhist-tv-dhamma-sermon',
];
