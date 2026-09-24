import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import './SponsorshipLandingPage.css';

// Landing page for the Sponsorships nav item, added so it matches the
// nav → index → content flow already used by Dictionary/Programs/Dhamma
// Sermons (client request, 2026-09) — Danaya and Development Projects used
// to be in-page tabs on this same URL; they're now their own pages.
// Development Projects listed first (client request, 2026-09 follow-up).
// Acknowledgement (Special Thanks/Honorable Tribute/Siri Sugatha Sasana
// Bandumathi) added as its own third section, moved out of the Development
// Projects page where those three used to sit alongside the bank details.
export function SponsorshipLandingPage() {
  const { t } = useTranslation();
  return (
    <div className="sponsorship-landing">
      <h1>{t('sponsorship.pageTitle')}</h1>
      <div className="sponsorship-landing__grid">
        <Link to="/sponsorship/development-projects/" className="sponsorship-landing__card card card--interactive">
          {t('sponsorship.developmentHeading')}
        </Link>
        <Link to="/sponsorship/danaya/" className="sponsorship-landing__card card card--interactive">
          {t('sponsorship.danaya')}
        </Link>
        <Link to="/sponsorship/acknowledgement/" className="sponsorship-landing__card card card--interactive">
          {t('sponsorship.acknowledgement')}
        </Link>
      </div>
    </div>
  );
}
