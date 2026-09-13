import { Fragment, useCallback, useEffect, useState } from 'react';
import { Check, X, Pencil, Ban } from 'lucide-react';
import { listAdminBookings, confirmBooking, declineBooking, cancelBooking, updateBooking } from '../../api/admin';
import { LoadingState } from '../../components/LoadingState';
import './AdminSponsorshipListPage.css';

const TABS = [
  { status: 'pending', label: 'Pending' },
  { status: 'booked', label: 'Booked' },
  { status: 'declined', label: 'Declined' },
  { status: 'cancelled', label: 'Cancelled' },
  { status: '', label: 'All' },
];

function formatDate(d) {
  return typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
}

// Inline edit form for a 'booked' row — a second <tr> that appears right
// below the row being edited, rather than a separate form page, since this
// is the only booking state that's ever editable and keeping it inline
// means the admin can see the row they're changing while they change it.
function EditBookingRow({ booking, colSpan, onCancel, onSaved }) {
  const [form, setForm] = useState({
    date: booking.date,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    objective: booking.objective || '',
    mailing_address: booking.mailing_address || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await updateBooking(booking.id, form);
      if (result.emailSent === false) {
        setError('Booking updated, but the notification email to the sponsor failed to send.');
        return;
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="admin-sponsorship__edit-row">
      <td colSpan={colSpan}>
        <form className="admin-sponsorship__edit-form" onSubmit={handleSubmit}>
          <label>
            Date
            <input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} required />
          </label>
          <label>
            Name
            <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
          </label>
          <label className="admin-sponsorship__edit-form-wide">
            Objective
            <textarea value={form.objective} onChange={(e) => updateField('objective', e.target.value)} rows={2} />
          </label>
          <label className="admin-sponsorship__edit-form-wide">
            Mailing address
            <input value={form.mailing_address} onChange={(e) => updateField('mailing_address', e.target.value)} />
          </label>

          {error ? (
            <p className="admin-sponsorship__error admin-sponsorship__edit-form-wide" role="alert">
              {error}
            </p>
          ) : null}

          <div className="admin-sponsorship__edit-actions admin-sponsorship__edit-form-wide">
            <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel} disabled={saving}>
              Cancel editing
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

export function AdminSponsorshipListPage() {
  const [status, setStatus] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    listAdminBookings(status)
      .then((d) => setBookings(d.bookings))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleConfirm(id) {
    setBusyId(id);
    setError(null);
    try {
      const result = await confirmBooking(id);
      if (result.emailSent === false) {
        setError(`Booking confirmed, but the confirmation email failed to send (booking #${id}).`);
      }
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(id) {
    if (!window.confirm('Decline this booking? This frees the date back to available.')) return;
    setBusyId(id);
    setError(null);
    try {
      const result = await declineBooking(id);
      if (result.emailSent === false) {
        setError(`Booking declined, but the notification email failed to send (booking #${id}).`);
      }
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this confirmed booking? This frees the date back to available and emails the sponsor.')) return;
    setBusyId(id);
    setError(null);
    try {
      const result = await cancelBooking(id);
      if (result.emailSent === false) {
        setError(`Booking cancelled, but the cancellation email failed to send (booking #${id}).`);
      }
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const columnCount = 7;

  return (
    <div className="admin-sponsorship">
      <header className="admin-sponsorship__header">
        <h1>Sponsorship Bookings</h1>
      </header>

      <div className="admin-sponsorship__tabs">
        {TABS.map((t) => (
          <button
            key={t.status}
            type="button"
            className={status === t.status ? 'admin-sponsorship__tab admin-sponsorship__tab--active' : 'admin-sponsorship__tab'}
            onClick={() => setStatus(t.status)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? <p className="admin-sponsorship__error">{error.message || error}</p> : null}

      {loading && bookings.length === 0 ? (
        <LoadingState message="Loading… the first load of the day can take up to a minute while the server wakes up." />
      ) : (
        <table className="admin-sponsorship__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Objective</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <Fragment key={b.id}>
                <tr>
                  <td data-label="Date" className="admin-sponsorship__cell-date">
                    {formatDate(b.date)}
                  </td>
                  <td data-label="Name">{b.name}</td>
                  <td data-label="Email" className="admin-sponsorship__cell-email">
                    {b.email}
                  </td>
                  <td data-label="Phone">{b.phone}</td>
                  <td data-label="Objective" className="admin-sponsorship__cell-objective" title={b.objective || ''}>
                    {b.objective}
                  </td>
                  <td data-label="Status">
                    <span className={`admin-sponsorship__status admin-sponsorship__status--${b.status}`}>{b.status}</span>
                  </td>
                  <td className="admin-sponsorship__actions">
                    {b.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm admin-sponsorship__action-btn"
                          disabled={busyId === b.id}
                          onClick={() => handleConfirm(b.id)}
                        >
                          <Check size={14} aria-hidden="true" />
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm admin-sponsorship__action-btn"
                          disabled={busyId === b.id}
                          onClick={() => handleDecline(b.id)}
                        >
                          <X size={14} aria-hidden="true" />
                          Decline
                        </button>
                      </>
                    ) : null}
                    {b.status === 'booked' ? (
                      <>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm admin-sponsorship__action-btn"
                          disabled={busyId === b.id}
                          onClick={() => setEditingId(editingId === b.id ? null : b.id)}
                        >
                          <Pencil size={14} aria-hidden="true" />
                          {editingId === b.id ? 'Close' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm admin-sponsorship__action-btn"
                          disabled={busyId === b.id}
                          onClick={() => handleCancel(b.id)}
                        >
                          <Ban size={14} aria-hidden="true" />
                          Cancel
                        </button>
                      </>
                    ) : null}
                    {b.status !== 'pending' && b.status !== 'booked' ? (
                      <span className="admin-sponsorship__no-actions">—</span>
                    ) : null}
                  </td>
                </tr>
                {editingId === b.id ? (
                  <EditBookingRow
                    booking={b}
                    colSpan={columnCount}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null);
                      load();
                    }}
                  />
                ) : null}
              </Fragment>
            ))}
            {!loading && bookings.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="admin-sponsorship__empty">
                  No bookings.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </div>
  );
}
