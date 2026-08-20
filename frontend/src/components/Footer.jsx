import './Footer.css';

// Global public footer (build-spec §2.3). Mounted the same way as NavBar
// (see App.jsx's GlobalFooter) — every public page, no admin pages.
const DOMAINS = ['dhammahadaya.net', 'dhammahadaya.lk', 'dhammahadaya.org', 'dhamma-hadaya.com', 'dhamma-hadaya.org'];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__col">
          <p className="site-footer__brand">Dhammahadaya Senasanaya</p>
          <address className="site-footer__address">Watawala, Mulgama, Balangoda</address>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__heading">Contact</p>
          <a href="tel:+94702164642">Mobile: +94 70 216 4642</a>
          <a href="tel:+94453134808">Land Phone: +94 45 313 4808</a>
          <a href="mailto:dhammahadayasenasanaya@gmail.com">dhammahadayasenasanaya@gmail.com</a>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__heading">Also known as</p>
          <p className="site-footer__domains">{DOMAINS.join(' · ')}</p>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© 2017 – 2026 – DHAMMAHADAYA SENASANAYA</p>
        <p>
          Report any conversion errors to{' '}
          <a href="mailto:dhammahadayasenasanaya@gmail.com">dhammahadayasenasanaya@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}
