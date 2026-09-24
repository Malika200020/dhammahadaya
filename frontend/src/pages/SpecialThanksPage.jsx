import { useEffect, useState } from 'react';
import { listSpecialThanks } from '../api/specialThanks';
import { LoadingState } from '../components/LoadingState';
import { useTranslation } from '../i18n/LanguageContext';
import './SpecialThanksPage.css';

// build-spec §17.2 — donor list grouped under EN/SI section headings.
export function SpecialThanksPage() {
  const { language, t } = useTranslation();
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
      <h1>{t('sponsorship.specialThanks')}</h1>
      {error ? <p className="special-thanks__error">{error.message}</p> : null}
      {loading ? <LoadingState message={t('common.loadingColdStart')} /> : null}

      {sections.map((s) => (
        <section key={s.id} className="special-thanks__section card">
          {/* section_en/section_si are already-bilingual (admin-entered) —
              picks whichever matches the current language instead of
              always showing both (client request, 2026-09). */}
          <h2>{(language === 'en' ? s.section_en : s.section_si) || s.section_si || s.section_en}</h2>
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
