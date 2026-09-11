import { useCallback, useEffect, useState } from 'react';
import { listAdminInquiries, deleteInquiry } from '../../api/admin';
import { LoadingState } from '../../components/LoadingState';
import './AdminInquiriesPage.css';

export function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    listAdminInquiries()
      .then((d) => setInquiries(d.inquiries))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this inquiry?')) return;
    await deleteInquiry(id);
    load();
  }

  return (
    <div className="admin-inquiries">
      <h1>Inquiries</h1>
      {error ? <p className="admin-inquiries__error">{error.message}</p> : null}

      {loading && inquiries.length === 0 ? (
        <LoadingState message="Loading… the first load of the day can take up to a minute while the server wakes up." />
      ) : (
        <table className="admin-inquiries__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Submitted</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {inquiries.map((i) => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>{i.email}</td>
                <td>{i.phone ?? ''}</td>
                <td>{i.message}</td>
                <td>{new Date(i.created_at).toLocaleDateString()}</td>
                <td>
                  <button type="button" onClick={() => handleDelete(i.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-inquiries__empty">
                  No inquiries yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </div>
  );
}
