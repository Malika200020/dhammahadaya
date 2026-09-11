import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPohoyaCalendarYears } from '../api/pohoyaCalendar';
import { LoadingState } from '../components/LoadingState';
import './SatharaPohoyaCalendarIndexPage.css';

// build-spec §16.2 — links to each year's calendar page. Genuinely
// admin-extensible (new years get added over time), unlike the
// dictionary/pdf-books/sermon-series slugs, which are a small fixed set
// known at build time — hence a real :year route param on the year page,
// rather than one literal route per known slug.
export function SatharaPohoyaCalendarIndexPage() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listPohoyaCalendarYears()
      .then((d) => setYears(d.years))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pohoya-index">
      <h1>Sathara Pohoya Calendar</h1>
      {error ? <p className="pohoya-index__error">{error.message}</p> : null}
      {loading ? <LoadingState message="Loading… the first load of the day can take up to a minute while the server wakes up." /> : null}
      <div className="pohoya-index__cards">
        {years.map((y) => (
          <Link key={y.year} to={`/sathara-pohoya-calendar-${y.year}/`} className="pohoya-index__card card card--interactive">
            {y.year}
          </Link>
        ))}
      </div>
      {!loading && years.length === 0 ? <p className="pohoya-index__empty">No calendars published yet.</p> : null}
    </div>
  );
}
