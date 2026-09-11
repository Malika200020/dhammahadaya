import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAdminPohoyaCalendarYears, deletePohoyaCalendarYear } from '../../api/admin';
import { LoadingState } from '../../components/LoadingState';
import './AdminPohoyaCalendarListPage.css';

export function AdminPohoyaCalendarListPage() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    listAdminPohoyaCalendarYears()
      .then((d) => setYears(d.years))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(year) {
    if (!window.confirm(`Delete the ${year} calendar?`)) return;
    await deletePohoyaCalendarYear(year);
    load();
  }

  return (
    <div className="admin-pohoya">
      <header className="admin-pohoya__header">
        <h1>Sathara Pohoya Calendars</h1>
        <Link to="/admin/pohoya-calendar/new" className="admin-pohoya__new">
          + New year
        </Link>
      </header>

      {error ? <p className="admin-pohoya__error">{error.message}</p> : null}

      {loading && years.length === 0 ? (
        <LoadingState message="Loading… the first load of the day can take up to a minute while the server wakes up." />
      ) : (
        <table className="admin-pohoya__table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Rows</th>
              <th>Image</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <tr key={y.year}>
                <td>{y.year}</td>
                <td>{y.rows.length}</td>
                <td>{y.image_url ? 'Uploaded' : 'Not yet uploaded'}</td>
                <td className="admin-pohoya__actions">
                  <Link to={`/admin/pohoya-calendar/${y.year}/edit`}>Edit</Link>
                  <button type="button" onClick={() => handleDelete(y.year)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && years.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin-pohoya__empty">
                  No calendars yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </div>
  );
}
