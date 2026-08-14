async function request(path, options = {}) {
  const res = await fetch(path, { credentials: 'include', ...options });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return body;
}

function jsonBody(data) {
  return { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}

// --- auth ---
export const login = (email, password) =>
  request('/api/admin/auth/login', { method: 'POST', ...jsonBody({ email, password }) });

export const logout = () => request('/api/admin/auth/logout', { method: 'POST' });

export const getSession = () => request('/api/admin/auth/me');

// --- entries CRUD ---
export const listAdminEntries = (type) =>
  request(`/api/admin/entries?type=${encodeURIComponent(type)}`);

export const getAdminEntry = (id) => request(`/api/admin/entries/${id}`);

export const createEntry = (entry) =>
  request('/api/admin/entries', { method: 'POST', ...jsonBody(entry) });

export const updateEntry = (id, entry) =>
  request(`/api/admin/entries/${id}`, { method: 'PUT', ...jsonBody(entry) });

export const deleteEntry = (id) =>
  request(`/api/admin/entries/${id}`, { method: 'DELETE' });

// --- pdf-books CRUD ---
export const listAdminPdfBooks = (category) =>
  request(`/api/admin/pdf-books?category=${encodeURIComponent(category)}`);

export const getAdminPdfBook = (id) => request(`/api/admin/pdf-books/${id}`);

export const createPdfBook = (entry) =>
  request('/api/admin/pdf-books', { method: 'POST', ...jsonBody(entry) });

export const updatePdfBook = (id, entry) =>
  request(`/api/admin/pdf-books/${id}`, { method: 'PUT', ...jsonBody(entry) });

export const deletePdfBook = (id) =>
  request(`/api/admin/pdf-books/${id}`, { method: 'DELETE' });

// --- video series CRUD ---
export const listAdminVideoSeries = () => request('/api/admin/video-series');

export const createVideoSeries = (series) =>
  request('/api/admin/video-series', { method: 'POST', ...jsonBody(series) });

export const updateVideoSeries = (slug, series) =>
  request(`/api/admin/video-series/${slug}`, { method: 'PUT', ...jsonBody(series) });

export const deleteVideoSeries = (slug) =>
  request(`/api/admin/video-series/${slug}`, { method: 'DELETE' });

// --- videos CRUD ---
export const listAdminVideos = (section, seriesSlug) =>
  request(`/api/admin/videos?section=${encodeURIComponent(section)}${seriesSlug ? `&seriesSlug=${encodeURIComponent(seriesSlug)}` : ''}`);

export const getAdminVideo = (id) => request(`/api/admin/videos/${id}`);

export const createVideo = (video) =>
  request('/api/admin/videos', { method: 'POST', ...jsonBody(video) });

export const updateVideo = (id, video) =>
  request(`/api/admin/videos/${id}`, { method: 'PUT', ...jsonBody(video) });

export const deleteVideo = (id) =>
  request(`/api/admin/videos/${id}`, { method: 'DELETE' });

// --- gallery images CRUD ---
export const listAdminGalleryImages = (gallery, key) =>
  request(`/api/admin/galleries?gallery=${encodeURIComponent(gallery)}${key ? `&key=${encodeURIComponent(key)}` : ''}`);

export const createGalleryImage = (image) =>
  request('/api/admin/galleries', { method: 'POST', ...jsonBody(image) });

export const updateGalleryImage = (id, image) =>
  request(`/api/admin/galleries/${id}`, { method: 'PUT', ...jsonBody(image) });

export const deleteGalleryImage = (id) =>
  request(`/api/admin/galleries/${id}`, { method: 'DELETE' });

// --- sponsorship bookings ---
export const listAdminBookings = (status) =>
  request(`/api/admin/sponsorship${status ? `?status=${encodeURIComponent(status)}` : ''}`);

export const confirmBooking = (id) =>
  request(`/api/admin/sponsorship/${id}/confirm`, { method: 'POST' });

export const declineBooking = (id) =>
  request(`/api/admin/sponsorship/${id}/decline`, { method: 'POST' });

// --- uploads ---
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/admin/uploads', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Upload failed (${res.status})`);
  return body; // { url, key }
}
