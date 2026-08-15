import { asuMahaSrawakayanHeader, asuMahaSrawakayanParagraphs } from '../content/homeContent';
import './AsuMahaSrawakayanPage.css';

// build-spec §5.3 — a single long static page (NOT the Article-list
// pattern), no [ADMIN] capability in the spec, so it's frontend-only
// content like About/Buddha-Puja's dedication text — no DB table.
export function AsuMahaSrawakayanPage() {
  return (
    <div className="asu-maha">
      <h1>{asuMahaSrawakayanHeader}</h1>
      <img
        className="asu-maha__image"
        src="/images/80-මහා-ශ්_රාවක-picture.jpg"
        alt={asuMahaSrawakayanHeader}
      />
      {/* [CONTENT — Sinhala, migrate verbatim] build-spec §5.3 */}
      <div className="asu-maha__body">
        {asuMahaSrawakayanParagraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
