import './TripitakaSearchPage.css';

// build-spec §7 — a thin wrapper embedding tipitaka.lk; no backend logic.
// Confirmed tipitaka.lk sends no X-Frame-Options/CSP frame-ancestors
// header, so it's embeddable — the outbound link stays as the spec's own
// documented fallback in case that ever changes.
//
// Lives at /tripitaka-search/, one card away from the Tripitaka landing
// page at /tripitaka/ (client request, 2026-09: nav → index → content flow
// consistent with Dictionary/Programs/Dhamma Sermons) — the on-page links
// to Tripitaka Catalogue/PDF Books that used to sit above the embed moved
// to that landing page instead, since this page no longer needs to double
// as its own mini-index.
export function TripitakaSearchPage() {
  return (
    <div className="tripitaka-search">
      <h1>Tripitaka Search</h1>
      <p className="tripitaka-search__fallback">
        If the page below doesn't load,{' '}
        <a href="https://tipitaka.lk/" target="_blank" rel="noreferrer">
          open tipitaka.lk in a new tab
        </a>
        .
      </p>
      <iframe className="tripitaka-search__frame" title="Tipitaka.lk" src="https://tipitaka.lk/" />
    </div>
  );
}
