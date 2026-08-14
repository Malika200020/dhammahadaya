import { useEffect, useState } from 'react';
import { listSeriesVideos } from '../api/videos';
import { VideoGallery } from '../components/VideoGallery';
import './DhammaSermonSeriesPage.css';

// One page for all six Dhamma Sermons series (build-spec §9) — `seriesSlug`
// selects which one (same literal-route-per-slug + prop pattern as
// DictionaryPage/PdfBookCategoryPage/EntryListPage, not a dynamic :param
// route); everything else (title, videos, pagination) comes from the API.
export function DhammaSermonSeriesPage({ seriesSlug }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [seriesSlug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listSeriesVideos(seriesSlug, { page, pageSize: 12 })
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
  }, [seriesSlug, page]);

  if (error) return <p className="dhamma-sermon-series__error">Failed to load: {error.message}</p>;

  return (
    <div className="dhamma-sermon-series">
      <h1>{data?.series?.name_si ?? ''}</h1>
      <VideoGallery
        videos={data?.videos ?? []}
        page={data?.page ?? page}
        totalPages={data?.totalPages ?? 1}
        totalRows={data?.totalRows ?? 0}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  );
}
