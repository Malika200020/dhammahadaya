import { useState } from 'react';
import { submitMeditationApplication } from '../api/meditation';
import { Recaptcha, RECAPTCHA_ENABLED } from '../components/Recaptcha';
import { useTranslation } from '../i18n/LanguageContext';
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
  const { language, t } = useTranslation();
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
      setError(t('meditation.stayTooLongError', { max: MAX_STAY_DAYS }));
      return;
    }
    if (!form.agreed) {
      setError(t('meditation.mustAgreeError'));
      return;
    }
    if (RECAPTCHA_ENABLED && !recaptchaToken) {
      setError(t('meditation.recaptchaError'));
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
      setSuccess(t('meditation.successMessage'));
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
      <h1>{t('meditation.pageTitle')}</h1>

      {/* [CONTENT — Sinhala, migrate verbatim] build-spec §13 */}
      <div className="meditation__rules card">
        {meditationRulesParagraphs.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <h2 className="meditation__section-heading">{t('meditation.registration')}</h2>
      <form className="meditation__form" onSubmit={handleSubmit}>
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
          {t('meditation.fromDate', { max: MAX_STAY_DAYS })}
          <input type="date" value={form.fromDate} onChange={(e) => updateField('fromDate', e.target.value)} required />
        </label>
        <label>
          {t('meditation.toDate')}
          <input type="date" value={form.toDate} onChange={(e) => updateField('toDate', e.target.value)} required />
        </label>
        {stayTooLong ? (
          <p className="meditation__field-error">{t('meditation.stayTooLongNotice', { days, max: MAX_STAY_DAYS })}</p>
        ) : null}

        <fieldset className="meditation__fieldset">
          <legend>{t('meditation.experienceLabel')}</legend>
          <label className="meditation__radio">
            <input
              type="radio"
              name="experience"
              value="yes"
              checked={form.experience === 'yes'}
              onChange={() => updateField('experience', 'yes')}
              required
            />
            {t('meditation.experienceYes')}
          </label>
          <label className="meditation__radio">
            <input
              type="radio"
              name="experience"
              value="no"
              checked={form.experience === 'no'}
              onChange={() => updateField('experience', 'no')}
            />
            {t('meditation.experienceNo')}
          </label>
        </fieldset>

        <label>
          {t('meditation.meditationTypesLabel')}
          <input value={form.meditationTypes} onChange={(e) => updateField('meditationTypes', e.target.value)} />
        </label>
        <label>
          {t('meditation.previousTeachersLabel')}
          <input value={form.previousTeachers} onChange={(e) => updateField('previousTeachers', e.target.value)} />
        </label>
        <label>
          {t('meditation.currentDiseasesLabel')}
          <textarea value={form.currentDiseases} onChange={(e) => updateField('currentDiseases', e.target.value)} rows={2} />
        </label>

        <label className="meditation__agree">
          <input type="checkbox" checked={form.agreed} onChange={(e) => updateField('agreed', e.target.checked)} required />
          <span>{language === 'en' ? meditationPledgeEn : meditationPledgeSi}</span>
        </label>

        <Recaptcha onChange={setRecaptchaToken} />

        {error ? <p className="meditation__error">{error}</p> : null}
        {success ? <p className="meditation__success">{success}</p> : null}

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? t('common.sending') : t('common.send')}
        </button>
      </form>
    </div>
  );
}
