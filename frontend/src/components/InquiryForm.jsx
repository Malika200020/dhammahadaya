import { useState } from 'react';
import { submitInquiry } from '../api/inquiries';
import { useTranslation } from '../i18n/LanguageContext';
import './InquiryForm.css';

const EMPTY_FORM = { name: '', email: '', phone: '', message: '' };

// build-spec §4.10 — the small "get in touch" form, first built here for
// the Contact Us page and reused as-is on the home page once it exists
// (same component, same /api/inquiries endpoint — nothing Contact-Us-
// specific about it).
export function InquiryForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitInquiry(form);
      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
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
        <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
      </label>
      <label>
        {t('common.message')}
        <textarea value={form.message} onChange={(e) => updateField('message', e.target.value)} rows={4} required />
      </label>

      {error ? <p className="inquiry-form__error">{error}</p> : null}
      {success ? <p className="inquiry-form__success">{t('inquiryForm.success')}</p> : null}

      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? t('common.sending') : t('common.send')}
      </button>
    </form>
  );
}
