import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AsuMahaSrawakayanPage } from './pages/AsuMahaSrawakayanPage';
import { TripitakaSearchPage } from './pages/TripitakaSearchPage';
import { ScrollTopBar } from './components/ScrollTopBar';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { DictionaryPage } from './pages/DictionaryPage';
import { TripitakaCataloguePage } from './pages/TripitakaCataloguePage';
import { EntryListPage } from './pages/EntryListPage';
import { EntryDetailPage } from './pages/EntryDetailPage';
import { PdfBooksLandingPage } from './pages/PdfBooksLandingPage';
import { PdfBookCategoryPage } from './pages/PdfBookCategoryPage';
import { DhammaSermonIndexPage } from './pages/DhammaSermonIndexPage';
import { DhammaSermonSeriesPage } from './pages/DhammaSermonSeriesPage';
import { BuddhaPujaPage } from './pages/BuddhaPujaPage';
import { SponsorshipPage } from './pages/SponsorshipPage';
import { MeditationProgramsPage } from './pages/MeditationProgramsPage';
import { KatinaCeremonyPage } from './pages/KatinaCeremonyPage';
import { ProgramsLandingPage } from './pages/ProgramsLandingPage';
import { SatharaPohoyaCalendarIndexPage } from './pages/SatharaPohoyaCalendarIndexPage';
import { PohoyaCalendarYearPage } from './pages/PohoyaCalendarYearPage';
import { AboutPage } from './pages/AboutPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { DevelopmentPage } from './pages/DevelopmentPage';
import { SpecialThanksPage } from './pages/SpecialThanksPage';
import { StaticDocumentPage } from './pages/StaticDocumentPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminEntriesListPage } from './pages/admin/AdminEntriesListPage';
import { AdminEntryFormPage } from './pages/admin/AdminEntryFormPage';
import { AdminPdfBooksListPage } from './pages/admin/AdminPdfBooksListPage';
import { AdminPdfBookFormPage } from './pages/admin/AdminPdfBookFormPage';
import { AdminVideoSeriesListPage } from './pages/admin/AdminVideoSeriesListPage';
import { AdminVideoSeriesFormPage } from './pages/admin/AdminVideoSeriesFormPage';
import { AdminVideosListPage } from './pages/admin/AdminVideosListPage';
import { AdminVideoFormPage } from './pages/admin/AdminVideoFormPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminSponsorshipListPage } from './pages/admin/AdminSponsorshipListPage';
import { AdminMeditationApplicationsPage } from './pages/admin/AdminMeditationApplicationsPage';
import { AdminKatinaListPage } from './pages/admin/AdminKatinaListPage';
import { AdminKatinaYearFormPage } from './pages/admin/AdminKatinaYearFormPage';
import { AdminKatinaGalleryPage } from './pages/admin/AdminKatinaGalleryPage';
import { AdminPohoyaCalendarListPage } from './pages/admin/AdminPohoyaCalendarListPage';
import { AdminPohoyaCalendarFormPage } from './pages/admin/AdminPohoyaCalendarFormPage';
import { AdminSpecialThanksListPage } from './pages/admin/AdminSpecialThanksListPage';
import { AdminSpecialThanksFormPage } from './pages/admin/AdminSpecialThanksFormPage';
import { AdminStaticDocumentFormPage } from './pages/admin/AdminStaticDocumentFormPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminNewsletterSubscribersPage } from './pages/admin/AdminNewsletterSubscribersPage';
import { AdminTripitakaCatalogueListPage } from './pages/admin/AdminTripitakaCatalogueListPage';
import { AdminTripitakaCatalogueFormPage } from './pages/admin/AdminTripitakaCatalogueFormPage';
import { AdminWhatsappPage } from './pages/admin/AdminWhatsappPage';
import { RequireAdminAuth } from './components/admin/RequireAdminAuth';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminSessionProvider } from './components/admin/AdminSessionProvider';
import { PDF_BOOK_CATEGORIES } from './config/pdfBookCategories';
import { DHAMMA_SERMON_SERIES_SLUGS } from './config/dhammaSermonSeries';
import { useTheme } from './hooks/useTheme';

