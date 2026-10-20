// Shared by routes/youtube-live.js (public GET) and routes/admin-youtube-live.js
// (admin PUT, which validates a pasted URL before saving it) — one parser
// so the two can never disagree on what counts as a valid link.
//
// Handles the URL shapes an admin is actually likely to paste from a
// browser address bar or the YouTube "Share" button: youtube.com/watch?v=,
// youtu.be/, youtube.com/live/, and youtube.com/embed/.
function parseYoutubeVideoId(input) {
  if (!input) return null;
  let url;
  try {
    url = new URL(String(input).trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return id || null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (url.pathname === '/watch') return url.searchParams.get('v');
    const match = url.pathname.match(/^\/(live|embed|shorts)\/([^/]+)/);
    if (match) return match[2];
  }
  return null;
}

module.exports = { parseYoutubeVideoId };
