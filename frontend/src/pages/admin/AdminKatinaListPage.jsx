import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAdminKatinaYears, deleteKatinaYear } from '../../api/admin';
import { LoadingState } from '../../components/LoadingState';
import './AdminKatinaListPage.css';

export function AdminKatinaListPage() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    listAdminKatinaYears()
      .then((d) => setYears(d.years))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(year) {
    if (!window.confirm(`Delete Katina ${year}? This also removes its photo gallery.`)) return;
    try {
      await deleteKatinaYear(year);
      load();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="admin-katina">
      <header className="admin-katina__header">
        <h1>Katina Ceremony Years</h1>
        <Link to="/admin/katina/new" className="admin-katina__new">
          + New year
        </Link>
      </header>

      {error ? <p className="admin-katina__error">{error.message}</p> : null}

      {loading && years.length === 0 ? (
        <LoadingState message="Loading… the first load of the day can take up to a minute while the server wakes up." />
      ) : (
        <table className="admin-katina__table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Organizers</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <tr key={y.year}>
                <td>{y.year}</td>
                <td>{y.organizers.join(', ')}</td>
                <td className="admin-katina__actions">
                  <Link to={`/admin/katina/${y.year}/edit`}>Edit organizers</Link>
                  <Link to={`/admin/galleries/katina/${y.year}`}>Gallery</Link>
                  <button type="button" onClick={() => handleDelete(y.year)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && years.length === 0 ? (
              <tr>
                <td colSpan={3} className="admin-katina__empty">
                  No years yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </div>
  );
}
