import { useTranslation } from '../i18n/LanguageContext';
import './LanguageToggle.css';

// Global language toggle in the nav bar (client request, 2026-09) — same
// two-button EN/SI pattern the About and Sponsorship pages already used
// for their own local toggles, just wired to the global language instead
// of page-local state, so the choice applies everywhere.
export function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation();
  return (
    <div className="language-toggle" role="group" aria-label={t('language.groupLabel')}>
      <button
        type="button"
        className={language === 'en' ? 'language-toggle__btn language-toggle__btn--active' : 'language-toggle__btn'}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        className={language === 'si' ? 'language-toggle__btn language-toggle__btn--active' : 'language-toggle__btn'}
        onClick={() => setLanguage('si')}
        aria-pressed={language === 'si'}
      >
        සිං
      </button>
    </div>
  );
}
