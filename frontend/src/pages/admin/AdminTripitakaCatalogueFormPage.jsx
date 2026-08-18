import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAdminCatalogueRow,
  createCatalogueRow,
  updateCatalogueRow,
  listAdminCatalogueRows,
} from '../../api/admin';
import './AdminTripitakaCatalogueFormPage.css';

// Create/edit for one Tripitaka Catalogue row (build-spec §6). All 11
// columns are rendered generically from the backend's own column metadata
// (label text lives once in backend/src/config/catalogue.js) — the 4
// columns whose label contains "PDF" are the ones the public page
// resolves against pdf_books at read time; editing their text here is all
// that's needed for that resolution to pick up the change on the next
// public page load, since nothing about the catalogue table itself is
// cached (only pdf_books is, via pdfBooksIndex — see
// backend/src/pdfBooksIndex.js — and this route never touches pdf_books).
export function AdminTripitakaCatalogueFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(null);
    const load = isEdit ? getAdminCatalogueRow(id) : listAdminCatalogueRows('', 1, 1);
    load
      .then((d) => {
        setColumns(d.columns);
        if (isEdit) {
          const row = d.row;
          const initial = {};
          for (const col of d.columns) initial[col.key] = row[col.key] ?? '';
          setValues(initial);
        } else {
          const initial = {};
          for (const col of d.columns) initial[col.key] = '';
          setValues(initial);
        }
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, [isEdit, id]);

  function updateField(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) await updateCatalogueRow(id, values);
      else await createCatalogueRow(values);
      navigate('/admin/tripitaka-catalogue');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="admin-catalogue-form">
      <h1>{isEdit ? 'Edit catalogue row' : 'New catalogue row'}</h1>
      <form onSubmit={handleSubmit}>
        {columns.map((col) => (
          <label key={col.key}>
            {col.label}
            {col.key === 'sutta_name' ? ' *' : ''}
            <input
              value={values[col.key] ?? ''}
              onChange={(e) => updateField(col.key, e.target.value)}
              required={col.key === 'sutta_name'}
            />
          </label>
        ))}

        {error ? <p className="admin-catalogue-form__error">{error}</p> : null}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
