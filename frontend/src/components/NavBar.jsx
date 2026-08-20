import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../config/navItems';
import { listPohoyaCalendarYears } from '../api/pohoyaCalendar';
import './NavBar.css';

// Public NavBar (build-spec §2.2) — global hierarchical menu, up to 3
// levels deep. Every link comes from NAV_ITEMS, which is checked against
// the real routes in App.jsx, so nothing here can point at a dead route.
// The one dynamic piece is the Sathara Pohoya Calendar year list (admins
// add years over time), fetched here the same way the calendar's own
// index page does.
export function NavBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openTop, setOpenTop] = useState(null);
  const [openNested, setOpenNested] = useState(null);
  const [pohoyaYears, setPohoyaYears] = useState([]);
  const navRef = useRef(null);

  useEffect(() => {
    listPohoyaCalendarYears()
      .then((d) => setPohoyaYears(d.years || []))
      .catch(() => setPohoyaYears([]));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenTop(null);
    setOpenNested(null);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenTop(null);
        setOpenNested(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function resolveChildren(item) {
    if (!item.children) return null;
    return item.children.map((child) =>
      child.dynamicYears
        ? { ...child, children: pohoyaYears.map((y) => ({ label: String(y.year), to: `/sathara-pohoya-calendar-${y.year}/` })) }
        : child
    );
  }

  function toggleTop(label) {
    setOpenTop((cur) => (cur === label ? null : label));
    setOpenNested(null);
  }

  function toggleNested(label) {
    setOpenNested((cur) => (cur === label ? null : label));
  }

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar__bar">
        <NavLink to="/" end className="navbar__brand">
          Dhammahadaya Senasanaya
        </NavLink>
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

      <ul className={`navbar__list${mobileOpen ? ' navbar__list--open' : ''}`}>
        {NAV_ITEMS.map((item) => {
          const children = resolveChildren(item);
          const isTopOpen = openTop === item.label;
          return (
            <li key={item.label} className="navbar__item">
              <div className="navbar__item-row">
                {item.to ? (
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <span
                    className="navbar__link navbar__link--label-only"
                    onClick={() => toggleTop(item.label)}
                  >
                    {item.label}
                  </span>
                )}
                {children ? (
                  <button
                    type="button"
                    className={`navbar__caret${isTopOpen ? ' navbar__caret--open' : ''}`}
                    aria-label={`Toggle ${item.label} submenu`}
                    aria-expanded={isTopOpen}
                    onClick={() => toggleTop(item.label)}
                  >
                    <span aria-hidden="true">▾</span>
                  </button>
                ) : null}
              </div>

              {children ? (
                <ul className={`navbar__dropdown${isTopOpen ? ' navbar__dropdown--open' : ''}`}>
                  {children.map((child) => {
                    const hasGrandchildren = child.children && child.children.length > 0;
                    const isNestedOpen = openNested === child.label;
                    return (
                      <li key={child.label} className="navbar__dropdown-item">
                        <div className="navbar__item-row">
                          <NavLink
                            to={child.to}
                            className={({ isActive }) => `navbar__dropdown-link${isActive ? ' navbar__dropdown-link--active' : ''}`}
                          >
                            {child.label}
                          </NavLink>
                          {hasGrandchildren ? (
                            <button
                              type="button"
                              className={`navbar__caret${isNestedOpen ? ' navbar__caret--open' : ''}`}
                              aria-label={`Toggle ${child.label} submenu`}
                              aria-expanded={isNestedOpen}
                              onClick={() => toggleNested(child.label)}
                            >
                              <span aria-hidden="true">▾</span>
                            </button>
                          ) : null}
                        </div>
                        {hasGrandchildren ? (
                          <ul className={`navbar__subdropdown${isNestedOpen ? ' navbar__subdropdown--open' : ''}`}>
                            {child.children.map((grand) => (
                              <li key={grand.label}>
                                <NavLink
                                  to={grand.to}
                                  className={({ isActive }) => `navbar__subdropdown-link${isActive ? ' navbar__subdropdown-link--active' : ''}`}
                                >
                                  {grand.label}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