// Article-list pattern (build-spec §3) routes: same two components, one
// per entry-type slug — see frontend/src/config/entryTypes.js.
const ARTICLE_LIST_SLUGS = ['post', 'ape-budu-hamuduruwo-all', 'important-articles'];

// React Router v6 can't match a :param fused into a literal path segment
// (confirmed: a path like "/sathara-pohoya-calendar-:year/" and a splat
// like "/sathara-pohoya-calendar-*" both fail to match) — so the exact
// "/sathara-pohoya-calendar-2026/" URL shape from the legacy site can only
// be handled via the catch-all route below + manual parsing, which is what
// keeps this genuinely open-ended for admin-added future years without a
// code change.
function CatchAllRoute() {
  const { pathname } = useLocation();
  if (/^\/sathara-pohoya-calendar-[^/]+\/?$/.test(pathname)) {
    return <PohoyaCalendarYearPage />;
  }
  return <p style={{ padding: '2rem' }}>Page not found.</p>;
}

// NavBar is public-only (build-spec §2.2) — AdminLayout has its own nav.
// The theme toggle lives in NavBar, but the theme itself (via useTheme in
// App, below) applies to the whole document regardless of which page —
// including admin pages, which don't render NavBar and so have no toggle
// of their own, but still reflect whatever theme was last chosen.
function GlobalNavBar({ theme, toggleTheme }) {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <NavBar theme={theme} toggleTheme={toggleTheme} />;
}

// Footer (build-spec §2.3) mirrors NavBar's public-only mount.
function GlobalFooter() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <Footer />;
}

