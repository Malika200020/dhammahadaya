import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminVideo, createVideo, updateVideo } from '../../api/admin';
import './AdminVideoFormPage.css';

// One form for both video sections, for create (no :id) and edit — the
// fields that differ (speaker vs. video_type) are just conditionally
// rendered based on `section`.
export function AdminVideoFormPage({ section }) {
  const { seriesSlug, id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [titleSi, setTitleSi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [order, setOrder] = useState(0);
  const [year, setYear] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [videoType, setVideoType] = useState('full_moon');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getAdminVideo(id).then((d) => {
      const v = d.video;
      setTitleSi(v.title_si);
      setTitleEn(v.title_en ?? '');
      setYoutubeId(v.youtube_id);
      setOrder(v.order ?? 0);
      setYear(v.year ?? '');
      setSpeaker(v.speaker ?? '');
      setVideoType(v.video_type ?? 'full_moon');
      setLoaded(true);
    });
  }, [isEdit, id]);

  const basePath = section === 'dhamma_sermon' ? `/admin/videos/dhamma-sermon/${seriesSlug}` : '/admin/videos/buddha-puja';

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      section,
      series_slug: section === 'dhamma_sermon' ? seriesSlug : null,
      title_si: titleSi,
      title_en: titleEn || null,
      youtube_id: youtubeId,
      order: Number(order) || 0,
      year: year ? Number(year) : null,
      speaker: section === 'dhamma_sermon' ? speaker || null : null,
      video_type: section === 'buddha_puja' ? videoType : null,
    };
    try {
      if (isEdit) await updateVideo(id, payload);
      else await createVideo(payload);
      navigate(basePath);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="admin-video-form">
      <h1>{isEdit ? 'Edit video' : 'New video'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title *
          <input value={titleSi} onChange={(e) => setTitleSi(e.target.value)} required />
        </label>
        <label>
          Title (English, optional)
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </label>
        <label>
          YouTube ID or URL *
          <input
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            required
            placeholder="e.g. wlb0gFwhAlQ or a full youtube.com/youtu.be URL"
          />
        </label>
        <label>
          Year
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        {section === 'dhamma_sermon' ? (
          <label>
            Speaker
            <input value={speaker} onChange={(e) => setSpeaker(e.target.value)} />
          </label>
        ) : (
          <label>
            Type *
            <select value={videoType} onChange={(e) => setVideoType(e.target.value)}>
              <option value="full_moon">Full-moon Pūjā</option>
              <option value="gilanpasa">Gilānpasa Pūjā</option>
            </select>
          </label>
        )}
        <label>
          Order
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
        </label>

        {error ? <p className="admin-video-form__error">{error}</p> : null}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
