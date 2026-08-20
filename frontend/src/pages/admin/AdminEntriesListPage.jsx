import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listAdminEntries, deleteEntry } from '../../api/admin';
import { ENTRY_TYPE_LABELS } from '../../config/entryTypes';
import './AdminEntriesListPage.css';

// One list page, configured by the `:type` route param — same component
// for all three entry types (mirrors the public EntryListPage).
export function AdminEntriesListPage() {
  const { type } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listAdminEntries(type)
      .then((d) => setEntries(d.entries))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    await deleteEntry(id);
    load();
  }

  const label = ENTRY_TYPE_LABELS[type] ?? type;

  return (
    <div className="admin-entries">
      <header className="admin-entries__header">
        <h1>{label}</h1>
        <Link to={`/admin/entries/${type}/new`} className="btn btn--primary">
          + New entry
        </Link>
      </header>

      {error ? <p className="admin-entries__error">{error.message}</p> : null}

      <table className="admin-entries__table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Published</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{e.title_si}</td>
              <td>{new Date(e.published_at).toLocaleDateString()}</td>
              <td className="admin-entries__actions">
                <Link to={`/admin/entries/${type}/${e.id}/edit`} className="btn btn--secondary btn--sm">
                  Edit
                </Link>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDelete(e.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {!loading && entries.length === 0 ? (
            <tr>
              <td colSpan={3} className="admin-entries__empty">
                No entries yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
