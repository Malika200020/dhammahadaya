import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDhammaSermonSeries } from '../api/videos';
import { LoadingState } from '../components/LoadingState';
import { useTranslation } from '../i18n/LanguageContext';
import './DhammaSermonIndexPage.css';

// build-spec §9 — index page linking to the six series pages.
export function DhammaSermonIndexPage() {
  const { t } = useTranslation();
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
            {s.name_si}
          </Link>
        ))}
      </div>
    </div>
  );
}
