// Public NavBar hierarchy (build-spec §2.2). Kept as static config — every
// slug here is checked against the real routes in App.jsx so nothing here
// can point at a dead route. The one dynamic exception is Sathara Pohoya
// Calendar's year list, which NavBar.jsx fetches at render time instead of
// hardcoding, since admins add new years over time (see
// SatharaPohoyaCalendarIndexPage.jsx for the same pattern).
export const NAV_ITEMS = [
  { label: 'Dhammahadaya', to: '/' },
  {
    label: 'Posts',
    to: '/post/',
    children: [
      { label: 'Posts', to: '/post/' },
      { label: 'Ape Budu Hamuduruwo', to: '/ape-budu-hamuduruwo-all/' },
      { label: 'Asu Maha Srawakayan Wahansela', to: '/asu-maha-srawakayan-wahansela/' },
      { label: 'Important Articles', to: '/important-articles/' },
    ],
  },
  {
    label: 'Tripitaka',
    to: '/tripitaka/',
    children: [
      { label: 'Tripitaka', to: '/tripitaka/' },
      { label: 'Tripitaka Catalogue', to: '/tripitaka-catalogs/' },
    ],
  },
  {
    label: 'PDF Books',
    to: '/pdf-books/',
    children: [
      { label: 'PDF Books', to: '/pdf-books/' },
      { label: 'Tripitaka (PDF)', to: '/tripitaka-pdf/' },
      { label: 'Atthakatha (PDF)', to: '/atthakatha/' },
      { label: 'Tika (PDF)', to: '/tika/' },
      { label: 'Other Valuable Books', to: '/other-valuable-book/' },
    ],
  },
  {
    // No own landing page in the spec — unlike the other dropdowns, the
    // label itself isn't a link, only its two children are.
    label: 'Dictionary',
    children: [
      { label: 'Pali Sinhalese Dictionary', to: '/pali-sinhalese-dictionary/' },
      { label: 'Sinhala Dictionary', to: '/sinhala-dictionary/' },
    ],
  },
  {
    label: 'Dhamma Sermons',
    to: '/dhamma-sermon/',
    children: [
      { label: 'Australia Dhamma Sermons', to: '/australia-dhamma-sermons/' },
      { label: 'Calgary Dhamma Sermons', to: '/calgary-dhamma-sermons/' },
      { label: 'Katina Pinkam Dhamma Sermons', to: '/katina-pinkam-dhamma-sermons/' },
      { label: 'London Dhamma Sermons', to: '/london-dhamma-sermons/' },
      { label: 'Sadaham Sakmana Dhamma Sermons', to: '/sadaham-sakmana-dhamma-sermons/' },
      { label: 'The Buddhist TV Dhamma Sermon', to: '/the-buddhist-tv-dhamma-sermon/' },
    ],
  },
  {
    label: 'Programs',
    to: '/programs/',
    children: [
      { label: 'Programs', to: '/programs/' },
      // years intentionally omitted here — NavBar.jsx injects them dynamically
      { label: 'Sathara Pohoya Calendar', to: '/sathara-pohoya-calendar/', dynamicYears: true },
      { label: 'Buddha Puja', to: '/buddha-puja/' },
      { label: 'Kathina Ceremony', to: '/kathina-ceremony/' },
      { label: 'Meditation Programs', to: '/meditation-programs/' },
    ],
  },
  {
    label: 'Development',
    to: '/development/',
    children: [
      { label: 'Development', to: '/development/' },
      { label: 'Special Thanks', to: '/special-thanks/' },
      { label: 'Honorable Tribute', to: '/honorable-tribute/' },
      { label: 'Siri Sugatha Sasana Bandumathi', to: '/siri-sugatha-sasana-bandumathi/' },
    ],
  },
  { label: 'Sponsorships', to: '/sponsorship/' },
  { label: 'Contact Us', to: '/contact-us/' },
  { label: 'About', to: '/about/' },
];
