import { useCallback } from 'react';
import { searchTripitakaCatalogue } from '../api/catalogue';
import { usePaginatedSearch, MIN_QUERY_LENGTH } from '../hooks/usePaginatedSearch';
import { SearchableTable } from '../components/SearchableTable';
import {
  catalogueIntroParagraphs,
  catalogueColumnLegend,
  catalogueDisclaimer,
} from '../content/tripitakaCatalogueContent';
import './TripitakaCataloguePage.css';

// [CONTENT — Sinhala, migrate verbatim] devotional intro, column-legend
// explanations, and the incompleteness disclaimer (build-spec §6) — text
// itself lives in ../content/tripitakaCatalogueContent.js, extracted
// programmatically from docs/Dhammahadaya.net.txt rather than retyped.
function CatalogueStaticContent() {
  return (
    <div className="catalogue-static card">
      {catalogueIntroParagraphs.map((paragraph, i) => (
        <p key={i} className="catalogue-static__intro-paragraph">
          {paragraph.split('\n').map((line, j) => (
            <span key={j}>
              {line}
              <br />
            </span>
          ))}
        </p>
      ))}

      <dl className="catalogue-static__legend">
        {catalogueColumnLegend.map((entry) => (
          <div key={entry.label} className="catalogue-static__legend-row">
            <dt>{entry.label}</dt>
            <dd>{entry.description}</dd>
          </div>
        ))}
      </dl>

      <p className="catalogue-static__disclaimer">{catalogueDisclaimer}</p>
    </div>
  );
}

export function TripitakaCataloguePage() {
  const fetchPage = useCallback(
    ({ query, page, pageSize }) => searchTripitakaCatalogue({ query, page, pageSize }),
    []
  );

  const { inputValue, setInputValue, page, setPage, data, loading, error, tooShort } = usePaginatedSearch(fetchPage);

  return (
    <SearchableTable
      titleEn={data?.titleEn ?? ''}
      titleSi={data?.titleSi}
      searchPlaceholder="Search sutta name, nikaya, vagga... / සූත්‍ර නාමය සොයන්න..."
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
    >
      <CatalogueStaticContent />
    </SearchableTable>
  );
}
