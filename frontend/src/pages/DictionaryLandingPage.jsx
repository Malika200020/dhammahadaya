import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import './DictionaryLandingPage.css';

// Landing page for the Dictionary nav item, added when its nav dropdown
// (Pali Sinhalese Dictionary / Sinhala Dictionary) was flattened into a
// single link (client request, 2026-09: dropdown submenus removed
// site-wide) — matches the card-grid pattern used by the other former
// dropdowns (PdfBooksLandingPage, ProgramsLandingPage).
export function DictionaryLandingPage() {
  const { t } = useTranslation();
  return (
    <div className="dictionary-landing">
      <h1>{t('dictionary.pageTitle')}</h1>
      <div className="dictionary-landing__grid">
        <Link to="/pali-sinhalese-dictionary/" className="dictionary-landing__card card card--interactive">
          {t('dictionary.paliSinhalese')}
        </Link>
        <Link to="/sinhala-dictionary/" className="dictionary-landing__card card card--interactive">
          {t('dictionary.sinhala')}
        </Link>
      </div>
    </div>
  );
}
