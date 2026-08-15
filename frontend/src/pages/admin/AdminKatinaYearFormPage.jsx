import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminKatinaYear, createKatinaYear, updateKatinaYear } from '../../api/admin';
import './AdminKatinaYearFormPage.css';

export function AdminKatinaYearFormPage() {
  const { year } = useParams();
  const isEdit = Boolean(year);
  const navigate = useNavigate();

  const [yearValue, setYearValue] = useState(year ?? '');
  const [organizersText, setOrganizersText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getAdminKatinaYear(year)
      .then((d) => {
        setOrganizersText(d.year.organizers.join('\n'));
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, [isEdit, year]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const organizers = organizersText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      if (isEdit) {
        await updateKatinaYear(year, { organizers });
      } else {
        await createKatinaYear({ year: Number(yearValue), organizers });
      }
      navigate('/admin/katina');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="admin-katina-form">
      <h1>{isEdit ? `Edit organizers — ${year}` : 'New Katina year'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Year *
          <input
            type="number"
            value={yearValue}
            onChange={(e) => setYearValue(e.target.value)}
            required
            disabled={isEdit}
          />
        </label>
        <label>
          Organizers (one per line)
          <textarea value={organizersText} onChange={(e) => setOrganizersText(e.target.value)} rows={8} />
        </label>

        {error ? <p className="admin-katina-form__error">{error}</p> : null}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
