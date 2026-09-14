import { useEffect, useMemo, useState } from 'react';
import { LoadingState } from './LoadingState';
import './BookingCalendar.css';

// Single-month date-status calendar for the Sponsorships booking flow
// (build-spec §10), navigable via Month/Year selects (client request,
// 2026-09: "select month and year then the calendar to appear" — previously
// this only ever showed the current + next month with no way to look
// further ahead). BookingCalendar owns the month/year selection itself and
// reports it upward via `onMonthChange`, so every page using it (Home
// preview, full Sponsorship page) fetches bookings for whichever month is
// selected instead of duplicating that state per page.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const YEAR_OPTIONS_AHEAD = 2; // current year + this many future years, selectable

function pad(n) {
  return String(n).padStart(2, '0');
}

// `month` is 0-indexed (Jan = 0), matching JS Date.
function toIso(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

// The exact range to request from GET /api/sponsorship/calendar for a given
// (0-indexed) month/year — kept next to the component so callers never
// drift out of sync with what's actually rendered.
export function getMonthRange(year, month) {
  const from = toIso(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = toIso(year, month, lastDay);
  return { from, to };
}

function MonthGrid({ year, month, statusByDate, todayIso, selectedDate, onSelectDate }) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="booking-calendar__month">
      <div className="booking-calendar__grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="booking-calendar__weekday">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`blank-${i}`} className="booking-calendar__cell booking-calendar__cell--blank" />;
          const iso = toIso(year, month, d);
          const status = statusByDate[iso] || (iso < todayIso ? 'past' : 'available');
          const selectable = status === 'available';
          return (
            <button
              key={iso}
              type="button"
              disabled={!selectable}
              title={status}
              className={
                `booking-calendar__cell booking-calendar__cell--${status}` +
                (selectedDate === iso ? ' booking-calendar__cell--selected' : '')
              }
              onClick={() => onSelectDate(iso)}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingCalendar({ bookings, selectedDate, onSelectDate, onMonthChange, loading }) {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    onMonthChange?.(year, month);
    // Only the month/year should re-trigger a fetch — an onMonthChange
    // identity that changes every render (an inline arrow at the call
    // site) must not cause a refetch loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const statusByDate = useMemo(() => {
    const map = {};
    for (const b of bookings || []) {
      const iso = typeof b.date === 'string' ? b.date.slice(0, 10) : new Date(b.date).toISOString().slice(0, 10);
      map[iso] = b.status;
    }
    return map;
  }, [bookings]);

  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());
  const yearOptions = Array.from({ length: YEAR_OPTIONS_AHEAD + 1 }, (_, i) => now.getFullYear() + i);

  return (
    <div className="booking-calendar">
      <div className="booking-calendar__controls">
        <label className="booking-calendar__control">
          Month
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="booking-calendar__control">
          Year
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="booking-calendar__legend">
        <span className="booking-calendar__legend-item booking-calendar__legend-item--available">Available</span>
        <span className="booking-calendar__legend-item booking-calendar__legend-item--pending">Pending</span>
        <span className="booking-calendar__legend-item booking-calendar__legend-item--booked">Booked</span>
      </div>

      {loading ? (
        // Never fall through to MonthGrid while the newly-selected month's
        // bookings are still in flight — every date would default to
        // "available" until statusByDate actually reflects this month.
        <LoadingState message="Loading availability…" />
      ) : (
        <MonthGrid
          year={year}
          month={month}
          statusByDate={statusByDate}
          todayIso={todayIso}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      )}
    </div>
  );
}
