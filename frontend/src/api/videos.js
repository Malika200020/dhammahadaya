export async function listDhammaSermonSeries() {
  const res = await fetch('/api/videos/dhamma-sermon/series');
  if (!res.ok) throw new Error(`Failed to load series (${res.status})`);
  return res.json();
}

export async function listSeriesVideos(seriesSlug, { page = 1, pageSize = 12 } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  const res = await fetch(`/api/videos/dhamma-sermon/${seriesSlug}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load videos (${res.status})`);
  return res.json();
}

export async function listBuddhaPujaVideos({ page = 1, pageSize = 12 } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  const res = await fetch(`/api/videos/buddha-puja?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load videos (${res.status})`);
  return res.json();
}
