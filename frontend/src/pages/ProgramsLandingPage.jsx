import { Link } from 'react-router-dom';
import './ProgramsLandingPage.css';

// build-spec §16.1 — landing page for the Programs dropdown.
export function ProgramsLandingPage() {
  return (
    <div className="programs">
      <h1>Programs</h1>
      <div className="programs__cards">
        <Link to="/sathara-pohoya-calendar/" className="programs__card card card--interactive">
          Sathara Pohoya Calendar
        </Link>
      </div>
    </div>
  );
}
