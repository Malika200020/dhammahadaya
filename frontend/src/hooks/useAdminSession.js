import { useCallback, useEffect, useState } from 'react';
import { getSession, logout as apiLogout } from '../api/admin';

// session: undefined while checking, null when unauthenticated, {email} when signed in.
export function useAdminSession() {
  const [session, setSession] = useState(undefined);

  const refresh = useCallback(() => {
    getSession()
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

  return { session, loading: session === undefined, refresh, logout };
}
