import { useCallback, useEffect, useState } from 'react';
import { listAdminMeditationApplications, deleteMeditationApplication } from '../../api/admin';
import './AdminMeditationApplicationsPage.css';

export function AdminMeditationApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listAdminMeditationApplications()
      .then((d) => setApplications(d.applications))
      .catch(setError);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this application?')) return;
    await deleteMeditationApplication(id);
    load();
  }

  return (
    <div className="admin-meditation">
      <h1>Meditation Program Applications</h1>
      {error ? <p className="admin-meditation__error">{error.message}</p> : null}

      <table className="admin-meditation__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>From</th>
            <th>To</th>
            <th>Experience</th>
            <th>Types</th>
            <th>Previous teachers</th>
            <th>Diseases</th>
            <th>Submitted</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {applications.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{a.phone}</td>
              <td>{a.from_date}</td>
              <td>{a.to_date}</td>
              <td>{a.experience}</td>
              <td>{a.meditation_types ?? ''}</td>
              <td>{a.previous_teachers ?? ''}</td>
              <td>{a.current_diseases ?? ''}</td>
              <td>{new Date(a.created_at).toLocaleDateString()}</td>
              <td>
                <button type="button" onClick={() => handleDelete(a.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {applications.length === 0 ? (
            <tr>
              <td colSpan={11} className="admin-meditation__empty">
                No applications yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
