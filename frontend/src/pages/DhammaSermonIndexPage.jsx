import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDhammaSermonSeries } from '../api/videos';
import { LoadingState } from '../components/LoadingState';
import './DhammaSermonIndexPage.css';

// build-spec §9 — index page linking to the six series pages.
export function DhammaSermonIndexPage() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listDhammaSermonSeries()
      .then((d) => setSeries(d.series))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (error) return <p className="dhamma-sermon-index__error">Failed to load: {error.message}</p>;
  if (loading) return <LoadingState message="Loading… the first load of the day can take up to a minute while the server wakes up." />;

  return (
    <div className="dhamma-sermon-index">
      <h1>Dhamma Sermons</h1>
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
