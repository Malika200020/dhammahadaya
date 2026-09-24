// Public NavBar hierarchy (build-spec §2.2). Kept as static config — every
// slug here is checked against the real routes in App.jsx so nothing here
// can point at a dead route.
//
// Flat by design (client request, 2026-09): dropdown submenus were removed
// site-wide — every item that used to have `children` here now links
// straight to its own landing page, and that landing page carries the
// former dropdown entries as clickable cards instead.
//
// Every item below follows the same nav → index/landing page → content
// flow (client request, 2026-09, amended): Newsletters, Tripitaka, and
// Sponsorships used to jump straight into a functional page (the article
// list, the tipitaka.lk embed, the booking form) instead of an index —
// NewslettersLandingPage, TripitakaLandingPage, and SponsorshipLandingPage
// were added so every nav item behaves the same way as
// DictionaryLandingPage/ProgramsLandingPage/DhammaSermonIndexPage already
// did. PDF Books no longer has its own top-level entry — it's now a card
// on the Tripitaka landing page. Development no longer has its own entry —
// its bank-detail content moved to the Sponsorships → Development Projects
// page.
//
// `labelKey` (client request, 2026-09: global language toggle) looks up
// the label in i18n/translations.js instead of a literal string, so the
// nav re-renders in whichever language is currently selected.
export const NAV_ITEMS = [
  { labelKey: 'nav.home', to: '/' },
  { labelKey: 'nav.newsletters', to: '/newsletters/' },
  { labelKey: 'nav.tripitaka', to: '/tripitaka/' },
  { labelKey: 'nav.dictionary', to: '/dictionary/' },
  { labelKey: 'nav.dhammaSermons', to: '/dhamma-sermon/' },
  { labelKey: 'nav.programs', to: '/programs/' },
  { labelKey: 'nav.sponsorships', to: '/sponsorship/' },
  { labelKey: 'nav.contactUs', to: '/contact-us/' },
  { labelKey: 'nav.aboutUs', to: '/about/' },
];
