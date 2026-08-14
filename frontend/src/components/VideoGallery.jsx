import { useEffect, useState } from 'react';
import './VideoGallery.css';

function VideoThumbnail({ video, active, onClick }) {
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <button
      type="button"
      className={`video-gallery__thumb${active ? ' video-gallery__thumb--active' : ''}`}
      onClick={onClick}
    >
      {thumbFailed ? (
        // A private/deleted video still gets a normal-looking thumbnail
        // URL from YouTube, but it can 404 or serve a generic gray image —
        // either way this row must still render, just visibly degraded,
        // not break the page.
        <span className="video-gallery__thumb-fallback">Thumbnail unavailable</span>
      ) : (
        <img
          src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
          alt=""
          onError={() => setThumbFailed(true)}
        />
      )}
      <span className="video-gallery__thumb-title">{video.title_si}</span>
    </button>
  );
}

// Reusable paginated video gallery (build-spec §9 sermon series, §12
// Buddha Puja): a "now playing" embed + a thumbnail grid below it.
// Configured entirely by the `videos` prop's shape — no section-specific
// logic here. A private/unavailable YouTube ID still renders its row;
// the iframe just shows YouTube's own "Video unavailable" state, which
// happens naturally without any special-casing on our side.
export function VideoGallery({ videos, page, totalPages, totalRows, onPageChange, loading, error }) {
  const [activeId, setActiveId] = useState(videos[0]?.id ?? null);

  useEffect(() => {
    setActiveId(videos[0]?.id ?? null);
  }, [videos]);

  if (error) return <p className="video-gallery__error">Failed to load: {error.message}</p>;

  const activeVideo = videos.find((v) => v.id === activeId) ?? videos[0];

  return (
    <div className="video-gallery">
      {activeVideo ? (
        <div className="video-gallery__player">
          <iframe
            key={activeVideo.id}
            src={`https://www.youtube.com/embed/${activeVideo.youtube_id}`}
            title={activeVideo.title_si}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <p className="video-gallery__player-title">{activeVideo.title_si}</p>
        </div>
      ) : !loading ? (
        <p className="video-gallery__empty">No videos yet.</p>
      ) : null}

      <div className="video-gallery__grid">
        {videos.map((video) => (
          <VideoThumbnail
            key={video.id}
            video={video}
            active={video.id === activeVideo?.id}
            onClick={() => setActiveId(video.id)}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="video-gallery__pagination">
          <button type="button" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages} ({totalRows.toLocaleString()} videos)
          </span>
          <button type="button" disabled={page >= totalPages || loading} onClick={() => onPageChange(page + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
