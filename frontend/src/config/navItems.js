// Public NavBar hierarchy (build-spec §2.2). Kept as static config — every
// slug here is checked against the real routes in App.jsx so nothing here
// can point at a dead route.
//
// Flat by design (client request, 2026-09): dropdown submenus were removed
// site-wide — every item that used to have `children` here now links
// straight to its own landing page, and that landing page carries the
// former dropdown entries as clickable cards instead (see
// ProgramsLandingPage, PdfBooksLandingPage, DhammaSermonIndexPage,
// DictionaryLandingPage, TripitakaSearchPage, EntryListPage's Newsletters
// sub-links, and SponsorshipPage's Development Projects tab for Special
// Thanks / Honorable Tribute / Siri Sugatha Sasana Bandumathi). PDF Books
// no longer has its own top-level entry — it's now reachable as a
// sub-heading on the Tripitaka page. Development no longer has its own
// entry — its bank-detail content moved under Sponsorships.
export const NAV_ITEMS = [
  { label: 'Dhammahadaya', to: '/' },
  { label: 'Newsletters', to: '/post/' },
  { label: 'Tripitaka', to: '/tripitaka/' },
  { label: 'Dictionary', to: '/dictionary/' },
  { label: 'Dhamma Sermons', to: '/dhamma-sermon/' },
  { label: 'Programs', to: '/programs/' },
  { label: 'Sponsorships', to: '/sponsorship/' },
  { label: 'Contact Us', to: '/contact-us/' },
  { label: 'About us', to: '/about/' },
];
