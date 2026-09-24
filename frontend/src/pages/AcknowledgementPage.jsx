import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import './AcknowledgementPage.css';

// New Sponsorships sub-section (client request, 2026-09): Special Thanks,
// Honorable Tribute, and Siri Sugatha Sasana Bandumathi used to be links
// sitting alongside the Development Projects bank details; they now live
// under their own "Acknowledgement" heading instead, reached from the
// Sponsorship landing page like Danaya/Development Projects are.
export function AcknowledgementPage() {
  const { t } = useTranslation();
  return (
    <div className="acknowledgement">
      <h1>{t('sponsorship.acknowledgement')}</h1>
      <div className="acknowledgement__grid">
        <Link to="/special-thanks/" className="acknowledgement__card card card--interactive">
          {t('sponsorship.specialThanks')}
        </Link>
        <Link to="/honorable-tribute/" className="acknowledgement__card card card--interactive">
          {t('sponsorship.honorableTribute')}
        </Link>
        <Link to="/siri-sugatha-sasana-bandumathi/" className="acknowledgement__card card card--interactive">
          {t('sponsorship.siriSugathaSasanaBandumathi')}
        </Link>
      </div>
    </div>
  );
}
