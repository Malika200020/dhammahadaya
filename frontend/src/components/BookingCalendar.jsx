import { useMemo } from 'react';
import './BookingCalendar.css';

// Two-month (current + next) date-status calendar for the Sponsorships
// booking flow (build-spec §10). Presentational: the parent page fetches
// `bookings` (from GET /api/sponsorship/calendar) and owns selection state,
// matching the props-driven pattern used by VideoGallery/PhotoGallery.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n) {
  return String(n).padStart(2, '0');
}

// `month` is 0-indexed (Jan = 0), matching JS Date.
function toIso(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function getSponsorshipCalendarMonths() {
  const now = new Date();
  const first = { year: now.getFullYear(), month: now.getMonth() };
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const second = { year: next.getFullYear(), month: next.getMonth() };
  return [first, second];
}

// The exact range the parent page should request from the calendar API —
// kept next to the months helper so the two never drift apart.
export function getSponsorshipCalendarRange() {
  const [firstMonth, lastMonth] = getSponsorshipCalendarMonths();
  const from = toIso(firstMonth.year, firstMonth.month, 1);
  const lastDay = new Date(lastMonth.year, lastMonth.month + 1, 0).getDate();
  const to = toIso(lastMonth.year, lastMonth.month, lastDay);
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
      <h3>
        {MONTH_NAMES[month]} {year}
      </h3>
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

export function BookingCalendar({ bookings, selectedDate, onSelectDate }) {
  const statusByDate = useMemo(() => {
    const map = {};
    for (const b of bookings || []) {
      const iso = typeof b.date === 'string' ? b.date.slice(0, 10) : new Date(b.date).toISOString().slice(0, 10);
      map[iso] = b.status;
    }
    return map;
  }, [bookings]);

  const months = getSponsorshipCalendarMonths();
  const now = new Date();
  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <div className="booking-calendar">
      <div className="booking-calendar__legend">
        <span className="booking-calendar__legend-item booking-calendar__legend-item--available">Available</span>
        <span className="booking-calendar__legend-item booking-calendar__legend-item--pending">Pending</span>
        <span className="booking-calendar__legend-item booking-calendar__legend-item--booked">Booked</span>
      </div>
      <div className="booking-calendar__months">
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            statusByDate={statusByDate}
            todayIso={todayIso}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>
    </div>
  );
}
