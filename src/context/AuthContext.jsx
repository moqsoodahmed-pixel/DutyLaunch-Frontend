import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { setUnauthorizedHandler, tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);

  const clear = useCallback(() => {
    tokenStore.set(null);
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
        if (active) setUser(current);
      } catch {
        if (active) setUser(null);
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
    return next;
  }, []);

  const register = useCallback(async (payload) => {
    const next = await authService.register(payload);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      initialising,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isEmployer: user?.role === 'employer',
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
