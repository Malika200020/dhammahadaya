import { Link } from 'react-router-dom';
import { sponsorshipHeader } from '../content/sponsorshipContent';
import './SponsorshipLandingPage.css';

// Landing page for the Sponsorships nav item, added so it matches the
// nav → index → content flow already used by Dictionary/Programs/Dhamma
// Sermons (client request, 2026-09) — Danaya and Development Projects used
// to be in-page tabs on this same URL; they're now their own pages.
export function SponsorshipLandingPage() {
  return (
    <div className="sponsorship-landing">
      <h1>{sponsorshipHeader}</h1>
      <div className="sponsorship-landing__grid">
        <Link to="/sponsorship/danaya/" className="sponsorship-landing__card card card--interactive">
          Danaya
        </Link>
        <Link to="/sponsorship/development-projects/" className="sponsorship-landing__card card card--interactive">
          Development Projects
        </Link>
      </div>
    </div>
  );
}
