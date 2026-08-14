import { Navigate, Outlet } from 'react-router-dom';
import { useAdminSession } from '../../hooks/useAdminSession';

// Client-side gate only — the server enforces the same thing independently
// on every /api/admin/* route (requireAdminAuth middleware). This just
// avoids flashing admin UI before redirecting to login.
export function RequireAdminAuth() {
  const { session, loading } = useAdminSession();
  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
