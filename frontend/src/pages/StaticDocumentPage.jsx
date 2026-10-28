import { useEffect, useState } from 'react';
import { getStaticDocument } from '../api/staticDocuments';
import { getGallery } from '../api/galleries';
import { LoadingState } from '../components/LoadingState';
import { PhotoGallery } from '../components/PhotoGallery';
import { useTranslation } from '../i18n/LanguageContext';
import './StaticDocumentPage.css';

// One page for both single-record formal documents (build-spec §17.3
// Honorable Tribute, §17.4 Siri Sugatha Sasana Bandumathi) — configured by
// `slug`, same reusable-by-config pattern as the dictionary/PDF-books/
// sermon-series pages. Photo gallery added (client request, 2026-10) —
// reuses the same gallery_images table/PhotoGallery component as Buddha
// Puja/Katina/About, keyed by this page's own slug as the gallery name
// (see AdminGalleryPage usage in App.jsx for the matching admin side).
export function StaticDocumentPage({ slug }) {
  const { language, t } = useTranslation();
  const [doc, setDoc] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDoc(null);
    setImages([]);
    setError(null);
    setLoading(true);
    Promise.all([getStaticDocument(slug), getGallery(slug)])
      .then(([d, g]) => {
        setDoc(d.document);
        setImages(g.images);
      })
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
      {/* Absent entirely when empty (PhotoGallery's own behavior), not an
          empty placeholder section. */}
      <PhotoGallery images={images} />
    </div>
  );
}
