import { useCallback, useEffect, useState } from 'react';
import { listAdminGalleryImages, createGalleryImage, deleteGalleryImage, uploadImage } from '../../api/admin';
import './AdminGalleryPage.css';

// Generic admin photo-gallery manager — configured by `gallery` (+
// optional `galleryKey`, e.g. a Katina year later). Not Buddha-Puja-
// specific: reused as-is wherever build-spec calls for an admin-uploaded
// photo gallery (§11 Katina, §12 Buddha Puja, §14 About).
export function AdminGalleryPage({ gallery, galleryKey, title }) {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageDate, setImageDate] = useState('');
  const [caption, setCaption] = useState('');

  const load = useCallback(() => {
    setError(null);
    listAdminGalleryImages(gallery, galleryKey)
      .then((d) => setImages(d.images))
      .catch(setError);
  }, [gallery, galleryKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadImage(file);
      await createGalleryImage({
        gallery,
        gallery_key: galleryKey || null,
        image_url: url,
        image_date: imageDate || null,
        caption: caption || null,
      });
      setImageDate('');
      setCaption('');
      e.target.value = '';
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this photo?')) return;
    await deleteGalleryImage(id);
    load();
  }

  return (
    <div className="admin-gallery">
      <h1>{title}</h1>

      <div className="admin-gallery__upload">
        <label>
          Date
          <input type="date" value={imageDate} onChange={(e) => setImageDate(e.target.value)} />
        </label>
        <label>
          Caption
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="optional" />
        </label>
        <label>
          Add photo
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        </label>
        {uploading ? <span className="admin-gallery__uploading">Uploading...</span> : null}
      </div>

      {error ? <p className="admin-gallery__error">{error.message}</p> : null}

      <div className="admin-gallery__grid">
        {images.map((img) => (
          <figure key={img.id} className="admin-gallery__item">
            <img src={img.image_url} alt="" />
            <figcaption>
              {img.image_date ? new Date(img.image_date).toLocaleDateString() : null}
              {img.caption ? ` ${img.caption}` : null}
            </figcaption>
            <button type="button" onClick={() => handleDelete(img.id)}>
              Delete
            </button>
          </figure>
        ))}
        {images.length === 0 ? <p className="admin-gallery__empty">No photos yet.</p> : null}
      </div>
    </div>
  );
}
