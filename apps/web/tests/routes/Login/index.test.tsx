// apps/web/tests/routes/Login/index.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { AuthProvider } from '@/auth/AuthProvider';
import { LoginPage } from '@/routes/Login';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

const wrapper = (children: ReactNode) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe('LoginPage', () => {
  it('renders all 4 role tabs', () => {
    render(wrapper(<LoginPage />));
    expect(screen.queryByTestId('login-tab-analyst')).not.toBeNull();
    expect(screen.queryByTestId('login-tab-operator')).not.toBeNull();
    expect(screen.queryByTestId('login-tab-resident')).not.toBeNull();
    expect(screen.queryByTestId('login-tab-investor')).not.toBeNull();
  });

  it('switching to resident tab shows resident accounts', () => {
    render(wrapper(<LoginPage />));
    fireEvent.click(screen.getByTestId('login-tab-resident'));
    expect(screen.queryByTestId('login-account-h0001')).not.toBeNull();
    expect(screen.queryByTestId('login-account-k0014')).not.toBeNull();
    expect(screen.queryByTestId('login-account-e0042')).not.toBeNull();
  });

  it('clicking an account triggers login (sessionStorage updated)', () => {
    render(wrapper(<LoginPage />));
    fireEvent.click(screen.getByTestId('login-account-u_analyst_kim'));
    expect(sessionStorage.getItem('lucia.auth.userId')).toBe('u_analyst_kim');
  });
});
