import { API_BASE } from './base';

export async function searchTripitakaCatalogue({ query = '', page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (query) params.set('q', query);

  const res = await fetch(`${API_BASE}/api/tripitaka-catalogue/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Catalogue search failed (${res.status})`);
  }
  return res.json();
}
