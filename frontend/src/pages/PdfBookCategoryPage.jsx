import { useEffect, useState } from 'react';
import { getPdfBookCategory } from '../api/pdfBooks';
import './PdfBookCategoryPage.css';

function PdfEntryRow({ entry }) {
  if (entry.link_status === 'no_link_yet') {
    // Visible placeholder, not a broken link and not hidden — build-spec
    // §8.3 explicitly tracks these as a distinct "no link yet" state so
    // users know the volume is planned.
    return (
      <li className="pdf-entry pdf-entry--pending" aria-disabled="true">
        <span className="pdf-entry__title">{entry.title}</span>
        <span className="pdf-entry__badge pdf-entry__badge--pending">Coming soon</span>
      </li>
    );
  }
  return (
    <li className="pdf-entry">
      <a href={entry.link_url} target="_blank" rel="noopener noreferrer" className="pdf-entry__title">
        {entry.title}
      </a>
      {entry.link_status === 'available_new' ? (
        <span className="pdf-entry__badge pdf-entry__badge--new">New</span>
      ) : null}
    </li>
  );
}

// Generic PDF Books category page (build-spec §8.2-8.5), configured only
// by `slug` — same component drives all four category pages. Grouping
// (section -> subsection -> entries) and ordering come entirely from the
// API, which preserves the source data's row order.
export function PdfBookCategoryPage({ slug }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPdfBookCategory(slug)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) return <p className="pdf-book-category__error">Failed to load: {error.message}</p>;
  if (!data) return null;

  return (
    <div className="pdf-book-category">
      <header className="pdf-book-category__header">
        <h1>
          {data.titleEn}
          {data.titleSi ? <span className="pdf-book-category__title-si"> — {data.titleSi}</span> : null}
        </h1>
      </header>

      {data.sections.map((section) => (
        <section key={section.section} className="pdf-book-category__section">
          <h2>{section.section}</h2>
          {section.subsections.map((sub) => (
            <div key={sub.subsection} className="pdf-book-category__subsection">
              <h3>{sub.subsection}</h3>
              <ul className="pdf-book-category__entries">
                {sub.entries.map((entry) => (
                  <PdfEntryRow key={entry.id} entry={entry} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
