import { useEffect, useState } from 'react';
import { listSpecialThanks } from '../api/specialThanks';
import { LoadingState } from '../components/LoadingState';
import './SpecialThanksPage.css';

// build-spec §17.2 — donor list grouped under EN/SI section headings.
export function SpecialThanksPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listSpecialThanks()
      .then((d) => setSections(d.sections))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="special-thanks">
      <h1>Special Thanks | විශේෂ පුණ්‍යානුමෝදනා කිරීම්</h1>
      {error ? <p className="special-thanks__error">{error.message}</p> : null}
      {loading ? <LoadingState message="Loading… the first load of the day can take up to a minute while the server wakes up." /> : null}

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
