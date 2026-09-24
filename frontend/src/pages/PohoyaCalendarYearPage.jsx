import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPohoyaCalendarYear } from '../api/pohoyaCalendar';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryImage';
import { LoadingState } from '../components/LoadingState';
import { useTranslation } from '../i18n/LanguageContext';
import './PohoyaCalendarYearPage.css';

// build-spec §16.3/§16.4 — one page for every year (2025, 2026, and any
// future year admin publishes). The year is parsed out of the pathname
// (React Router v6 can't match a :param fused into a literal path segment
// like "/sathara-pohoya-calendar-2026/") since the set of years is
// admin-extensible, not fixed at build time.
export function PohoyaCalendarYearPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const year = pathname.match(/sathara-pohoya-calendar-([^/]+)/)?.[1];
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCalendar(null);
    setError(null);
    setLoading(true);
    getPohoyaCalendarYear(year)
      .then((d) => setCalendar(d.calendar))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [year]);

  if (error) return <p className="pohoya-year__error">{error.status === 404 ? t('pohoyaYear.notPublished', { year }) : error.message}</p>;
  if (loading) return <LoadingState message={t('common.loadingColdStart')} />;
  if (!calendar) return null;

  return (
    <div className="pohoya-year">
      <h1>{t('pohoyaYear.pageTitle', { year: calendar.year })}</h1>

      <table className="pohoya-year__table">
        <thead>
          <tr>
            <th>{t('pohoyaYear.monthColumn')}</th>
            <th>{t('pohoyaYear.dateColumn')}</th>
            <th>{t('pohoyaYear.weekdayColumn')}</th>
            <th>{t('pohoyaYear.poyaColumn')}</th>
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
        <img className="pohoya-year__image" src={optimizeCloudinaryUrl(calendar.image_url)} alt={`Sathara Pohoya Calendar ${calendar.year}`} />
      ) : (
        <p className="pohoya-year__no-image">{t('pohoyaYear.imageNotUploaded')}</p>
      )}
    </div>
  );
}
