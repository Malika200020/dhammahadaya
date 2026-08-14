import { useCallback, useEffect, useState } from 'react';
import { listAdminBookings, confirmBooking, declineBooking } from '../../api/admin';
import './AdminSponsorshipListPage.css';

const TABS = [
  { status: 'pending', label: 'Pending' },
  { status: 'booked', label: 'Booked' },
  { status: 'declined', label: 'Declined' },
  { status: '', label: 'All' },
];

function formatDate(d) {
  return typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
}

export function AdminSponsorshipListPage() {
  const [status, setStatus] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listAdminBookings(status)
      .then((d) => setBookings(d.bookings))
      .catch(setError);
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
      await declineBooking(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

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
            <tr key={b.id}>
              <td>{formatDate(b.date)}</td>
              <td>{b.name}</td>
              <td>{b.email}</td>
              <td>{b.phone}</td>
              <td>{b.objective}</td>
              <td>
                <span className={`admin-sponsorship__status admin-sponsorship__status--${b.status}`}>{b.status}</span>
              </td>
              <td className="admin-sponsorship__actions">
                {b.status === 'pending' ? (
                  <>
                    <button type="button" disabled={busyId === b.id} onClick={() => handleConfirm(b.id)}>
                      Confirm
                    </button>
                    <button type="button" disabled={busyId === b.id} onClick={() => handleDecline(b.id)}>
                      Decline
                    </button>
                  </>
                ) : null}
              </td>
            </tr>
          ))}
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={7} className="admin-sponsorship__empty">
                No bookings.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
