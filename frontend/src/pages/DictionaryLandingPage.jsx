import { Link } from 'react-router-dom';
import './DictionaryLandingPage.css';

// Landing page for the Dictionary nav item, added when its nav dropdown
// (Pali Sinhalese Dictionary / Sinhala Dictionary) was flattened into a
// single link (client request, 2026-09: dropdown submenus removed
// site-wide) — matches the card-grid pattern used by the other former
// dropdowns (PdfBooksLandingPage, ProgramsLandingPage).
export function DictionaryLandingPage() {
  return (
    <div className="dictionary-landing">
      <h1>Dictionary</h1>
      <div className="dictionary-landing__grid">
        <Link to="/pali-sinhalese-dictionary/" className="dictionary-landing__card card card--interactive">
          Pali Sinhalese Dictionary
        </Link>
        <Link to="/sinhala-dictionary/" className="dictionary-landing__card card card--interactive">
          Sinhala Dictionary
        </Link>
      </div>
    </div>
  );
}
