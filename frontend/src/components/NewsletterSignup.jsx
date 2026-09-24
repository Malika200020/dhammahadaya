import { useState } from 'react';
import { subscribeToNewsletter } from '../api/newsletter';
import { useTranslation } from '../i18n/LanguageContext';
import './NewsletterSignup.css';

// build-spec §4.11 — first built here for the Contact Us page, reused as-is
// on the home page once it exists.
export function NewsletterSignup() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await subscribeToNewsletter(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="newsletter-signup" onSubmit={handleSubmit}>
      <label>
        {t('newsletterSignup.label')}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletterSignup.emailPlaceholder')}
          required
        />
      </label>
      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? t('newsletterSignup.subscribing') : t('common.subscribe')}
      </button>
      {error ? <p className="newsletter-signup__error">{error}</p> : null}
      {success ? <p className="newsletter-signup__success">{t('newsletterSignup.success')}</p> : null}
    </form>
  );
}
