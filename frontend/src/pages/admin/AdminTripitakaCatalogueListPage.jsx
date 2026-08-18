import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listAdminCatalogueRows, deleteCatalogueRow } from '../../api/admin';
import { usePaginatedSearch, MIN_QUERY_LENGTH } from '../../hooks/usePaginatedSearch';
import './AdminTripitakaCatalogueListPage.css';

// Admin CRUD for the Tripitaka Catalogue (build-spec §6) — "under ongoing
// proofreading", so this reuses the same server-side search+pagination
// pattern as the public catalogue page (usePaginatedSearch), rather than
// listing all 268+ rows unpaginated. Only a subset of the 11 columns is
// shown here (full detail is on the edit form); labels come from the
// backend's own column metadata, not retyped here.
export function AdminTripitakaCatalogueListPage() {
  const fetchPage = useCallback(
    ({ query, page, pageSize }) => listAdminCatalogueRows(query, page, pageSize),
    []
  );
  const { inputValue, setInputValue, page, setPage, data, loading, error, tooShort, refetch } = usePaginatedSearch(fetchPage);

  const columnLabel = (key) => data?.columns?.find((c) => c.key === key)?.label ?? key;

  async function handleDelete(id) {
    if (!window.confirm('Delete this catalogue row? This cannot be undone.')) return;
    await deleteCatalogueRow(id);
    refetch();
  }

  return (
    <div className="admin-catalogue">
      <header className="admin-catalogue__header">
        <h1>Tripitaka Catalogue</h1>
        <Link to="/admin/tripitaka-catalogue/new" className="admin-catalogue__new">
          + New row
        </Link>
      </header>

      <input
        type="search"
        className="admin-catalogue__search"
        placeholder="Search sutta name, nikaya, vagga..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />

      {error ? <p className="admin-catalogue__error">Search failed: {error.message}</p> : null}
      {tooShort ? <p className="admin-catalogue__hint">Type at least {MIN_QUERY_LENGTH} characters to search.</p> : null}

      {!error && !tooShort ? (
        <>
          <div className="admin-catalogue__scroll">
            <table className="admin-catalogue__table">
              <thead>
                <tr>
                  <th>{columnLabel('sutta_name')}</th>
                  <th>{columnLabel('nikaya')}</th>
                  <th>{columnLabel('vagga')}</th>
                  <th>{columnLabel('printed_page_no')}</th>
                  <th>Source</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(data?.rows ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.sutta_name}</td>
                    <td>{row.nikaya}</td>
                    <td>{row.vagga}</td>
                    <td>{row.printed_page_no}</td>
                    <td>
                      <span className={`admin-catalogue__source admin-catalogue__source--${row.source}`}>
                        {row.source === 'admin' ? 'Admin' : 'Legacy'}
                      </span>
                    </td>
                    <td className="admin-catalogue__actions">
                      <Link to={`/admin/tripitaka-catalogue/${row.id}/edit`}>Edit</Link>
                      <button type="button" onClick={() => handleDelete(row.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && data && data.rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-catalogue__empty">
                      No rows.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 ? (
            <div className="admin-catalogue__pagination">
              <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>
                Page {data.page} of {data.totalPages} ({data.totalRows.toLocaleString()} rows)
              </span>
              <button type="button" disabled={page >= data.totalPages || loading} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
