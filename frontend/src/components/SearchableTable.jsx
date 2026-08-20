import './SearchableTable.css';

// A cell value is either a plain string/number (most columns) or an array
// of { text, url } segments for columns that can contain PDF reference
// links (e.g. the Tripitaka catalogue's "PDF ..." columns) — some segments
// resolve to a real link, some don't, both can appear in the same cell.
function Cell({ value }) {
  if (!Array.isArray(value)) return value;
  return (
    <>
      {value.map((segment, i) => (
        <span key={i} className="searchable-table__cell-segment">
          {segment.url ? (
            <a href={segment.url} target="_blank" rel="noopener noreferrer">
              {segment.text}
            </a>
          ) : (
            segment.text
          )}
          {i < value.length - 1 ? ' / ' : ''}
        </span>
      ))}
    </>
  );
}

// Reusable shell: heading + search box + paginated results table.
// Deliberately generic — columns and rows come entirely from the API
// response, so the same component drives any search-backed table
// (dictionaries, the Tripitaka catalogue). `children`, if given, renders
// between the heading and the search box — e.g. the catalogue's static
// devotional/legend/disclaimer content.
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
  tooShort,
  minQueryLength,
  children,
}) {
  return (
    <div className="searchable-table">
      {titleEn ? (
        <header className="searchable-table__header">
          <h1>
            {titleEn}
            {titleSi ? <span className="searchable-table__title-si"> — {titleSi}</span> : null}
          </h1>
        </header>
      ) : null}

      {children}

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
      ) : tooShort ? (
        <p className="searchable-table__hint">Type at least {minQueryLength} characters to search.</p>
      ) : (
        <>
          <div className="searchable-table__scroll">
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
                    <td key={col.key}>
                      <Cell value={row[col.key]} />
                    </td>
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
          </div>

          <div className="searchable-table__pagination">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
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
              className="btn btn--secondary btn--sm"
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
