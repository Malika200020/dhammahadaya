import { useContext } from 'react';
import { AdminSessionContext } from '../components/admin/AdminSessionProvider';

// session: undefined while checking, null when unauthenticated, {email} when signed in.
// Reads the shared state from AdminSessionProvider (mounted once around
// the admin route tree in App.jsx) so every consumer sees the same session.
export function useAdminSession() {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error('useAdminSession must be used within an AdminSessionProvider');
  return ctx;
}
