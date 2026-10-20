import { Navigate, Outlet } from 'react-router-dom';
import { useAdminSession } from '../../hooks/useAdminSession';

// Client-side gate only — the server independently enforces this on every
// super-admin-only /api/admin/* route via the requireSuperAdmin middleware
// (which re-checks the role from the database on every request, not a
// cached session value). This just keeps a normal admin from landing on a
// page that would only error out on them — nested inside RequireAdminAuth's
// route tree, so session is already guaranteed to exist here.
export function RequireSuperAdmin() {
  const { session } = useAdminSession();
  if (session?.role !== 'super_admin') return <Navigate to="/admin/entries/newsletter" replace />;
  return <Outlet />;
}
