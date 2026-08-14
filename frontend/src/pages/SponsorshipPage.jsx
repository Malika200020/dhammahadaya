import { useCallback, useEffect, useState } from 'react';
import { getSponsorshipCalendar, createSponsorshipBooking } from '../api/sponsorship';
import { BookingCalendar, getSponsorshipCalendarRange } from '../components/BookingCalendar';
import { sponsorshipHeader, sponsorshipNoteEn, sponsorshipNoteSi } from '../content/sponsorshipContent';
import './SponsorshipPage.css';

const EMPTY_FORM = { name: '', email: '', phone: '', objective: '', mailingAddress: '' };

export function SponsorshipPage() {
  const [language, setLanguage] = useState('en');
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadCalendar = useCallback(() => {
    const { from, to } = getSponsorshipCalendarRange();
    getSponsorshipCalendar(from, to)
      .then((d) => setBookings(d.bookings))
      .catch(() => setBookings([]));
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

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
      loadCalendar();
    } catch (err) {
      setError(err.message);
      if (err.status === 409) loadCalendar();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="sponsorship">
      <h1>{sponsorshipHeader}</h1>

      <div className="sponsorship__note">
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
      <BookingCalendar bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

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

        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
