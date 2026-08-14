export async function getGallery(gallery, key) {
  const params = key ? `?key=${encodeURIComponent(key)}` : '';
  const res = await fetch(`/api/galleries/${gallery}${params}`);
  if (!res.ok) throw new Error(`Failed to load gallery (${res.status})`);
  return res.json();
}
