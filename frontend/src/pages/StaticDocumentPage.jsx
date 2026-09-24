import { useEffect, useState } from 'react';
import { getStaticDocument } from '../api/staticDocuments';
import { LoadingState } from '../components/LoadingState';
import { useTranslation } from '../i18n/LanguageContext';
import './StaticDocumentPage.css';

// One page for both single-record formal documents (build-spec §17.3
// Honorable Tribute, §17.4 Siri Sugatha Sasana Bandumathi) — configured by
// `slug`, same reusable-by-config pattern as the dictionary/PDF-books/
// sermon-series pages.
export function StaticDocumentPage({ slug }) {
  const { language, t } = useTranslation();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDoc(null);
    setError(null);
    setLoading(true);
    getStaticDocument(slug)
      .then((d) => setDoc(d.document))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug]);

  if (error) return <p className="static-document__error">{error.message}</p>;
  if (loading) return <LoadingState message={t('common.loadingColdStart')} />;
  if (!doc) return null;

  // title_en/title_si are already-bilingual (admin-entered) — picks
  // whichever matches the current language instead of always showing both
  // (client request, 2026-09).
  const title = (language === 'en' ? doc.title_en : doc.title_si) || doc.title_si || doc.title_en;

  return (
    <div className="static-document">
      <h1>{title}</h1>
      {/* eslint-disable-next-line react/no-danger */}
      <div className="static-document__body card" dangerouslySetInnerHTML={{ __html: doc.body }} />
    </div>
  );
}
