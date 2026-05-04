// apps/web/tests/auth/RequireRole.test.tsx
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { loginAsForTest } from '../helpers/auth';

import { AuthProvider } from '@/auth/AuthProvider';
import { RequireRole } from '@/auth/RequireRole';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

function renderGated(roles: ('analyst' | 'operator' | 'resident' | 'investor')[]) {
  return render(
    <MemoryRouter initialEntries={['/gated']}>
      <AuthProvider>
        <Routes>
          <Route path="/gated" element={<RequireRole roles={roles}><div>OK</div></RequireRole>} />
          <Route path="/login" element={<div>LOGIN</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('RequireRole', () => {
  it('logged-out → redirects to /login', () => {
    renderGated(['analyst']);
    expect(screen.queryByText('LOGIN')).not.toBeNull();
  });

  it('matching role → renders children', () => {
    loginAsForTest('analyst');
    renderGated(['analyst']);
    expect(screen.queryByText('OK')).not.toBeNull();
  });

  it('non-matching role → renders ForbiddenPage', () => {
    loginAsForTest('resident');
    renderGated(['analyst']);
    expect(screen.queryByText('권한이 없습니다')).not.toBeNull();
  });
});
