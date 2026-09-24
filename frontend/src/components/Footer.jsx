import { useTranslation } from '../i18n/LanguageContext';
import './Footer.css';

// Global public footer (build-spec §2.3). Mounted the same way as NavBar
// (see App.jsx's GlobalFooter) — every public page, no admin pages.
const DOMAINS = ['dhammahadaya.net', 'dhammahadaya.lk', 'dhammahadaya.org', 'dhamma-hadaya.com', 'dhamma-hadaya.org'];

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__col">
          <p className="site-footer__brand">Dhammahadaya Senasanaya</p>
          <address className="site-footer__address">Watawala, Mulgama, Balangoda</address>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__heading">{t('footer.contactHeading')}</p>
          <a href="tel:+94702164642">{t('footer.mobile')}</a>
          <a href="tel:+94453134808">{t('footer.landPhone')}</a>
          <a href="mailto:dhammahadayasenasanaya@gmail.com">dhammahadayasenasanaya@gmail.com</a>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__heading">{t('footer.alsoKnownAs')}</p>
          <p className="site-footer__domains">{DOMAINS.join(' · ')}</p>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>{t('footer.copyright')}</p>
        <p>
          {t('footer.reportErrors')}{' '}
          <a href="mailto:dhammahadayasenasanaya@gmail.com">dhammahadayasenasanaya@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}
