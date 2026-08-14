async function request(path, options = {}) {
  const res = await fetch(path, { credentials: 'include', ...options });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return body;
}

// from/to: 'YYYY-MM-DD'. Returns { bookings: [{date, status}] } — only
// active (pending/booked) dates; any date not listed is available.
export const getSponsorshipCalendar = (from, to) =>
  request(`/api/sponsorship/calendar?from=${from}&to=${to}`);

export const createSponsorshipBooking = (booking) =>
  request('/api/sponsorship/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
