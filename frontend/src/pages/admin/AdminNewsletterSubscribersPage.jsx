import { useCallback, useEffect, useState } from 'react';
import { listAdminNewsletterSubscribers, deleteNewsletterSubscriber } from '../../api/admin';
import { LoadingState } from '../../components/LoadingState';
import './AdminNewsletterSubscribersPage.css';

export function AdminNewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    listAdminNewsletterSubscribers()
      .then((d) => setSubscribers(d.subscribers))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Remove this subscriber?')) return;
    await deleteNewsletterSubscriber(id);
    load();
  }

  return (
    <div className="admin-newsletter">
      <h1>Newsletter Subscribers</h1>
      {error ? <p className="admin-newsletter__error">{error.message}</p> : null}

      {loading && subscribers.length === 0 ? (
        <LoadingState message="Loading… the first load of the day can take up to a minute while the server wakes up." />
      ) : (
        <table className="admin-newsletter__table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
                <td>
                  <button type="button" onClick={() => handleDelete(s.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!loading && subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="admin-newsletter__empty">
                  No subscribers yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </div>
  );
}