export function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <ScrollTopBar />
      <GlobalNavBar theme={theme} toggleTheme={toggleTheme} />
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

        <Route path="/dhamma-sermon/" element={<DhammaSermonIndexPage />} />
        {DHAMMA_SERMON_SERIES_SLUGS.map((slug) => (
          <Route key={slug} path={`/${slug}/`} element={<DhammaSermonSeriesPage seriesSlug={slug} />} />
        ))}
        <Route path="/buddha-puja/" element={<BuddhaPujaPage />} />
        <Route path="/sponsorship/" element={<SponsorshipPage />} />
        <Route path="/meditation-programs/" element={<MeditationProgramsPage />} />
        <Route path="/kathina-ceremony/" element={<KatinaCeremonyPage />} />
        <Route path="/programs/" element={<ProgramsLandingPage />} />
        <Route path="/sathara-pohoya-calendar/" element={<SatharaPohoyaCalendarIndexPage />} />
        <Route path="/about/" element={<AboutPage />} />
        <Route path="/contact-us/" element={<ContactUsPage />} />
        <Route path="/development/" element={<DevelopmentPage />} />
        <Route path="/special-thanks/" element={<SpecialThanksPage />} />
        <Route path="/honorable-tribute/" element={<StaticDocumentPage slug="honorable-tribute" />} />
        <Route
          path="/siri-sugatha-sasana-bandumathi/"
          element={<StaticDocumentPage slug="siri-sugatha-sasana-bandumathi" />}
        />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          element={
            <AdminSessionProvider>
              <RequireAdminAuth />
            </AdminSessionProvider>
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/entries/newsletter" replace />} />
            <Route path="/admin/entries/:type" element={<AdminEntriesListPage />} />
            <Route path="/admin/entries/:type/new" element={<AdminEntryFormPage />} />
            <Route path="/admin/entries/:type/:id/edit" element={<AdminEntryFormPage />} />
            <Route path="/admin/pdf-books/:category" element={<AdminPdfBooksListPage />} />
            <Route path="/admin/pdf-books/:category/new" element={<AdminPdfBookFormPage />} />
            <Route path="/admin/pdf-books/:category/:id/edit" element={<AdminPdfBookFormPage />} />

            <Route path="/admin/video-series" element={<AdminVideoSeriesListPage />} />
            <Route path="/admin/video-series/new" element={<AdminVideoSeriesFormPage />} />
            <Route path="/admin/video-series/:slug/edit" element={<AdminVideoSeriesFormPage />} />

            <Route path="/admin/videos/dhamma-sermon/:seriesSlug" element={<AdminVideosListPage section="dhamma_sermon" />} />
            <Route path="/admin/videos/dhamma-sermon/:seriesSlug/new" element={<AdminVideoFormPage section="dhamma_sermon" />} />
            <Route path="/admin/videos/dhamma-sermon/:seriesSlug/:id/edit" element={<AdminVideoFormPage section="dhamma_sermon" />} />

            <Route path="/admin/videos/buddha-puja" element={<AdminVideosListPage section="buddha_puja" />} />
            <Route path="/admin/videos/buddha-puja/new" element={<AdminVideoFormPage section="buddha_puja" />} />
            <Route path="/admin/videos/buddha-puja/:id/edit" element={<AdminVideoFormPage section="buddha_puja" />} />

            <Route
              path="/admin/galleries/buddha-puja"
              element={<AdminGalleryPage gallery="buddha-puja" title="Buddha Puja Photo Gallery" />}
            />
            <Route path="/admin/galleries/about" element={<AdminGalleryPage gallery="about" title="About Photo Gallery" />} />

            <Route path="/admin/sponsorship" element={<AdminSponsorshipListPage />} />

            <Route path="/admin/meditation-applications" element={<AdminMeditationApplicationsPage />} />

            <Route path="/admin/katina" element={<AdminKatinaListPage />} />
            <Route path="/admin/katina/new" element={<AdminKatinaYearFormPage />} />
            <Route path="/admin/katina/:year/edit" element={<AdminKatinaYearFormPage />} />
            <Route path="/admin/galleries/katina/:year" element={<AdminKatinaGalleryPage />} />

            <Route path="/admin/pohoya-calendar" element={<AdminPohoyaCalendarListPage />} />
            <Route path="/admin/pohoya-calendar/new" element={<AdminPohoyaCalendarFormPage />} />
            <Route path="/admin/pohoya-calendar/:year/edit" element={<AdminPohoyaCalendarFormPage />} />

            <Route path="/admin/special-thanks" element={<AdminSpecialThanksListPage />} />
            <Route path="/admin/special-thanks/new" element={<AdminSpecialThanksFormPage />} />
            <Route path="/admin/special-thanks/:id/edit" element={<AdminSpecialThanksFormPage />} />

            <Route path="/admin/honorable-tribute" element={<AdminStaticDocumentFormPage slug="honorable-tribute" />} />
            <Route
              path="/admin/siri-sugatha-sasana-bandumathi"
              element={<AdminStaticDocumentFormPage slug="siri-sugatha-sasana-bandumathi" />}
            />

            <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
            <Route path="/admin/newsletter-subscribers" element={<AdminNewsletterSubscribersPage />} />

            <Route path="/admin/tripitaka-catalogue" element={<AdminTripitakaCatalogueListPage />} />
            <Route path="/admin/tripitaka-catalogue/new" element={<AdminTripitakaCatalogueFormPage />} />
            <Route path="/admin/tripitaka-catalogue/:id/edit" element={<AdminTripitakaCatalogueFormPage />} />

            <Route path="/admin/whatsapp" element={<AdminWhatsappPage />} />
          </Route>
        </Route>

        <Route path="/" element={<HomePage />} />
        <Route path="/asu-maha-srawakayan-wahansela/" element={<AsuMahaSrawakayanPage />} />
        <Route path="/tripitaka/" element={<TripitakaSearchPage />} />
        <Route path="*" element={<CatchAllRoute />} />
      </Routes>
      <GlobalFooter />
    </BrowserRouter>
  );
}
