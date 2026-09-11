import { optimizeCloudinaryUrl } from '../utils/cloudinaryImage';
import { LoadingState } from './LoadingState';
import './PhotoGallery.css';

// Generic admin-uploaded photo gallery grid — shared by Buddha Puja (§12)
// now, Katina (§11) and About (§14) later. Takes plain {image_url,
// image_date, caption} rows; no section-specific logic. `loading` is
// optional — callers that don't track it (or already show their own
// loading state) can omit it and keep the old empty-means-nothing behavior.
export function PhotoGallery({ images, loading = false }) {
  if (loading && images.length === 0) return <LoadingState message="Loading photos…" />;
  if (images.length === 0) return null;

  return (
    <div className="photo-gallery">
      {images.map((img) => (
        <figure key={img.id} className="photo-gallery__item">
          <img src={optimizeCloudinaryUrl(img.image_url)} alt={img.caption ?? ''} loading="lazy" />
          {img.image_date || img.caption ? (
            <figcaption>
              {img.image_date ? new Date(img.image_date).toLocaleDateString() : null}
              {img.image_date && img.caption ? ' — ' : null}
              {img.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
