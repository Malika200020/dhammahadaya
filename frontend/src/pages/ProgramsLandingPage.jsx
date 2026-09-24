import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import './ProgramsLandingPage.css';

// build-spec §16.1 — landing page for the Programs dropdown. Live site's
// /programs/ links to all four sub-sections (Sathara Pohoya Calendar,
// Buddha Puja, Katina Ceremony, Meditation Programs) — matched here as a
// card grid, consistent with the other index pages (Dhamma Sermons, PDF
// Books) rather than the live page's plain centered-paragraph links.
export function ProgramsLandingPage() {
  const { t } = useTranslation();
  return (
    <div className="programs">
      <h1>{t('nav.programs')}</h1>
      <div className="programs__cards">
        <Link to="/sathara-pohoya-calendar/" className="programs__card card card--interactive">
          {t('programs.satharaPohoyaCalendar')}
        </Link>
        <Link to="/buddha-puja/" className="programs__card card card--interactive">
          {t('programs.buddhaPuja')}
        </Link>
        <Link to="/katina-ceremony/" className="programs__card card card--interactive">
          {t('programs.katinaCeremony')}
        </Link>
        <Link to="/meditation-programs/" className="programs__card card card--interactive">
          {t('programs.meditationPrograms')}
        </Link>
      </div>
    </div>
  );
}
