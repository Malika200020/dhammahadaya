import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSponsorshipCalendar, createSponsorshipBooking } from '../api/sponsorship';
import { BookingCalendar, getMonthRange } from '../components/BookingCalendar';
import { DevelopmentBankDetails } from './DevelopmentPage';
import { sponsorshipHeader, sponsorshipNoteEn, sponsorshipNoteSi } from '../content/sponsorshipContent';
import './SponsorshipPage.css';

const EMPTY_FORM = { name: '', email: '', phone: '', objective: '', mailingAddress: '' };

// Two categories (client request, 2026-09): Danaya is the existing
// date-booking flow below, unchanged; Development Projects is the bank
// details that used to live at the standalone /development/ page, which no
// longer has a menu-bar entry of its own (see navItems.js).
const CATEGORIES = [
  { key: 'danaya', label: 'Danaya' },
  { key: 'development', label: 'Development Projects' },
];

export function SponsorshipPage() {
  const [category, setCategory] = useState('danaya');
  const [language, setLanguage] = useState('en');
  const [bookings, setBookings] = useState([]);
  // Bookings start empty and every date defaults to "available" (see
  // BookingCalendar) — without this flag, the calendar would render as
  // fully open the instant the page mounts, before we actually know which
  // dates are taken. calendarError covers the same gap for a failed fetch
  // (data never arrived either way), so both block rendering the calendar
  // itself until real booking data is confirmed in hand.
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const lastMonthRef = useRef(null);

  const loadCalendar = useCallback((year, month) => {
    lastMonthRef.current = { year, month };
    setCalendarLoading(true);
    setCalendarError(false);
    const { from, to } = getMonthRange(year, month);
    getSponsorshipCalendar(from, to)
      .then((d) => setBookings(d.bookings))
      .catch(() => setCalendarError(true))
      .finally(() => setCalendarLoading(false));
  }, []);

  function reloadCurrentMonth() {
    if (lastMonthRef.current) loadCalendar(lastMonthRef.current.year, lastMonthRef.current.month);
  }

  const note = language === 'en' ? sponsorshipNoteEn : sponsorshipNoteSi;

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedDate) {
      setError('Please select an available date from the calendar.');
      return;
    }
    setSubmitting(true);
    try {
      await createSponsorshipBooking({
        date: selectedDate,
        name: form.name,
        email: form.email,
        phone: form.phone,
        objective: form.objective,
        mailing_address: form.mailingAddress || null,
      });
      setSuccess(`Thank you — your booking for ${selectedDate} has been submitted and is now Pending review.`);
      setForm(EMPTY_FORM);
      setSelectedDate(null);
      reloadCurrentMonth();
    } catch (err) {
      setError(err.message);
      if (err.status === 409) reloadCurrentMonth();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="sponsorship">
      <h1>{sponsorshipHeader}</h1>

      <div className="sponsorship__toggle sponsorship__category-toggle">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={category === c.key ? 'sponsorship__toggle-btn sponsorship__toggle-btn--active' : 'sponsorship__toggle-btn'}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {category === 'development' ? (
        <div className="sponsorship__development">
          <DevelopmentBankDetails />
          <div className="sponsorship__development-links">
            <Link to="/special-thanks/" className="btn btn--secondary btn--sm">
              Special Thanks
            </Link>
            <Link to="/honorable-tribute/" className="btn btn--secondary btn--sm">
              Honorable Tribute
            </Link>
            <Link to="/siri-sugatha-sasana-bandumathi/" className="btn btn--secondary btn--sm">
              Siri Sugatha Sasana Bandumathi
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="sponsorship__note card">
            <div className="sponsorship__toggle">
              <button
                type="button"
                className={language === 'en' ? 'sponsorship__toggle-btn sponsorship__toggle-btn--active' : 'sponsorship__toggle-btn'}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                type="button"
                className={language === 'si' ? 'sponsorship__toggle-btn sponsorship__toggle-btn--active' : 'sponsorship__toggle-btn'}
                onClick={() => setLanguage('si')}
              >
                සිංහල
              </button>
            </div>

            {/* [CONTENT — Sinhala/English, migrate verbatim] build-spec §10 */}
            {note.paragraphs.map((paragraph, i) => (
              <p key={i}>
                {paragraph.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            ))}
            <h4>{note.instructionsHeading}</h4>
            <ol>
              {note.instructions.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </div>

          <h2 className="sponsorship__section-heading">Select a date</h2>
          {calendarError ? (
            <p className="sponsorship__error">
              Couldn't load date availability. Please refresh the page before selecting a date, so you don't pick one that's already taken.
            </p>
          ) : (
            <BookingCalendar
              bookings={bookings}
              loading={calendarLoading}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMonthChange={loadCalendar}
            />
          )}

          <h2 className="sponsorship__section-heading">Booking form</h2>
          <form className="sponsorship__form" onSubmit={handleSubmit}>
            <label>
              Name | නම
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
            </label>
            <label>
              Email | ඊ ලිපිනය
              <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </label>
            <label>
              Phone Number | දුරකථන අංකය
              <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
            </label>
            <label>
              Date | දිනය
              <input value={selectedDate ?? ''} placeholder="Select a date from the calendar above" readOnly required />
            </label>
            <label>
              Details / Objective | අරමුණ
              <textarea value={form.objective} onChange={(e) => updateField('objective', e.target.value)} rows={3} required />
            </label>
            <label>
              Mailing Address | තැපැල් ලිපිනය
              <input value={form.mailingAddress} onChange={(e) => updateField('mailingAddress', e.target.value)} placeholder="optional" />
            </label>

            {error ? <p className="sponsorship__error">{error}</p> : null}
            {success ? <p className="sponsorship__success">{success}</p> : null}

            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
