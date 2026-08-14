import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DictionaryPage } from './pages/DictionaryPage';
import { TripitakaCataloguePage } from './pages/TripitakaCataloguePage';
import { EntryListPage } from './pages/EntryListPage';
import { EntryDetailPage } from './pages/EntryDetailPage';
import { PdfBooksLandingPage } from './pages/PdfBooksLandingPage';
import { PdfBookCategoryPage } from './pages/PdfBookCategoryPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminEntriesListPage } from './pages/admin/AdminEntriesListPage';
import { AdminEntryFormPage } from './pages/admin/AdminEntryFormPage';
import { AdminPdfBooksListPage } from './pages/admin/AdminPdfBooksListPage';
import { AdminPdfBookFormPage } from './pages/admin/AdminPdfBookFormPage';
import { RequireAdminAuth } from './components/admin/RequireAdminAuth';
import { AdminLayout } from './components/admin/AdminLayout';
import { PDF_BOOK_CATEGORIES } from './config/pdfBookCategories';

// Article-list pattern (build-spec §3) routes: same two components, one
// per entry-type slug — see frontend/src/config/entryTypes.js.
const ARTICLE_LIST_SLUGS = ['post', 'ape-budu-hamuduruwo-all', 'important-articles'];

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/pali-sinhalese-dictionary/"
          element={<DictionaryPage slug="pali-sinhalese-dictionary" searchPlaceholder="Search Pali word... / පාලි වචනය සොයන්න..." />}
        />
        <Route
          path="/sinhala-dictionary/"
          element={<DictionaryPage slug="sinhala-dictionary" searchPlaceholder="Search Sinhala word... / වචනය සොයන්න..." />}
        />
        <Route path="/tripitaka-catalogs/" element={<TripitakaCataloguePage />} />

        {ARTICLE_LIST_SLUGS.map((slug) => (
          <Route key={slug} path={`/${slug}/`} element={<EntryListPage slug={slug} />} />
        ))}
        {ARTICLE_LIST_SLUGS.map((slug) => (
          <Route key={slug} path={`/${slug}/:id/`} element={<EntryDetailPage slug={slug} />} />
        ))}

        <Route path="/pdf-books/" element={<PdfBooksLandingPage />} />
        {PDF_BOOK_CATEGORIES.map((c) => (
          <Route key={c.slug} path={`/${c.slug}/`} element={<PdfBookCategoryPage slug={c.slug} />} />
        ))}

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdminAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/entries/newsletter" replace />} />
            <Route path="/admin/entries/:type" element={<AdminEntriesListPage />} />
            <Route path="/admin/entries/:type/new" element={<AdminEntryFormPage />} />
            <Route path="/admin/entries/:type/:id/edit" element={<AdminEntryFormPage />} />
            <Route path="/admin/pdf-books/:category" element={<AdminPdfBooksListPage />} />
            <Route path="/admin/pdf-books/:category/new" element={<AdminPdfBookFormPage />} />
            <Route path="/admin/pdf-books/:category/:id/edit" element={<AdminPdfBookFormPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/sinhala-dictionary/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
