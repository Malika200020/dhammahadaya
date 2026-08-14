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
