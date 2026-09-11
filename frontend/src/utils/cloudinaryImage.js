// Cloudinary delivery URLs come back from the API exactly as saveFile()
// returned them at upload time (see backend/src/storage/cloudinaryStorage.js)
// — no transformation applied. Injecting f_auto,q_auto here at render time
// (rather than baking it into the stored URL) means every image, including
// ones already uploaded, gets Cloudinary's automatic format/quality
// delivery for free. No-ops on anything that isn't a Cloudinary URL (local
// dev's /uploads/... paths, the site's static /images/... assets), so both
// storage drivers keep working unchanged.
const UPLOAD_MARKER = '/upload/';

export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
  const i = url.indexOf(UPLOAD_MARKER);
  if (i === -1) return url;
  const afterMarker = url.slice(i + UPLOAD_MARKER.length);
  if (/^(?:[a-z0-9_]+(?:,[a-z0-9_]+)*\/)?.*\bf_auto\b/i.test(afterMarker)) return url; // already has it
  return url.slice(0, i + UPLOAD_MARKER.length) + 'f_auto,q_auto/' + afterMarker;
}

// For admin-authored rich text (EntryDetailPage's entry.body) which can
// contain inline <img src="https://res.cloudinary.com/..."> tags baked into
// the stored HTML — same transform, applied to every Cloudinary URL found.
export function optimizeCloudinaryUrlsInHtml(html) {
  if (!html || typeof html !== 'string') return html;
  return html.replace(/https:\/\/res\.cloudinary\.com\/[^\s"'<>]+/g, (match) => optimizeCloudinaryUrl(match));
}
