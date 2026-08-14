import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listEntries } from '../api/entries';
import './EntryListPage.css';

// The Article-list pattern (build-spec §3): cards (title + excerpt + Read
// More), configured only by `slug` — the same component drives
// Newsletters/Posts, Ape Budu Hamuduruwo, and Important Articles. All the
// per-type difference (title, ordering) comes from the API response.
export function EntryListPage({ slug }) {
  const basePath = `/${slug}/`;
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listEntries(slug, { page, pageSize: 10 })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, page]);

  if (error) return <p className="entry-list__error">Failed to load: {error.message}</p>;

  return (
    <div className="entry-list">
      <header className="entry-list__header">
        <h1>
          {data?.titleEn ?? ''}
          {data?.titleSi ? <span className="entry-list__title-si"> — {data.titleSi}</span> : null}
        </h1>
      </header>

      <div className="entry-list__cards">
        {(data?.entries ?? []).map((entry) => (
          <article key={entry.id} className="entry-card">
            {entry.cover_image ? (
              <img src={entry.cover_image} alt="" className="entry-card__image" />
            ) : null}
            <h2 className="entry-card__title">{entry.title_si}</h2>
            <p className="entry-card__excerpt">{entry.excerpt}</p>
            <Link to={`${basePath}${entry.id}/`} className="entry-card__read-more">
              Read More »
            </Link>
          </article>
        ))}
        {!loading && data && data.entries.length === 0 ? <p>No entries yet.</p> : null}
      </div>

      {data && data.totalPages > 1 ? (
        <div className="entry-list__pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {data.page} of {data.totalPages}
          </span>
          <button type="button" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
