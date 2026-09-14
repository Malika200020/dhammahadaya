import { Link } from 'react-router-dom';
import './TripitakaSearchPage.css';

// build-spec §7 — a thin wrapper embedding tipitaka.lk; no backend logic.
// Confirmed tipitaka.lk sends no X-Frame-Options/CSP frame-ancestors
// header, so it's embeddable — the outbound link stays as the spec's own
// documented fallback in case that ever changes.
//
// Tripitaka Catalogue and PDF Books used to be reachable via this page's
// nav dropdown; both moved here as on-page links instead (client request,
// 2026-09: dropdown submenus removed site-wide, and PDF Books specifically
// moved to live "under Tripitaka" — see navItems.js).
export function TripitakaSearchPage() {
  return (
    <div className="tripitaka-search">
      <h1>Tripitaka</h1>
      <div className="tripitaka-search__subnav">
        <Link to="/tripitaka-catalogs/" className="btn btn--primary btn--sm">
          Tripitaka Catalogue
        </Link>
      </div>

      <h2 className="tripitaka-search__pdf-heading">PDF Books</h2>
      <div className="tripitaka-search__subnav">
        <Link to="/pdf-books/" className="btn btn--secondary btn--sm">
          Browse PDF Books
        </Link>
      </div>

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
