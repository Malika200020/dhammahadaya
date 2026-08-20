import { useState } from 'react';
import { submitMeditationApplication } from '../api/meditation';
import { Recaptcha, RECAPTCHA_ENABLED } from '../components/Recaptcha';
import { meditationRulesParagraphs, meditationPledgeEn, meditationPledgeSi } from '../content/meditationContent';
import './MeditationProgramsPage.css';

const MAX_STAY_DAYS = 7;
const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  fromDate: '',
  toDate: '',
  experience: '',
  meditationTypes: '',
  previousTeachers: '',
  currentDiseases: '',
  agreed: false,
};

function stayDays(from, to) {
  if (!from || !to) return null;
  return Math.round((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
}

export function MeditationProgramsPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const days = stayDays(form.fromDate, form.toDate);
  const stayTooLong = days !== null && days > MAX_STAY_DAYS;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (stayTooLong) {
      setError(`Stay must be at most ${MAX_STAY_DAYS} days (From Date through To Date, inclusive).`);
      return;
    }
    if (!form.agreed) {
      setError('You must agree to the terms.');
      return;
    }
    if (RECAPTCHA_ENABLED && !recaptchaToken) {
      setError('Please complete the "I\'m not a robot" check.');
      return;
    }

    setSubmitting(true);
    try {
      await submitMeditationApplication({
        name: form.name,
        email: form.email,
        phone: form.phone,
        from_date: form.fromDate,
        to_date: form.toDate,
        experience: form.experience,
        meditation_types: form.meditationTypes || null,
        previous_teachers: form.previousTeachers || null,
        current_diseases: form.currentDiseases || null,
        agreed: form.agreed,
        recaptcha_token: recaptchaToken,
      });
      setSuccess('Thank you — your registration has been submitted. The monastery will be in touch.');
      setForm(EMPTY_FORM);
      setRecaptchaToken(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="meditation">
      <h1>Meditation Programs</h1>

      {/* [CONTENT — Sinhala, migrate verbatim] build-spec §13 */}
      <div className="meditation__rules card">
        {meditationRulesParagraphs.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <h2 className="meditation__section-heading">Registration</h2>
      <form className="meditation__form" onSubmit={handleSubmit}>
        <label>
          Name | නම
          <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
        </label>
        <label>
          Phone Number
          <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
        </label>
        <label>
          From Date (MAX 7 days) | දින සිට (උපරිම දින 7)
          <input type="date" value={form.fromDate} onChange={(e) => updateField('fromDate', e.target.value)} required />
        </label>
        <label>
          To Date
          <input type="date" value={form.toDate} onChange={(e) => updateField('toDate', e.target.value)} required />
        </label>
        {stayTooLong ? (
          <p className="meditation__field-error">
            That's {days} days — the maximum stay is {MAX_STAY_DAYS} days.
          </p>
        ) : null}

        <fieldset className="meditation__fieldset">
          <legend>Experience of meditation | භාවනා පුහුණු / නුපුහුණු බව</legend>
          <label className="meditation__radio">
            <input
              type="radio"
              name="experience"
              value="yes"
              checked={form.experience === 'yes'}
              onChange={() => updateField('experience', 'yes')}
              required
            />
            Yes / භාවනා පුහුණු
          </label>
          <label className="meditation__radio">
            <input
              type="radio"
              name="experience"
              value="no"
              checked={form.experience === 'no'}
              onChange={() => updateField('experience', 'no')}
            />
            No / නුපුහුණු බව
          </label>
        </fieldset>

        <label>
          Types of meditation performed | කරන ලද භාවනා වර්ග
          <input value={form.meditationTypes} onChange={(e) => updateField('meditationTypes', e.target.value)} />
        </label>
        <label>
          Who were your previous meditation teachers? | ඔබේ කලින් භාවනා ගුරුවරුන් කවුද?
          <input value={form.previousTeachers} onChange={(e) => updateField('previousTeachers', e.target.value)} />
        </label>
        <label>
          What are the current diseases? | දැනට පවතින රෝග මොනවාද?
          <textarea value={form.currentDiseases} onChange={(e) => updateField('currentDiseases', e.target.value)} rows={2} />
        </label>

        <label className="meditation__agree">
          <input type="checkbox" checked={form.agreed} onChange={(e) => updateField('agreed', e.target.checked)} required />
          <span>
            {meditationPledgeEn}
            <br />
            <br />
            {meditationPledgeSi}
          </span>
        </label>

        <Recaptcha onChange={setRecaptchaToken} />

        {error ? <p className="meditation__error">{error}</p> : null}
        {success ? <p className="meditation__success">{success}</p> : null}

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
