import { API_BASE } from './base';

export async function getPdfBookCategory(slug) {
  const res = await fetch(`${API_BASE}/api/pdf-books/${slug}`);
  if (!res.ok) throw new Error(`Failed to load PDF books (${res.status})`);
  return res.json();
}
