import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDhammaSermonSeries } from '../api/videos';
import { LoadingState } from '../components/LoadingState';
import { useTranslation } from '../i18n/LanguageContext';
import './DhammaSermonIndexPage.css';

// build-spec §9 — index page linking to the six series pages. Series names
// now switch with the language toggle (client-reported, 2026-10: "not
// translated yet to Sinhala") — name_si previously held the text regardless
// of language, since every series name happened to be in English and no
// Sinhala version had ever been entered (see scripts/migrate.js's seed data
// and the one-time DB fix that moved it into name_en instead).
export function DhammaSermonIndexPage() {
  const { language, t } = useTranslation();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listDhammaSermonSeries()
      .then((d) => setSeries(d.series))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (error) return <p className="dhamma-sermon-index__error">{t('common.failedToLoad', { message: error.message })}</p>;
  if (loading) return <LoadingState message={t('common.loadingColdStart')} />;

  return (
    <div className="dhamma-sermon-index">
      <h1>{t('nav.dhammaSermons')}</h1>
      <div className="dhamma-sermon-index__grid">
        {series.map((s) => (
          <Link key={s.slug} to={`/${s.slug}/`} className="dhamma-sermon-index__card card card--interactive">
            {language === 'en' ? s.name_en ?? s.name_si : s.name_si}
          </Link>
        ))}
      </div>
    </div>
  );
}
