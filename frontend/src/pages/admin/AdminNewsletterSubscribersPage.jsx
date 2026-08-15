import { useCallback, useEffect, useState } from 'react';
import { listAdminNewsletterSubscribers, deleteNewsletterSubscriber } from '../../api/admin';
import './AdminNewsletterSubscribersPage.css';

export function AdminNewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listAdminNewsletterSubscribers()
      .then((d) => setSubscribers(d.subscribers))
      .catch(setError);
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
          {subscribers.length === 0 ? (
            <tr>
              <td colSpan={3} className="admin-newsletter__empty">
                No subscribers yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
