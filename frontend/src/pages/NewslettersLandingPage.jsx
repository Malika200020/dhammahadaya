import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import './NewslettersLandingPage.css';

// Landing page for the Newsletters nav item, added so it matches the
// nav → index → content flow already used by Dictionary/Programs/Dhamma
// Sermons (client request, 2026-09) — these four used to be reachable via
// a nav dropdown, then as on-page links on the Newsletters list itself;
// they now live here instead, matching how those other sections work.
export function NewslettersLandingPage() {
  const { t } = useTranslation();
  return (
    <div className="newsletters-landing">
      <h1>{t('nav.newsletters')}</h1>
      <div className="newsletters-landing__grid">
        <Link to="/post/" className="newsletters-landing__card card card--interactive">
          {t('nav.newsletters')}
        </Link>
        <Link to="/ape-budu-hamuduruwo-all/" className="newsletters-landing__card card card--interactive">
          {t('newsletters.apeBuduHamuduruwo')}
        </Link>
        <Link to="/asu-maha-srawakayan-wahansela/" className="newsletters-landing__card card card--interactive">
          {t('newsletters.asuMahaSrawakayanWahansela')}
        </Link>
        <Link to="/important-articles/" className="newsletters-landing__card card card--interactive">
          {t('newsletters.importantArticles')}
        </Link>
      </div>
    </div>
  );
}
