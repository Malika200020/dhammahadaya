import { Link } from 'react-router-dom';
import { PDF_BOOK_CATEGORIES } from '../config/pdfBookCategories';
import './PdfBooksLandingPage.css';

// build-spec §8.1 — landing page linking to the four category pages.
export function PdfBooksLandingPage() {
  return (
    <div className="pdf-books-landing">
      <h1>PDF Books</h1>
      <div className="pdf-books-landing__grid">
        {PDF_BOOK_CATEGORIES.map((c) => (
          <Link key={c.slug} to={`/${c.slug}/`} className="pdf-books-landing__card card card--interactive">
            <span className="pdf-books-landing__title-en">{c.titleEn}</span>
            <span className="pdf-books-landing__title-si">{c.titleSi}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
