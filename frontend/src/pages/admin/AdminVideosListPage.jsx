import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listAdminVideos, deleteVideo } from '../../api/admin';
import './AdminVideosListPage.css';

// One list page for both video sections — `section` prop selects Dhamma
// Sermon (scoped to :seriesSlug) vs Buddha Puja (no series).
export function AdminVideosListPage({ section }) {
  const { seriesSlug } = useParams();
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listAdminVideos(section, seriesSlug)
      .then((d) => setVideos(d.videos))
      .catch(setError);
  }, [section, seriesSlug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this video?')) return;
    await deleteVideo(id);
    load();
  }

  const basePath = section === 'dhamma_sermon' ? `/admin/videos/dhamma-sermon/${seriesSlug}` : '/admin/videos/buddha-puja';
  const title = section === 'dhamma_sermon' ? `Videos — ${seriesSlug}` : 'Buddha Puja Videos';

  return (
    <div className="admin-videos">
      <header className="admin-videos__header">
        <h1>{title}</h1>
        <Link to={`${basePath}/new`} className="admin-videos__new">
          + New video
        </Link>
      </header>

      {error ? <p className="admin-videos__error">{error.message}</p> : null}

      <table className="admin-videos__table">
        <thead>
          <tr>
            <th>Title</th>
            <th>YouTube ID</th>
            <th>Year</th>
            <th>{section === 'buddha_puja' ? 'Type' : 'Speaker'}</th>
            <th>Order</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => (
            <tr key={v.id}>
              <td>{v.title_si}</td>
              <td>{v.youtube_id}</td>
              <td>{v.year ?? ''}</td>
              <td>{section === 'buddha_puja' ? v.video_type ?? '' : v.speaker ?? ''}</td>
              <td>{v.order}</td>
              <td className="admin-videos__actions">
                <Link to={`${basePath}/${v.id}/edit`}>Edit</Link>
                <button type="button" onClick={() => handleDelete(v.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {videos.length === 0 ? (
            <tr>
              <td colSpan={6} className="admin-videos__empty">
                No videos yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
