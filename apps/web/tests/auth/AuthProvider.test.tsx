// apps/web/tests/auth/AuthProvider.test.tsx
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { AuthProvider, useAuth } from '@/auth/AuthProvider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter><AuthProvider>{children}</AuthProvider></MemoryRouter>
);

afterEach(() => {
  sessionStorage.clear();
});

describe('AuthProvider', () => {
  it('starts with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.status).toBe('idle');
  });

  it('login() sets user and persists to sessionStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => { result.current.login('u_analyst_kim'); });
    expect(result.current.user?.id).toBe('u_analyst_kim');
    expect(result.current.user?.role).toBe('analyst');
    expect(sessionStorage.getItem('lucia.auth.userId')).toBe('u_analyst_kim');
  });

  it('hydrates from sessionStorage on boot', () => {
    sessionStorage.setItem('lucia.auth.userId', 'h0001');
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user?.id).toBe('h0001');
    expect(result.current.user?.role).toBe('resident');
  });

  it('loginAs(role) picks first matching demo account', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => { result.current.loginAs('investor'); });
    expect(result.current.user?.role).toBe('investor');
  });

  it('logout() clears state and sessionStorage', () => {
    sessionStorage.setItem('lucia.auth.userId', 'u_analyst_kim');
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => { result.current.logout(); });
    expect(result.current.user).toBeNull();
    expect(sessionStorage.getItem('lucia.auth.userId')).toBeNull();
  });
});
