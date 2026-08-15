import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAdminPohoyaCalendarYear,
  createPohoyaCalendarYear,
  updatePohoyaCalendarYear,
  uploadImage,
} from '../../api/admin';
import './AdminPohoyaCalendarFormPage.css';

function rowsToCsv(rows) {
  return rows.map((r) => `${r.month_si_en ?? ''},${r.date},${r.weekday},${r.poya}`).join('\n');
}

function csvToRows(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [month, date, weekday, poya] = line.split(',');
      return {
        month_si_en: month && month.trim() ? month.trim() : null,
        date: (date ?? '').trim(),
        weekday: (weekday ?? '').trim(),
        poya: (poya ?? '').trim(),
      };
    });
}

const PLACEHOLDER = 'Month (Sinhala – English),Date,Weekday,Poya\nදුරුතු – ජනවාරි,07,අඟහරුවාදා,පුර අටවක\n,13,සඳුදා,පුර පසළොස්වක';

// One create/edit form for every Sathara Pohoya Calendar year (build-spec
// §16). Rows are entered as the same "Month,Date,Weekday,Poya" CSV shape
// the source data already comes in — a blank month column means "same
// month as the row above", matching how the printed calendar reads.
export function AdminPohoyaCalendarFormPage() {
  const { year } = useParams();
  const isEdit = Boolean(year);
  const navigate = useNavigate();

  const [yearValue, setYearValue] = useState(year ?? '');
  const [rowsText, setRowsText] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getAdminPohoyaCalendarYear(year)
      .then((d) => {
        setRowsText(rowsToCsv(d.calendar.rows));
        setImageUrl(d.calendar.image_url);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, [isEdit, year]);

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadImage(file);
      setImageUrl(url);
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
    const rows = csvToRows(rowsText);
    try {
      if (isEdit) {
        await updatePohoyaCalendarYear(year, { rows, image_url: imageUrl });
      } else {
        await createPohoyaCalendarYear({ year: Number(yearValue), rows, image_url: imageUrl });
      }
      navigate('/admin/pohoya-calendar');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="admin-pohoya-form">
      <h1>{isEdit ? `Edit calendar — ${year}` : 'New Pohoya calendar'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Year *
          <input type="number" value={yearValue} onChange={(e) => setYearValue(e.target.value)} required disabled={isEdit} />
        </label>
        <label>
          Rows (CSV: Month,Date,Weekday,Poya — leave month blank to continue the previous month) *
          <textarea
            value={rowsText}
            onChange={(e) => setRowsText(e.target.value)}
            rows={16}
            placeholder={PLACEHOLDER}
            required
          />
        </label>
        <label>
          Calendar image
          <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
        </label>
        {uploading ? <p className="admin-pohoya-form__uploading">Uploading...</p> : null}
        {imageUrl ? <img src={imageUrl} alt="" className="admin-pohoya-form__preview" /> : null}

        {error ? <p className="admin-pohoya-form__error">{error}</p> : null}
        <button type="submit" disabled={saving || uploading}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
