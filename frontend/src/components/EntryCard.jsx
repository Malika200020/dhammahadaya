import { Link } from 'react-router-dom';
import './EntryCard.css';

// The Article-list pattern's card (build-spec §3) — shared by EntryListPage
// and the home page's Last Newsletters section (§4.3), which is just the
// newest 4 of the same 'post' entries, not a separate feature.
export function EntryCard({ entry, basePath }) {
  return (
    <article className="entry-card">
      {entry.cover_image ? <img src={entry.cover_image} alt="" className="entry-card__image" /> : null}
      <h2 className="entry-card__title">{entry.title_si}</h2>
      <p className="entry-card__excerpt">{entry.excerpt}</p>
      <Link to={`${basePath}${entry.id}/`} className="entry-card__read-more">
        Read More »
      </Link>
    </article>
  );
}
