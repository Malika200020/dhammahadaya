import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPohoyaCalendarYear } from '../api/pohoyaCalendar';
import './PohoyaCalendarYearPage.css';

// build-spec §16.3/§16.4 — one page for every year (2025, 2026, and any
// future year admin publishes). The year is parsed out of the pathname
// (React Router v6 can't match a :param fused into a literal path segment
// like "/sathara-pohoya-calendar-2026/") since the set of years is
// admin-extensible, not fixed at build time.
export function PohoyaCalendarYearPage() {
  const { pathname } = useLocation();
  const year = pathname.match(/sathara-pohoya-calendar-([^/]+)/)?.[1];
  const [calendar, setCalendar] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCalendar(null);
    setError(null);
    getPohoyaCalendarYear(year)
      .then((d) => setCalendar(d.calendar))
      .catch(setError);
  }, [year]);

  if (error) return <p className="pohoya-year__error">{error.status === 404 ? `No calendar published for ${year}.` : error.message}</p>;
  if (!calendar) return null;

  return (
    <div className="pohoya-year">
      <h1>සතර පොහොය දින දර්ශනය {calendar.year}</h1>

      <table className="pohoya-year__table">
        <thead>
          <tr>
            <th>Month (Sinhala – English)</th>
            <th>Date</th>
            <th>Weekday</th>
            <th>Poya</th>
          </tr>
        </thead>
        <tbody>
          {calendar.rows.map((row, i) => (
            <tr key={i}>
              <td>{row.month_si_en ?? ''}</td>
              <td>{row.date}</td>
              <td>{row.weekday}</td>
              <td>{row.poya}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {calendar.image_url ? (
        <img className="pohoya-year__image" src={calendar.image_url} alt={`Sathara Pohoya Calendar ${calendar.year}`} />
      ) : (
        <p className="pohoya-year__no-image">Calendar image not yet uploaded.</p>
      )}
    </div>
  );
}
