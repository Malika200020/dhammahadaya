import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminEntry, createEntry, updateEntry, uploadImage } from '../../api/admin';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { ENTRY_TYPE_LABELS } from '../../config/entryTypes';
import './AdminEntryFormPage.css';

// One form, configured by the `:type` route param, for both create (no
// :id) and edit (:id present) — same component for all three entry types.
export function AdminEntryFormPage() {
  const { type, id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [titleSi, setTitleSi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [publishedAt, setPublishedAt] = useState('');
  const [order, setOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getAdminEntry(id)
      .then((d) => {
        const e = d.entry;
        setTitleSi(e.title_si);
        setTitleEn(e.title_en ?? '');
        setExcerpt(e.excerpt);
        setBody(e.body);
        setCoverImage(e.cover_image);
        setPublishedAt(e.published_at ? e.published_at.slice(0, 10) : '');
        setOrder(e.order ?? 0);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, [isEdit, id]);

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadImage(file);
      setCoverImage(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      type,
      title_si: titleSi,
      title_en: titleEn || null,
      excerpt,
      body,
      cover_image: coverImage,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      order: Number(order) || 0,
    };
    try {
      if (isEdit) await updateEntry(id, payload);
      else await createEntry(payload);
      navigate(`/admin/entries/${type}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="admin-entry-form">
      <h1>
        {isEdit ? 'Edit entry' : 'New entry'} — {ENTRY_TYPE_LABELS[type] ?? type}
      </h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title (Sinhala) *
          <input value={titleSi} onChange={(e) => setTitleSi(e.target.value)} required />
        </label>
        <label>
          Title (English)
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </label>
        <label>
          Excerpt *
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required rows={3} />
        </label>
        <label>
          Body *
          <RichTextEditor value={body} onChange={setBody} />
        </label>
        <label>
          Cover image
          <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
        </label>
        {uploading ? <p className="admin-entry-form__uploading">Uploading...</p> : null}
        {coverImage ? <img src={coverImage} alt="" className="admin-entry-form__preview" /> : null}
        <label>
          Published date
          <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
        </label>
        <label>
          Order
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
        </label>

        {error ? <p className="admin-entry-form__error">{error}</p> : null}
        <button type="submit" disabled={saving || uploading}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
