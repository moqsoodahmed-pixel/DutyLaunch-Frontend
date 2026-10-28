import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { setUnauthorizedHandler, tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = sessionStorage.getItem('dl.user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [initialising, setInitialising] = useState(true);

  const clear = useCallback(() => {
    tokenStore.set(null);
    try {
      sessionStorage.removeItem('dl.user');
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clear);
  }, [clear]);

  useEffect(() => {
    let active = true;
    (async () => {
      // A cookie session may exist even without a stored bearer token.
      try {
        const current = await authService.me();
        if (active) {
          setUser(current);
          try {
            if (current) sessionStorage.setItem('dl.user', JSON.stringify(current));
            else sessionStorage.removeItem('dl.user');
          } catch {
            /* ignore */
          }
        }
      } catch {
        if (active) {
          setUser(null);
          try {
            sessionStorage.removeItem('dl.user');
          } catch {
            /* ignore */
          }
        }
      } finally {
        if (active) setInitialising(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const next = await authService.login(payload);
    setUser(next);
    try {
      if (next) sessionStorage.setItem('dl.user', JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const register = useCallback(async (payload) => {
    const next = await authService.register(payload);
    setUser(next);
    try {
      if (next) sessionStorage.setItem('dl.user', JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clear();
  }, [clear]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      initialising,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isEmployer: user?.role === 'employer',
      isInstitute: user?.role === 'institute' || user?.role === 'partner',
      isPartner: user?.role === 'institute' || user?.role === 'partner',
      login,
      register,
      logout,
    }),
    [user, initialising, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
