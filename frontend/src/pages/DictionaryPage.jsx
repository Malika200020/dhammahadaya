import { useCallback } from 'react';
import { searchDictionary } from '../api/dictionaries';
import { usePaginatedSearch, MIN_QUERY_LENGTH } from '../hooks/usePaginatedSearch';
import { SearchableTable } from '../components/SearchableTable';

// Thin per-dictionary page: `slug` selects which table the API searches
// (see backend/src/config/dictionaries.js for the whitelist — only
// pali-sinhalese-dictionary and sinhala-dictionary are wired up).
export function DictionaryPage({ slug, searchPlaceholder }) {
  const fetchPage = useCallback(
    ({ query, page, pageSize }) => searchDictionary(slug, { query, page, pageSize }),
    [slug]
  );

  const { inputValue, setInputValue, page, setPage, data, loading, error, tooShort } = usePaginatedSearch(fetchPage);

  return (
    <SearchableTable
      titleEn={data?.titleEn ?? ''}
      titleSi={data?.titleSi}
      searchPlaceholder={searchPlaceholder}
      inputValue={inputValue}
      onInputChange={setInputValue}
      columns={data?.columns ?? []}
      rows={data?.rows ?? []}
      page={data?.page ?? page}
      totalPages={data?.totalPages ?? 1}
      totalRows={data?.totalRows ?? 0}
      onPageChange={setPage}
      loading={loading}
      error={error}
      tooShort={tooShort}
      minQueryLength={MIN_QUERY_LENGTH}
    />
  );
}
