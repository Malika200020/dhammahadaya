import { useCallback } from 'react';
import { searchDictionary } from '../api/dictionaries';
import { usePaginatedSearch, MIN_QUERY_LENGTH } from '../hooks/usePaginatedSearch';
import { SearchableTable } from '../components/SearchableTable';
import { useTranslation } from '../i18n/LanguageContext';

// Thin per-dictionary page: `slug` selects which table the API searches
// (see backend/src/config/dictionaries.js for the whitelist — only
// pali-sinhalese-dictionary and sinhala-dictionary are wired up). The
// search placeholder is looked up here by `slug` (rather than passed in
// from App.jsx as a static string) so it can switch with the language
// toggle — App.jsx isn't itself inside the LanguageProvider it renders, so
// it can't call useTranslation() for these routes' props.
const PLACEHOLDER_KEYS = {
  'pali-sinhalese-dictionary': 'dictionary.paliSearchPlaceholder',
  'sinhala-dictionary': 'dictionary.sinhalaSearchPlaceholder',
};

export function DictionaryPage({ slug }) {
  const { t } = useTranslation();
  const fetchPage = useCallback(
    ({ query, page, pageSize }) => searchDictionary(slug, { query, page, pageSize }),
    [slug]
  );

  const { inputValue, setInputValue, page, setPage, data, loading, error, tooShort } = usePaginatedSearch(fetchPage);

  return (
    <SearchableTable
      titleEn={data?.titleEn ?? ''}
      titleSi={data?.titleSi}
      searchPlaceholder={t(PLACEHOLDER_KEYS[slug])}
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
