import { useCallback, useRef, useState } from 'react';
import { getSponsorshipCalendar, createSponsorshipBooking } from '../api/sponsorship';
import { BookingCalendar, getMonthRange } from '../components/BookingCalendar';
import { DevelopmentBankDetails } from './DevelopmentPage';
import { useTranslation } from '../i18n/LanguageContext';
import { sponsorshipNoteEn, sponsorshipNoteSi } from '../content/sponsorshipContent';
import './SponsorshipPage.css';

const EMPTY_FORM = { name: '', email: '', phone: '', objective: '', mailingAddress: '' };

// Danaya (the date-booking flow below) and Development Projects (the bank
// details that used to live at the standalone /development/ page) are now
// two separate pages — /sponsorship/danaya/ and
// /sponsorship/development-projects/ — reached via the SponsorshipLandingPage
// index at /sponsorship/, matching the nav → index → content flow already
// used by Dictionary/Programs/Dhamma Sermons (client request, 2026-09).
// `category` picks which one this route renders; no in-page toggle between
// them any more, for the same reason those other sections don't have one.
// The page's own EN/SI toggle was replaced by the global nav-bar language
// toggle (client request, 2026-09) — reads the current language instead of
// keeping its own local state.
export function SponsorshipPage({ category }) {
  const { language, t } = useTranslation();
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
      setError(t('sponsorship.selectDateError'));
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
      setSuccess(t('sponsorship.bookingSuccess', { date: selectedDate }));
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
      <h1>{category === 'development' ? t('sponsorship.developmentHeading') : t('sponsorship.pageTitle')}</h1>

      {category === 'development' ? (
        <div className="sponsorship__development">
          <DevelopmentBankDetails />
          <p className="sponsorship__development-status">{t('sponsorship.developmentStatus')}</p>
        </div>
      ) : (
        <>
          <div className="sponsorship__note card">
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

          <h2 className="sponsorship__section-heading">{t('sponsorship.selectDate')}</h2>
          {calendarError ? (
            <p className="sponsorship__error">{t('sponsorship.calendarError')}</p>
          ) : (
            <BookingCalendar
              bookings={bookings}
              loading={calendarLoading}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMonthChange={loadCalendar}
            />
          )}

          <h2 className="sponsorship__section-heading">{t('sponsorship.bookingForm')}</h2>
          <form className="sponsorship__form" onSubmit={handleSubmit}>
            <label>
              {t('common.name')}
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
            </label>
            <label>
              {t('common.email')}
              <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </label>
            <label>
              {t('common.phoneNumber')}
              <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
            </label>
            <label>
              {t('sponsorship.selectDate')}
              <input value={selectedDate ?? ''} placeholder={t('sponsorship.datePlaceholder')} readOnly required />
            </label>
            <label>
              {t('sponsorship.detailsObjective')}
              <textarea value={form.objective} onChange={(e) => updateField('objective', e.target.value)} rows={3} required />
            </label>
            <label>
              {t('sponsorship.mailingAddress')}
              <input
                value={form.mailingAddress}
                onChange={(e) => updateField('mailingAddress', e.target.value)}
                placeholder={t('sponsorship.optional')}
              />
            </label>

            {error ? <p className="sponsorship__error">{error}</p> : null}
            {success ? <p className="sponsorship__success">{success}</p> : null}

            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? t('common.sending') : t('common.send')}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
