// apps/web/tests/auth/RoleRedirect.test.tsx
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loginAsForTest } from '../helpers/auth';

import { AuthProvider } from '@/auth/AuthProvider';
import { RoleRedirect } from '@/auth/RoleRedirect';

vi.mock('@/lib/useLuciaStream', () => ({ useLuciaStream: () => undefined }));

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<div>LOGIN</div>} />
          <Route path="/portal/:user_id" element={<div>PORTAL</div>} />
          <Route path="/invest/dashboard" element={<div>INVESTOR_DASH</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('RoleRedirect', () => {
  it('logged-out → redirects to /login', () => {
    renderAt('/');
    expect(screen.queryByText('LOGIN')).not.toBeNull();
  });

  it('analyst → renders something at / (not redirected)', () => {
    loginAsForTest('analyst');
    renderAt('/');
    // AnalystHome (which renders Dashboard) is heavy; just confirm we did NOT redirect
    expect(screen.queryByText('LOGIN')).toBeNull();
    expect(screen.queryByText('PORTAL')).toBeNull();
    expect(screen.queryByText('INVESTOR_DASH')).toBeNull();
  });

  it('resident → redirects to /portal/{userId}', () => {
    loginAsForTest('resident');
    renderAt('/');
    expect(screen.queryByText('PORTAL')).not.toBeNull();
  });

  it('investor → redirects to /invest/dashboard', () => {
    loginAsForTest('investor');
    renderAt('/');
    expect(screen.queryByText('INVESTOR_DASH')).not.toBeNull();
  });
});
