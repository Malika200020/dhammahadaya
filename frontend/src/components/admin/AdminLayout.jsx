import { Outlet, NavLink } from 'react-router-dom';
import { useAdminSession } from '../../hooks/useAdminSession';
import { ENTRY_TYPES } from '../../config/entryTypes';
import { PDF_BOOK_CATEGORIES } from '../../config/pdfBookCategories';
import './AdminLayout.css';

function navLinkClass({ isActive }) {
  return `admin-layout__link${isActive ? ' admin-layout__link--active' : ''}`;
}

export function AdminLayout() {
  const { session, logout } = useAdminSession();

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <h2>Admin</h2>
        <nav className="admin-layout__nav">
          {ENTRY_TYPES.map((t) => (
            <NavLink key={t.type} to={`/admin/entries/${t.type}`} className={navLinkClass}>
              {t.label}
            </NavLink>
          ))}
          <hr />
          {PDF_BOOK_CATEGORIES.map((c) => (
            <NavLink key={c.slug} to={`/admin/pdf-books/${c.slug}`} className={navLinkClass}>
              {c.titleEn}
            </NavLink>
          ))}
          <NavLink to="/admin/tripitaka-catalogue" className={navLinkClass}>
            Tripitaka Catalogue
          </NavLink>
          <hr />
          <NavLink to="/admin/video-series" className={navLinkClass}>
            Dhamma Sermon Series
          </NavLink>
          <NavLink to="/admin/videos/buddha-puja" className={navLinkClass}>
            Buddha Puja Videos
          </NavLink>
          <NavLink to="/admin/galleries/buddha-puja" className={navLinkClass}>
            Buddha Puja Gallery
          </NavLink>
          <hr />
          <NavLink to="/admin/sponsorship" className={navLinkClass}>
            Sponsorship Bookings
          </NavLink>
          <NavLink to="/admin/whatsapp" className={navLinkClass}>
            WhatsApp
          </NavLink>
          <hr />
          <NavLink to="/admin/meditation-applications" className={navLinkClass}>
            Meditation Applications
          </NavLink>
          <NavLink to="/admin/katina" className={navLinkClass}>
            Katina Ceremony Years
          </NavLink>
          <NavLink to="/admin/pohoya-calendar" className={navLinkClass}>
            Pohoya Calendars
          </NavLink>
          <hr />
          <NavLink to="/admin/galleries/about" className={navLinkClass}>
            About Gallery
          </NavLink>
          <NavLink to="/admin/special-thanks" className={navLinkClass}>
            Special Thanks
          </NavLink>
          <NavLink to="/admin/honorable-tribute" className={navLinkClass}>
            Honorable Tribute
          </NavLink>
          <NavLink to="/admin/siri-sugatha-sasana-bandumathi" className={navLinkClass}>
            Siri Sugatha Sasana Bandumathi
          </NavLink>
          <NavLink to="/admin/inquiries" className={navLinkClass}>
            Inquiries
          </NavLink>
          <NavLink to="/admin/newsletter-subscribers" className={navLinkClass}>
            Newsletter Subscribers
          </NavLink>
        </nav>
        <div className="admin-layout__account">
          <span className="admin-layout__email">{session?.email}</span>
          <button type="button" className="btn btn--primary btn--sm" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="admin-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
