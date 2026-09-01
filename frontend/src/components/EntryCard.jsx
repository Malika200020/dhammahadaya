import { Link } from 'react-router-dom';
import './EntryCard.css';

// The Article-list pattern's card (build-spec §3) — shared by EntryListPage
// and the home page's Last Newsletters section (§4.3), which is just the
// newest 4 of the same 'post' entries, not a separate feature.
//
// Episode badge: Ape Budu Hamuduruwo's 426 migrated stories (see
// content/apeBuduHamuduruwoContent.js and backend/scripts/*-ape-budu-
// hamuduruwo.js) don't have reliably distinct titles — the source site's
// own numbering is inconsistent, so unrelated stories can share the exact
// same displayed title (e.g. two different posts both titled "... 10").
// `entry.order` holds each story's real 1-426 reading-order position
// (set at import time), so showing it disambiguates cards that would
// otherwise look identical. Gated to this one slug — other entry types
// have real distinct titles and don't need it (their `order` is unset/0).
export function EntryCard({ entry, basePath }) {
  const showEpisodeNumber = basePath === '/ape-budu-hamuduruwo-all/' && entry.order > 0;
  return (
    <article className="entry-card card card--interactive">
      {entry.cover_image ? <img src={entry.cover_image} alt="" className="entry-card__image" /> : null}
      {showEpisodeNumber ? <span className="entry-card__episode">Episode {entry.order}</span> : null}
      <h2 className="entry-card__title">{entry.title_si}</h2>
      <p className="entry-card__excerpt">{entry.excerpt}</p>
      <Link to={`${basePath}${entry.id}/`} className="entry-card__read-more">
        Read More »
      </Link>
    </article>
  );
}
