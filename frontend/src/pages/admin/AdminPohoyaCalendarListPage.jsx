import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAdminPohoyaCalendarYears, deletePohoyaCalendarYear } from '../../api/admin';
import './AdminPohoyaCalendarListPage.css';

export function AdminPohoyaCalendarListPage() {
  const [years, setYears] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listAdminPohoyaCalendarYears()
      .then((d) => setYears(d.years))
      .catch(setError);
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
          {years.length === 0 ? (
            <tr>
              <td colSpan={4} className="admin-pohoya__empty">
                No calendars yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
