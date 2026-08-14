// If an admin pastes a full YouTube URL (watch?v=, youtu.be/, embed/)
// instead of a bare ID, pull just the ID out of it. Anything that doesn't
// look like a URL is assumed to already be an ID and passed through as-is
// — we deliberately don't validate ID format, since a private/deleted
// video still has a normal-looking 11-char ID and should still be stored
// (see routes/videos rendering: an unplayable ID is a YouTube-side embed
// state, not something the app should reject).
function extractYoutubeId(input) {
  const value = (input || '').trim();
  if (!value) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace(/^\//, '');
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.searchParams.has('v')) return url.searchParams.get('v');
      const embedMatch = url.pathname.match(/\/embed\/([^/]+)/);
      if (embedMatch) return embedMatch[1];
    }
  } catch {
    // Not a URL — fall through and treat it as a bare ID.
  }
  return value;
}

module.exports = { extractYoutubeId };
