import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listAdminVideoSeries, createVideoSeries, updateVideoSeries } from '../../api/admin';
import './AdminVideoSeriesFormPage.css';

export function AdminVideoSeriesFormPage() {
  const { slug: existingSlug } = useParams();
  const isEdit = Boolean(existingSlug);
  const navigate = useNavigate();

  const [slug, setSlug] = useState('');
  const [nameSi, setNameSi] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit) return;
    listAdminVideoSeries().then((d) => {
      const s = d.series.find((x) => x.slug === existingSlug);
      if (!s) {
        setError('Series not found');
        return;
      }
      setSlug(s.slug);
      setNameSi(s.name_si);
      setNameEn(s.name_en ?? '');
      setOrder(s.order ?? 0);
      setLoaded(true);
    });
  }, [isEdit, existingSlug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateVideoSeries(existingSlug, { name_si: nameSi, name_en: nameEn || null, order: Number(order) || 0 });
      } else {
        await createVideoSeries({ slug, name_si: nameSi, name_en: nameEn || null, order: Number(order) || 0 });
      }
      navigate('/admin/video-series');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="admin-video-series-form">
      <h1>{isEdit ? 'Edit series' : 'New series'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Slug (URL path) *
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            disabled={isEdit}
            placeholder="e.g. australia-dhamma-sermons"
          />
        </label>
        <label>
          Name *
          <input value={nameSi} onChange={(e) => setNameSi(e.target.value)} required />
        </label>
        <label>
          Name (English, optional)
          <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </label>
        <label>
          Order
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
        </label>

        {error ? <p className="admin-video-series-form__error">{error}</p> : null}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
