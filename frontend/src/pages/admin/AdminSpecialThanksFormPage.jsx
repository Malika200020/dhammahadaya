import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminSpecialThanks, createSpecialThanks, updateSpecialThanks } from '../../api/admin';
import './AdminSpecialThanksFormPage.css';

export function AdminSpecialThanksFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [sectionEn, setSectionEn] = useState('');
  const [sectionSi, setSectionSi] = useState('');
  const [purpose, setPurpose] = useState('');
  const [donorsText, setDonorsText] = useState('');
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getAdminSpecialThanks(id)
      .then((d) => {
        const s = d.section;
        setSectionEn(s.section_en ?? '');
        setSectionSi(s.section_si);
        setPurpose(s.purpose ?? '');
        setDonorsText(s.donors.join('\n'));
        setOrder(s.order ?? 0);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, [isEdit, id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      section_en: sectionEn || null,
      section_si: sectionSi,
      purpose: purpose || null,
      donors: donorsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      order: Number(order) || 0,
    };
    try {
      if (isEdit) await updateSpecialThanks(id, payload);
      else await createSpecialThanks(payload);
      navigate('/admin/special-thanks');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="admin-special-thanks-form">
      <h1>{isEdit ? 'Edit section' : 'New section'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Section (English)
          <input value={sectionEn} onChange={(e) => setSectionEn(e.target.value)} placeholder="leave blank for Sinhala-only rows" />
        </label>
        <label>
          Section (Sinhala) *
          <input value={sectionSi} onChange={(e) => setSectionSi(e.target.value)} required />
        </label>
        <label>
          Purpose
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </label>
        <label>
          Donors (one per line)
          <textarea value={donorsText} onChange={(e) => setDonorsText(e.target.value)} rows={6} />
        </label>
        <label>
          Order
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
        </label>

        {error ? <p className="admin-special-thanks-form__error">{error}</p> : null}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
