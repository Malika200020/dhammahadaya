import { Outlet, Link } from 'react-router-dom';
import { useAdminSession } from '../../hooks/useAdminSession';
import { ENTRY_TYPES } from '../../config/entryTypes';
import './AdminLayout.css';

export function AdminLayout() {
  const { session, logout } = useAdminSession();

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <h2>Admin</h2>
        <nav className="admin-layout__nav">
          {ENTRY_TYPES.map((t) => (
            <Link key={t.type} to={`/admin/entries/${t.type}`}>
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="admin-layout__account">
          <span>{session?.email}</span>
          <button type="button" onClick={logout}>
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
