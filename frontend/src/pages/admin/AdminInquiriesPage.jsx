import { useCallback, useEffect, useState } from 'react';
import { listAdminInquiries, deleteInquiry } from '../../api/admin';
import './AdminInquiriesPage.css';

export function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listAdminInquiries()
      .then((d) => setInquiries(d.inquiries))
      .catch(setError);
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
          {inquiries.length === 0 ? (
            <tr>
              <td colSpan={6} className="admin-inquiries__empty">
                No inquiries yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
