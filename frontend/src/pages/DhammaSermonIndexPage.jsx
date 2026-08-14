import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDhammaSermonSeries } from '../api/videos';
import './DhammaSermonIndexPage.css';

// build-spec §9 — index page linking to the six series pages.
export function DhammaSermonIndexPage() {
  const [series, setSeries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    listDhammaSermonSeries()
      .then((d) => setSeries(d.series))
      .catch(setError);
  }, []);

  if (error) return <p className="dhamma-sermon-index__error">Failed to load: {error.message}</p>;

  return (
    <div className="dhamma-sermon-index">
      <h1>Dhamma Sermons</h1>
      <div className="dhamma-sermon-index__grid">
        {series.map((s) => (
          <Link key={s.slug} to={`/${s.slug}/`} className="dhamma-sermon-index__card">
            {s.name_si}
          </Link>
        ))}
      </div>
    </div>
  );
}
