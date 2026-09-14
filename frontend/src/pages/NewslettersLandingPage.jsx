import { Link } from 'react-router-dom';
import './NewslettersLandingPage.css';

// Landing page for the Newsletters nav item, added so it matches the
// nav → index → content flow already used by Dictionary/Programs/Dhamma
// Sermons (client request, 2026-09) — these four used to be reachable via
// a nav dropdown, then as on-page links on the Newsletters list itself;
// they now live here instead, matching how those other sections work.
export function NewslettersLandingPage() {
  return (
    <div className="newsletters-landing">
      <h1>Newsletters</h1>
      <div className="newsletters-landing__grid">
        <Link to="/post/" className="newsletters-landing__card card card--interactive">
          Newsletters
        </Link>
        <Link to="/ape-budu-hamuduruwo-all/" className="newsletters-landing__card card card--interactive">
          Ape Budu Hamuduruwo
        </Link>
        <Link to="/asu-maha-srawakayan-wahansela/" className="newsletters-landing__card card card--interactive">
          Asu Maha Srawakayan Wahansela
        </Link>
        <Link to="/important-articles/" className="newsletters-landing__card card card--interactive">
          Important Articles
        </Link>
      </div>
    </div>
  );
}
