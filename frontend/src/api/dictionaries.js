export async function searchDictionary(slug, { query = '', page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (query) params.set('q', query);

  const res = await fetch(`/api/dictionaries/${slug}/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Dictionary search failed (${res.status})`);
  }
  return res.json();
}
