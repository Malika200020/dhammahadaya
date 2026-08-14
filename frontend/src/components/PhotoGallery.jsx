import './PhotoGallery.css';

// Generic admin-uploaded photo gallery grid — shared by Buddha Puja (§12)
// now, Katina (§11) and About (§14) later. Takes plain {image_url,
// image_date, caption} rows; no section-specific logic.
export function PhotoGallery({ images }) {
  if (images.length === 0) return null;

  return (
    <div className="photo-gallery">
      {images.map((img) => (
        <figure key={img.id} className="photo-gallery__item">
          <img src={img.image_url} alt={img.caption ?? ''} loading="lazy" />
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
