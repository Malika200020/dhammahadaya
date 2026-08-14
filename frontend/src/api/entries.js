export async function listEntries(slug, { page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  const res = await fetch(`/api/entries/${slug}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load entries (${res.status})`);
  return res.json();
}

export async function getEntry(slug, id) {
  const res = await fetch(`/api/entries/${slug}/${id}`);
  if (!res.ok) throw new Error(`Failed to load entry (${res.status})`);
  return res.json();
}
