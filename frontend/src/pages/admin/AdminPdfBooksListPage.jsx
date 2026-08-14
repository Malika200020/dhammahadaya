import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listAdminPdfBooks, deletePdfBook } from '../../api/admin';
import { PDF_BOOK_CATEGORY_LABELS } from '../../config/pdfBookCategories';
import './AdminPdfBooksListPage.css';

const STATUS_LABELS = {
  available: 'Available',
  available_new: 'Available (new)',
  no_link_yet: 'No link yet',
};

// One list page, configured by the `:category` route param — same
// component for all four PDF Books categories.
export function AdminPdfBooksListPage() {
  const { category } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listAdminPdfBooks(category)
      .then((d) => setEntries(d.entries))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this PDF entry? This cannot be undone.')) return;
    await deletePdfBook(id);
    load();
  }

  const label = PDF_BOOK_CATEGORY_LABELS[category] ?? category;

  return (
    <div className="admin-pdf-books">
      <header className="admin-pdf-books__header">
        <h1>{label}</h1>
        <Link to={`/admin/pdf-books/${category}/new`} className="admin-pdf-books__new">
          + New entry
        </Link>
      </header>

      {error ? <p className="admin-pdf-books__error">{error.message}</p> : null}

      <table className="admin-pdf-books__table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Subsection</th>
            <th>Title</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{e.section}</td>
              <td>{e.subsection}</td>
              <td>{e.title}</td>
              <td>
                <span className={`admin-pdf-books__status admin-pdf-books__status--${e.link_status}`}>
                  {STATUS_LABELS[e.link_status] ?? e.link_status}
                </span>
              </td>
              <td className="admin-pdf-books__actions">
                <Link to={`/admin/pdf-books/${category}/${e.id}/edit`}>Edit</Link>
                <button type="button" onClick={() => handleDelete(e.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {!loading && entries.length === 0 ? (
            <tr>
              <td colSpan={5} className="admin-pdf-books__empty">
                No entries yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
