import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAdminSpecialThanks, deleteSpecialThanks } from '../../api/admin';
import './AdminSpecialThanksListPage.css';

export function AdminSpecialThanksListPage() {
  const [sections, setSections] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listAdminSpecialThanks()
      .then((d) => setSections(d.sections))
      .catch(setError);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this section?')) return;
    await deleteSpecialThanks(id);
    load();
  }

  return (
    <div className="admin-special-thanks">
      <header className="admin-special-thanks__header">
        <h1>Special Thanks</h1>
        <Link to="/admin/special-thanks/new" className="admin-special-thanks__new">
          + New section
        </Link>
      </header>

      {error ? <p className="admin-special-thanks__error">{error.message}</p> : null}

      <table className="admin-special-thanks__table">
        <thead>
          <tr>
            <th>Section (EN)</th>
            <th>Section (SI)</th>
            <th>Purpose</th>
            <th>Donors</th>
            <th>Order</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => (
            <tr key={s.id}>
              <td>{s.section_en ?? ''}</td>
              <td>{s.section_si}</td>
              <td>{s.purpose ?? ''}</td>
              <td>{s.donors.join(', ')}</td>
              <td>{s.order}</td>
              <td className="admin-special-thanks__actions">
                <Link to={`/admin/special-thanks/${s.id}/edit`}>Edit</Link>
                <button type="button" onClick={() => handleDelete(s.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {sections.length === 0 ? (
            <tr>
              <td colSpan={6} className="admin-special-thanks__empty">
                No sections yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
