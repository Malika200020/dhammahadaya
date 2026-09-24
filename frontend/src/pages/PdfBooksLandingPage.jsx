import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { PDF_BOOK_CATEGORIES } from '../config/pdfBookCategories';
import './PdfBooksLandingPage.css';

// build-spec §8.1 — landing page linking to the four category pages.
export function PdfBooksLandingPage() {
  const { language, t } = useTranslation();
  return (
    <div className="pdf-books-landing">
      <h1>{t('home.pdfBooks')}</h1>
      <div className="pdf-books-landing__grid">
        {PDF_BOOK_CATEGORIES.map((c) => (
          <Link key={c.slug} to={`/${c.slug}/`} className="pdf-books-landing__card card card--interactive">
            {/* Category titles are already bilingual (see
                config/pdfBookCategories.js) — picks the one matching the
                current language instead of always showing both stacked
                (client request, 2026-09: no mixed-language experience). */}
            <span className="pdf-books-landing__title-en">{language === 'en' ? c.titleEn : c.titleSi}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
