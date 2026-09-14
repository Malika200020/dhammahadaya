import { Link } from 'react-router-dom';
import { tripitakaCatalogueCaption, tripitakaSearchCaption, pdfBookCaption } from '../content/homeContent';
import './TripitakaLandingPage.css';

// Landing page for the Tripitaka nav item, added so it matches the
// nav → index → content flow already used by Dictionary/Programs/Dhamma
// Sermons (client request, 2026-09) — the search embed that used to live
// directly at /tripitaka/ moved to /tripitaka-search/, reachable from here
// like any other card. Captions are the same ones already used in the
// Home page's own Tripitaka section, so the wording stays consistent
// between the two rather than duplicating a second copy.
export function TripitakaLandingPage() {
  return (
    <div className="tripitaka-landing">
      <h1>Tripitaka</h1>
      <div className="tripitaka-landing__grid">
        <Link to="/tripitaka-catalogs/" className="tripitaka-landing__card card card--interactive">
          <span className="tripitaka-landing__title">Tripitaka Catalogue</span>
          <p className="tripitaka-landing__caption">{tripitakaCatalogueCaption}</p>
        </Link>
        <Link to="/tripitaka-search/" className="tripitaka-landing__card card card--interactive">
          <span className="tripitaka-landing__title">Tripitaka Search</span>
          <p className="tripitaka-landing__caption">{tripitakaSearchCaption}</p>
        </Link>
        <Link to="/pdf-books/" className="tripitaka-landing__card card card--interactive">
          <span className="tripitaka-landing__title">PDF Books</span>
          <p className="tripitaka-landing__caption">{pdfBookCaption}</p>
        </Link>
      </div>
    </div>
  );
}
