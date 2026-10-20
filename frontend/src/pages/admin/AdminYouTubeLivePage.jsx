import { useEffect, useState } from 'react';
import { getAdminYoutubeLive, setYoutubeLive, clearYoutubeLive } from '../../api/admin';
import './AdminYouTubeLivePage.css';

// Content-tier (both admin roles). Single-value setting, same "no list to
// navigate back to" shape as AdminStaticDocumentFormPage — paste a link,
// save; Home page's YouTubeLiveSection shows it the moment this is set, and
// disappears entirely the moment it's cleared.
export function AdminYouTubeLivePage() {
  const [current, setCurrent] = useState(null); // { url, videoId } | null | undefined (loading)
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getAdminYoutubeLive()
      .then((d) => {
        setCurrent(d);
        setUrl(d.url || '');
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const d = await setYoutubeLive(url.trim());
      setCurrent(d);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await clearYoutubeLive();
      setCurrent({ url: null, videoId: null });
      setUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (current === null && !error) return null;

  return (
    <div className="admin-youtube-live">
      <h1>YouTube Live</h1>
      <p className="admin-youtube-live__hint">
        Paste the link to a live (or about-to-go-live) YouTube broadcast. It'll appear on the Home page immediately —
        clear it once the broadcast ends so the section disappears again.
      </p>

      <form onSubmit={handleSave}>
        <label>
          Live link
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
        </label>

        {current?.videoId ? (
          <p className="admin-youtube-live__status">
            Currently live on the Home page — video ID <code>{current.videoId}</code>.
          </p>
        ) : (
          <p className="admin-youtube-live__status admin-youtube-live__status--off">
            Not set — the Home page section is hidden.
          </p>
        )}

        {error ? <p className="admin-youtube-live__error">{error}</p> : null}
        {success ? <p className="admin-youtube-live__success">Saved.</p> : null}

        <div className="admin-youtube-live__actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          {current?.url ? (
            <button type="button" className="btn btn--danger" onClick={handleClear} disabled={saving}>
              Clear
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
