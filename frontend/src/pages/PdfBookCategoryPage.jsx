import { useEffect, useState } from 'react';
import { getPdfBookCategory } from '../api/pdfBooks';
import './PdfBookCategoryPage.css';

function Subsections({ subsections }) {
  return subsections.map((sub) => (
    <div key={sub.subsection} className="pdf-book-category__subsection">
      <h3>{sub.subsection}</h3>
      <ul className="pdf-book-category__entries">
        {sub.entries.map((entry) => (
          <PdfEntryRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </div>
  ));
}

// The live site presents each Tripitaka edition as three pitaka tabs
// (Vinaya / Sutta / Abhidhamma) rather than one long scroll — the API
// only sends `groups` when a section's subsections classify cleanly into
// that pattern (see classifyPitaka in backend/src/routes/pdf-books.js),
// so this only activates for sections that actually match; anything else
// falls back to the flat subsection list below.
function SectionTabs({ groups }) {
  const [activeKey, setActiveKey] = useState(groups[0].key);
  const active = groups.find((g) => g.key === activeKey) ?? groups[0];

  return (
    <>
      <div className="pdf-book-category__tabs" role="tablist">
        {groups.map((g) => (
          <button
            key={g.key}
            type="button"
            role="tab"
            aria-selected={g.key === activeKey}
            className={`pdf-book-category__tab${g.key === activeKey ? ' pdf-book-category__tab--active' : ''}`}
            onClick={() => setActiveKey(g.key)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <Subsections subsections={active.subsections} />
    </>
  );
}

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

      {data.sectionTabs ? (
        // The live site tabs across the top-level sections themselves for
        // this category (see backend/src/routes/pdf-books.js) — no
        // separate per-section heading, the tab strip IS the navigation.
        <SectionTabs key={data.slug} groups={data.sectionTabs} />
      ) : (
        data.sections.map((section) => (
          <section key={section.section} className="pdf-book-category__section">
            <h2>{section.section}</h2>
            {section.groups ? (
              <SectionTabs groups={section.groups} />
            ) : (
              <Subsections subsections={section.subsections} />
            )}
          </section>
        ))
      )}
    </div>
  );
}
