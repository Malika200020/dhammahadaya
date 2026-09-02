import { Link } from 'react-router-dom';
import './ProgramsLandingPage.css';

// build-spec §16.1 — landing page for the Programs dropdown. Live site's
// /programs/ links to all four sub-sections (Sathara Pohoya Calendar,
// Buddha Puja, Katina Ceremony, Meditation Programs) — matched here as a
// card grid, consistent with the other index pages (Dhamma Sermons, PDF
// Books) rather than the live page's plain centered-paragraph links.
export function ProgramsLandingPage() {
  return (
    <div className="programs">
      <h1>Programs</h1>
      <div className="programs__cards">
        <Link to="/sathara-pohoya-calendar/" className="programs__card card card--interactive">
          Sathara Pohoya Calendar
        </Link>
        <Link to="/buddha-puja/" className="programs__card card card--interactive">
          Buddha Puja
        </Link>
        <Link to="/katina-ceremony/" className="programs__card card card--interactive">
          Katina Ceremony
        </Link>
        <Link to="/meditation-programs/" className="programs__card card card--interactive">
          Meditation Programs
        </Link>
      </div>
    </div>
  );
}
