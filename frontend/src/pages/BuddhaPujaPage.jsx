import { useEffect, useState } from 'react';
import { listBuddhaPujaVideos } from '../api/videos';
import { getGallery } from '../api/galleries';
import { VideoGallery } from '../components/VideoGallery';
import { PhotoGallery } from '../components/PhotoGallery';
import { buddhaPujaDedicationParagraphs } from '../content/buddhaPujaContent';
import './BuddhaPujaPage.css';

// build-spec §12 — dedication text, paginated video gallery, then the
// dated photo gallery (admin-uploaded).
export function BuddhaPujaPage() {
  const [page, setPage] = useState(1);
  const [videoData, setVideoData] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [images, setImages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setVideoLoading(true);
    setVideoError(null);
    listBuddhaPujaVideos({ page, pageSize: 12 })
      .then((d) => {
        if (!cancelled) setVideoData(d);
      })
      .catch((e) => {
        if (!cancelled) setVideoError(e);
      })
      .finally(() => {
        if (!cancelled) setVideoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    getGallery('buddha-puja')
      .then((d) => setImages(d.images))
      .catch(() => setImages([]));
  }, []);

  return (
    <div className="buddha-puja">
      <h1>Buddha Puja</h1>

      {/* [CONTENT — Sinhala, migrate verbatim] build-spec §12 */}
      <div className="buddha-puja__dedication card">
        {buddhaPujaDedicationParagraphs.map((paragraph, i) => (
          <p key={i}>
            {paragraph.split('\n').map((line, j) => (
              <span key={j}>
                {line}
                <br />
              </span>
            ))}
          </p>
        ))}
      </div>

      <VideoGallery
        videos={videoData?.videos ?? []}
        page={videoData?.page ?? page}
        totalPages={videoData?.totalPages ?? 1}
        totalRows={videoData?.totalRows ?? 0}
        onPageChange={setPage}
        loading={videoLoading}
        error={videoError}
      />

      <h2 className="buddha-puja__gallery-heading">Photo Gallery</h2>
      <PhotoGallery images={images} />
    </div>
  );
}
