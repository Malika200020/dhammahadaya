import './SearchableTable.css';

// Source data for linkable segments carries a literal leading `"PDF"`
// marker baked into the text (e.g. `"PDF" SP_DN1 - 017`) — redundant once
// rendered as a badge, and it was wrapping onto its own line in narrow
// columns. Stripped for display only; matching/URLs are unaffected.
const LEADING_PDF_MARKER = /^["“]PDF["”]\s*/i;

// A cell value is either a plain string/number (most columns) or an array
// of { text, url } segments for columns that can contain PDF reference
// links (e.g. the Tripitaka catalogue's "PDF ..." columns) — some segments
// resolve to a real link, some don't, both can appear in the same cell.
function Cell({ value }) {
  if (!Array.isArray(value)) return value;
  return (
    <>
      {value.map((segment, i) => {
        const hadPdfMarker = LEADING_PDF_MARKER.test(segment.text);
        const text = segment.text.replace(LEADING_PDF_MARKER, '');
        return (
          <span key={i} className="searchable-table__cell-segment">
            {segment.url ? (
              <a href={segment.url} target="_blank" rel="noopener noreferrer">
                {hadPdfMarker ? <span className="searchable-table__pdf-badge">PDF</span> : null}
                {text}
              </a>
            ) : (
              text
            )}
            {i < value.length - 1 ? ' / ' : ''}
          </span>
        );
      })}
    </>
  );
}

// Merge consecutive columns sharing the same `group` into { group, span }
// runs, for the optional second-tier header row. Columns without a group
// (or when no column sets one at all) render nothing extra.
function buildGroupRuns(columns) {
  const runs = [];
  for (const col of columns) {
    const last = runs[runs.length - 1];
    if (last && last.group === col.group) {
      last.span += 1;
    } else {
      runs.push({ group: col.group, span: 1 });
    }
  }
  return runs;
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
  const hasGroups = columns.some((col) => col.group);
  const groupRuns = hasGroups ? buildGroupRuns(columns) : [];
  const groupEndKeys = hasGroups
    ? new Set(
        columns
          .filter((col, i) => col.group !== columns[i + 1]?.group)
          .map((col) => col.key)
      )
    : new Set();

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
          {hasGroups ? (
            <p className="searchable-table__scroll-hint">
              ⟷ Scroll sideways to see all columns / වගුව සම්පූර්ණයෙන් බැලීමට වමට/දකුණට අනුචලනය කරන්න
            </p>
          ) : null}
          <div className="searchable-table__scroll">
          <table className={`searchable-table__table${hasGroups ? ' searchable-table__table--grouped' : ''}`}>
            <thead>
              {hasGroups ? (
                <tr className="searchable-table__group-row">
                  {groupRuns.map((run, i) => (
                    <th key={i} colSpan={run.span} scope="colgroup">
                      {run.group}
                    </th>
                  ))}
                </tr>
              ) : null}
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={
                      [
                        col.sticky && 'searchable-table__col--sticky',
                        groupEndKeys.has(col.key) && 'searchable-table__col--group-end',
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={
                        [
                          col.sticky && 'searchable-table__col--sticky',
                          col.nowrap && 'searchable-table__col--nowrap',
                          groupEndKeys.has(col.key) && 'searchable-table__col--group-end',
                        ]
                          .filter(Boolean)
                          .join(' ') || undefined
                      }
                    >
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
