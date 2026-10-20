import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminSession } from '../../hooks/useAdminSession';

// Client-side gate only — the server enforces the same thing independently
// on every /api/admin/* route (requireAdminAuth + blockUntilPasswordChanged
// middleware). This just avoids flashing admin UI before redirecting.
//
// A normal admin who still has session.mustChangePassword set (first login,
// or after a super admin reset their password) gets redirected to the
// forced change-password page regardless of where they were headed — except
// to that page itself, which would otherwise redirect-loop.
export function RequireAdminAuth() {
  const { session, loading } = useAdminSession();
  const location = useLocation();
  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (session.mustChangePassword && location.pathname !== '/admin/change-password') {
    return <Navigate to="/admin/change-password" replace />;
  }
  return <Outlet />;
}
