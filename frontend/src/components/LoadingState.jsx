import './LoadingState.css';

// Shared loading indicator for every page that fetches backend data — the
// Render free-tier backend sleeps after 15 min idle and can take up to a
// minute to wake, so a wait with no visual feedback reads as "broken" to
// visitors. `message` should set honest expectations for the wait when a
// page can plausibly hit that cold start (see SponsorshipPage, EntryListPage).
export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-state__spinner" aria-hidden="true" />
      <span className="loading-state__text">{message}</span>
    </div>
  );
}
