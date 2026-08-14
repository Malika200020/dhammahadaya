import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listAdminPdfBooks, getAdminPdfBook, createPdfBook, updatePdfBook } from '../../api/admin';
import { PDF_BOOK_CATEGORY_LABELS } from '../../config/pdfBookCategories';
import './AdminPdfBookFormPage.css';

// One form, configured by the `:category` route param, for both create
// (no :id) and edit (:id present) — same component for all four categories.
export function AdminPdfBookFormPage() {
  const { category, id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [section, setSection] = useState('');
  const [subsection, setSubsection] = useState('');
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkStatus, setLinkStatus] = useState('available');
  const [existingSections, setExistingSections] = useState([]);
  const [existingSubsections, setExistingSubsections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(!isEdit);

  // Existing section/subsection values in this category, offered as
  // <datalist> suggestions so a typo doesn't silently fragment a group
  // into a new one-item section.
  useEffect(() => {
    listAdminPdfBooks(category).then((d) => {
      setExistingSections([...new Set(d.entries.map((e) => e.section))]);
      setExistingSubsections([...new Set(d.entries.map((e) => e.subsection))]);
    });
  }, [category]);

  useEffect(() => {
    if (!isEdit) return;
    getAdminPdfBook(id)
      .then((d) => {
        const e = d.entry;
        setSection(e.section);
        setSubsection(e.subsection);
        setTitle(e.title);
        setLinkUrl(e.link_url ?? '');
        setLinkStatus(e.link_status);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, [isEdit, id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { category, section, subsection, title, link_url: linkUrl, link_status: linkStatus };
    try {
      if (isEdit) await updatePdfBook(id, payload);
      else await createPdfBook(payload);
      navigate(`/admin/pdf-books/${category}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="admin-pdf-book-form">
      <h1>
        {isEdit ? 'Edit PDF entry' : 'New PDF entry'} — {PDF_BOOK_CATEGORY_LABELS[category] ?? category}
      </h1>
      <form onSubmit={handleSubmit}>
        <label>
          Section *
          <input value={section} onChange={(e) => setSection(e.target.value)} required list="section-options" />
          <datalist id="section-options">
            {existingSections.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label>
          Subsection *
          <input value={subsection} onChange={(e) => setSubsection(e.target.value)} required list="subsection-options" />
          <datalist id="subsection-options">
            {existingSubsections.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label>
          Title *
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Link URL (MEGA / Google Drive)
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://mega.nz/file/... or https://drive.google.com/..."
          />
        </label>
        <label>
          Status *
          <select value={linkStatus} onChange={(e) => setLinkStatus(e.target.value)}>
            <option value="available">Available</option>
            <option value="available_new">Available (new)</option>
            <option value="no_link_yet">No link yet</option>
          </select>
        </label>

        {error ? <p className="admin-pdf-book-form__error">{error}</p> : null}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
