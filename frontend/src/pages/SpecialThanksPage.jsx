import { useEffect, useState } from 'react';
import { listSpecialThanks } from '../api/specialThanks';
import './SpecialThanksPage.css';

// build-spec §17.2 — donor list grouped under EN/SI section headings.
export function SpecialThanksPage() {
  const [sections, setSections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    listSpecialThanks()
      .then((d) => setSections(d.sections))
      .catch(setError);
  }, []);

  return (
    <div className="special-thanks">
      <h1>Special Thanks | විශේෂ පුණ්‍යානුමෝදනා කිරීම්</h1>
      {error ? <p className="special-thanks__error">{error.message}</p> : null}

      {sections.map((s) => (
        <section key={s.id} className="special-thanks__section card">
          <h2>
            {s.section_en ? `${s.section_en} | ` : ''}
            {s.section_si}
          </h2>
          {s.purpose ? <p className="special-thanks__purpose">{s.purpose}</p> : null}
          {s.donors.length > 0 ? (
            <ul className="special-thanks__donors">
              {s.donors.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
