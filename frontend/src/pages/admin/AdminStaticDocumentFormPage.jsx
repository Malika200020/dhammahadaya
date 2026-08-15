import { useEffect, useState } from 'react';
import { getAdminStaticDocument, updateStaticDocument } from '../../api/admin';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import './AdminStaticDocumentFormPage.css';

// One editor for both single-record documents (build-spec §17.3/§17.4),
// configured by `slug` — no create/delete, the slug is fixed and seeded.
// There's no list to navigate back to (each is its own standalone page in
// the nav), so saving just confirms in place rather than redirecting.
export function AdminStaticDocumentFormPage({ slug }) {
  const [titleEn, setTitleEn] = useState('');
  const [titleSi, setTitleSi] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAdminStaticDocument(slug)
      .then((d) => {
        setTitleEn(d.document.title_en ?? '');
        setTitleSi(d.document.title_si);
        setBody(d.document.body);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateStaticDocument(slug, { title_en: titleEn || null, title_si: titleSi, body });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="admin-static-document-form">
      <h1>Edit — {titleEn || titleSi}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title (English)
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </label>
        <label>
          Title (Sinhala) *
          <input value={titleSi} onChange={(e) => setTitleSi(e.target.value)} required />
        </label>
        <label>
          Body *
          <RichTextEditor value={body} onChange={setBody} />
        </label>

        {error ? <p className="admin-static-document-form__error">{error}</p> : null}
        {success ? <p className="admin-static-document-form__success">Saved.</p> : null}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
