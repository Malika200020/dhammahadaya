import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 300;

// Generic paginated-search state machine: debounces the query, resets to
// page 1 whenever the query changes, and re-fetches on query/page change.
// `fetchPage` is whatever page-fetching function the caller wires up (a
// dictionary search, later the Tripitaka catalogue search, etc).
export function usePaginatedSearch(fetchPage, { pageSize = 20 } = {}) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputValue), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPage({ query: debouncedQuery, page, pageSize })
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
  }, [debouncedQuery, page, pageSize]);

  return {
    inputValue,
    setInputValue,
    page,
    setPage,
    data,
    loading,
    error,
  };
}
