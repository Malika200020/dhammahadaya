import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAdminVideoSeries, deleteVideoSeries } from '../../api/admin';
import './AdminVideoSeriesListPage.css';

export function AdminVideoSeriesListPage() {
  const [series, setSeries] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listAdminVideoSeries()
      .then((d) => setSeries(d.series))
      .catch(setError);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(slug) {
    if (!window.confirm('Delete this series? It must have no videos left in it.')) return;
    try {
      await deleteVideoSeries(slug);
      load();
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <div className="admin-video-series">
      <header className="admin-video-series__header">
        <h1>Dhamma Sermon Series</h1>
        <Link to="/admin/video-series/new" className="admin-video-series__new">
          + New series
        </Link>
      </header>

      {error ? <p className="admin-video-series__error">{error.message}</p> : null}

      <table className="admin-video-series__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Order</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.slug}>
              <td>{s.name_si}</td>
              <td>{s.slug}</td>
              <td>{s.order}</td>
              <td className="admin-video-series__actions">
                <Link to={`/admin/video-series/${s.slug}/edit`}>Edit</Link>
                <Link to={`/admin/videos/dhamma-sermon/${s.slug}`}>Videos</Link>
                <button type="button" onClick={() => handleDelete(s.slug)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
