import { useEffect, useState } from 'react';
import { getStaticDocument } from '../api/staticDocuments';
import './StaticDocumentPage.css';

// One page for both single-record formal documents (build-spec §17.3
// Honorable Tribute, §17.4 Siri Sugatha Sasana Bandumathi) — configured by
// `slug`, same reusable-by-config pattern as the dictionary/PDF-books/
// sermon-series pages.
export function StaticDocumentPage({ slug }) {
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDoc(null);
    setError(null);
    getStaticDocument(slug)
      .then((d) => setDoc(d.document))
      .catch(setError);
  }, [slug]);

  if (error) return <p className="static-document__error">{error.message}</p>;
  if (!doc) return null;

  return (
    <div className="static-document">
      <h1>
        {doc.title_en} | {doc.title_si}
      </h1>
      {/* eslint-disable-next-line react/no-danger */}
      <div className="static-document__body card" dangerouslySetInnerHTML={{ __html: doc.body }} />
    </div>
  );
}
