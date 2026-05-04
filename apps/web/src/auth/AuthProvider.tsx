// apps/web/src/auth/AuthProvider.tsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { findAccount, firstAccountForRole } from './demoAccounts';
import type { AuthContextValue, AuthState, AuthUser, Role } from './types';

const STORAGE_KEY = 'lucia.auth.userId';

const Ctx = createContext<AuthContextValue | null>(null);

function readPersistedUser(): AuthUser | null {
  try {
    const id = sessionStorage.getItem(STORAGE_KEY);
    if (!id) return null;
    return findAccount(id) ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(() => {
    const user = readPersistedUser();
    return { user, status: user ? 'authenticated' : 'idle' };
  });

  const login = useCallback((userId: string) => {
    const account = findAccount(userId);
    if (!account) {
      throw new Error(`Unknown demo account: ${userId}`);
    }
    sessionStorage.setItem(STORAGE_KEY, userId);
    setState({ user: account, status: 'authenticated' });
  }, []);

  const loginAs = useCallback((role: Role) => {
    const account = firstAccountForRole(role);
    if (!account) {
      throw new Error(`No demo account for role: ${role}`);
    }
    login(account.id);
  }, [login]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, status: 'logging-out' }));
    sessionStorage.removeItem(STORAGE_KEY);
    setState({ user: null, status: 'idle' });
    navigate('/login');
  }, [navigate]);

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    login,
    loginAs,
    logout,
  }), [state, login, loginAs, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(Ctx);
  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return value;
}
