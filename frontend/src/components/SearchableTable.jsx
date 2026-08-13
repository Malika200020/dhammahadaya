import './SearchableTable.css';

// Reusable shell: heading + search box + paginated results table.
// Deliberately generic — columns and rows come entirely from the API
// response, so the same component drives any search-backed table
// (dictionaries now, the Tripitaka catalogue next).
export function SearchableTable({
  titleEn,
  titleSi,
  searchPlaceholder,
  inputValue,
  onInputChange,
  columns,
  rows,
  page,
  totalPages,
  totalRows,
  onPageChange,
  loading,
  error,
}) {
  return (
    <div className="searchable-table">
      <header className="searchable-table__header">
        <h1>
          {titleEn}
          {titleSi ? <span className="searchable-table__title-si"> — {titleSi}</span> : null}
        </h1>
      </header>

      <input
        type="search"
        className="searchable-table__search"
        placeholder={searchPlaceholder}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        aria-label={searchPlaceholder}
      />

      {error ? (
        <p className="searchable-table__error">Search failed: {error.message}</p>
      ) : (
        <>
          <table className="searchable-table__table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>{row[col.key]}</td>
                  ))}
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="searchable-table__empty">
                    No results.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <div className="searchable-table__pagination">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages} ({totalRows.toLocaleString()} results)
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
