import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEntry } from '../api/entries';
import './EntryDetailPage.css';

// Full entry + previous/next navigation (build-spec §3). Same component
// for all three entry types — configured only by `slug`.
export function EntryDetailPage({ slug }) {
  const basePath = `/${slug}/`;
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEntry(slug, id)
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
  }, [slug, id]);

  if (loading) return null;
  if (error) return <p className="entry-detail__error">Failed to load: {error.message}</p>;
  if (!data) return null;

  const { entry, prev, next } = data;

  return (
    <div className="entry-detail">
      <Link to={basePath} className="btn btn--secondary btn--sm entry-detail__back">
        « Back to list
      </Link>
      <h1>{entry.title_si}</h1>
      {entry.cover_image ? <img src={entry.cover_image} alt="" className="entry-detail__image" /> : null}
      {/* Body is admin-authored rich text (behind auth), not user-submitted — rendered trusted, as-is. */}
      <div className="entry-detail__body" dangerouslySetInnerHTML={{ __html: entry.body }} />

      <nav className="entry-detail__nav">
        {prev ? (
          <Link to={`${basePath}${prev.id}/`} className="entry-detail__nav-prev">
            « {prev.title_si}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`${basePath}${next.id}/`} className="entry-detail__nav-next">
            {next.title_si} »
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
