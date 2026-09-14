import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../config/navItems';
import { ThemeToggle } from './ThemeToggle';
import './NavBar.css';

// Public NavBar (build-spec §2.2) — a flat global menu, every link straight
// to its own landing page. Dropdown submenus were removed site-wide
// (client request, 2026-09): each landing page now carries its own former
// dropdown entries as on-page clickable cards/links instead (see
// navItems.js for the full list of where each one moved to).
export function NavBar({ theme, toggleTheme }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar__brand-row">
        <span className="navbar__brand-spacer" aria-hidden="true" />
        <Link to="/" className="navbar__logo-link" aria-label="Dhammahadaya Senasanaya — home">
          <img src="/images/Damma-Senasanaya-Logo.png" alt="Dhammahadaya Senasanaya" className="navbar__logo" />
        </Link>
        <div className="navbar__brand-actions">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            type="button"
            className="navbar__hamburger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <ul className={`navbar__list${mobileOpen ? ' navbar__list--open' : ''}`}>
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className="navbar__item">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
              onClick={closeMobile}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
