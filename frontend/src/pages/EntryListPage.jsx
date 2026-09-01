import { useEffect, useState } from 'react';
import { listEntries } from '../api/entries';
import { EntryCard } from '../components/EntryCard';
import { apeBuduHamuduruwoHeader, apeBuduHamuduruwoIntroParagraphs } from '../content/apeBuduHamuduruwoContent';
import './EntryListPage.css';

// The Article-list pattern (build-spec §3): cards (title + excerpt + Read
// More), configured only by `slug` — the same component drives
// Newsletters/Posts, Ape Budu Hamuduruwo, and Important Articles. All the
// per-type difference (title, ordering) comes from the API response. Ape
// Budu Hamuduruwo is the one slug of the three with its own static
// devotional intro block required by build-spec §5.1 (Posts/§5.2 and
// Important Articles/§5.4 don't have one) — rendered above the list only
// for that slug.
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
      {slug === 'ape-budu-hamuduruwo-all' ? (
        <div className="entry-list__intro card">
          <h2>{apeBuduHamuduruwoHeader}</h2>
          {apeBuduHamuduruwoIntroParagraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      <header className="entry-list__header">
        <h1>
          {data?.titleEn ?? ''}
          {data?.titleSi ? <span className="entry-list__title-si"> — {data.titleSi}</span> : null}
        </h1>
      </header>

      <div className="entry-list__cards">
        {(data?.entries ?? []).map((entry) => (
          <EntryCard key={entry.id} entry={entry} basePath={basePath} />
        ))}
        {!loading && data && data.entries.length === 0 ? <p>No entries yet.</p> : null}
      </div>

      {data && data.totalPages > 1 ? (
        <div className="entry-list__pagination">
          <button type="button" className="btn btn--secondary btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
