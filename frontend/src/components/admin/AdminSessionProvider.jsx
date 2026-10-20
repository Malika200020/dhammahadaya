import { createContext, useCallback, useEffect, useState } from 'react';
import { getSession, logout as apiLogout } from '../../api/admin';

export const AdminSessionContext = createContext(undefined);

// Single shared session state for the whole admin area. Bug this fixes:
// RequireAdminAuth (the route guard) and AdminLayout (the sidebar, which
// shows the email and triggers logout) each used to call a plain
// useAdminSession() hook independently, so they held two disconnected
// copies of `session` — logging out updated AdminLayout's copy but not
// RequireAdminAuth's, so the guard never noticed and never redirected to
// /admin/login. One shared provider means both read/write the same state.
export function AdminSessionProvider({ children }) {
  const [session, setSession] = useState(undefined);

  // Returns the promise so callers that need the *updated* session before
  // acting on it (e.g. AdminChangePasswordPage navigating away right after
  // clearing mustChangePassword) can await it, instead of navigating while
  // the fetch is still in flight and racing RequireAdminAuth's redirect
  // check against a stale cached session value.
  const refresh = useCallback(() => {
    return getSession()
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiLogout();
    setSession(null);
  }, []);

  return (
    <AdminSessionContext.Provider value={{ session, loading: session === undefined, refresh, logout }}>
      {children}
    </AdminSessionContext.Provider>
  );
}
