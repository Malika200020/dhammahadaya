import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 300;

// Below this length a query can't form a full trigram, so pg_trgm falls
// back to a sequential scan (confirmed in docs/data-notes.md / the search
// spike). Not firing short queries avoids that fallback and is better UX
// besides — 1-2 typed characters are rarely a useful search yet.
export const MIN_QUERY_LENGTH = 3;

// Generic paginated-search state machine: debounces the query, resets to
// page 1 whenever the query changes, and re-fetches on query/page change.
// `fetchPage` is whatever page-fetching function the caller wires up (a
// dictionary search, the Tripitaka catalogue search, etc).
export function usePaginatedSearch(fetchPage, { pageSize = 20 } = {}) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bumped by refetch() to re-run the fetch effect below without changing
  // the query/page — needed by admin consumers that mutate a row (edit/
  // delete) and then want the current page's data refreshed in place.
  // Read-only consumers (dictionaries, the public catalogue) never call
  // this, so it's a no-op for them.
  const [refetchToken, setRefetchToken] = useState(0);
  const refetch = () => setRefetchToken((t) => t + 1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputValue), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const trimmedQuery = debouncedQuery.trim();
  const tooShort = trimmedQuery.length > 0 && trimmedQuery.length < MIN_QUERY_LENGTH;

  useEffect(() => {
    if (tooShort) {
      // Don't fire a search for 1-2 characters; leave whatever results are
      // already on screen alone rather than re-querying.
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPage({ query: trimmedQuery, page, pageSize })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // fetchPage is expected to be stable per page instance (defined via useCallback / module scope by the caller).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tooShort, trimmedQuery, page, pageSize, refetchToken]);

  return {
    inputValue,
    setInputValue,
    page,
    setPage,
    data,
    loading,
    error,
    tooShort,
    refetch,
  };
}
