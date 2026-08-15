async function request(path) {
  const res = await fetch(path, { credentials: 'include' });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return body;
}

export const listKatinaYears = () => request('/api/katina');
export const getKatinaYear = (year) => request(`/api/katina/${year}`);
