import { useTranslation } from '../i18n/LanguageContext';
import './TripitakaSearchPage.css';

// build-spec §7 — originally a thin wrapper embedding tipitaka.lk directly
// (no backend logic). tipitaka.lk started sending `X-Frame-Options:
// SAMEORIGIN` (2026-10, their change, not ours), which makes every browser
// refuse to render it in an iframe — permanently, not an occasional load
// failure — so the embed was removed and the outbound link (previously
// just a fallback line above the iframe) is now the page's only, primary
// action.
//
// Lives at /tripitaka-search/, one card away from the Tripitaka landing
// page at /tripitaka/ (client request, 2026-09: nav → index → content flow
// consistent with Dictionary/Programs/Dhamma Sermons) — the on-page links
// to Tripitaka Catalogue/PDF Books that used to sit above the embed moved
// to that landing page instead, since this page no longer needs to double
// as its own mini-index.
export function TripitakaSearchPage() {
  const { t } = useTranslation();
  return (
    <div className="tripitaka-search">
      <h1>{t('home.tripitakaSearch')}</h1>
      <p className="tripitaka-search__note">{t('tripitakaSearch.note')}</p>
      <a
        className="btn btn--primary tripitaka-search__link"
        href="https://tipitaka.lk/"
        target="_blank"
        rel="noreferrer"
      >
        {t('tripitakaSearch.openLink')}
      </a>
    </div>
  );
}
