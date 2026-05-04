import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, afterEach } from 'vitest';

import App from '../src/App.js';
import { AuthProvider } from '../src/auth/AuthProvider';
import { loginAsForTest, logoutForTest } from './helpers/auth';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderAt(initialPath: string) {
  const qc = makeQueryClient();
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('smoke — four routes render without crashing (FR-M-001/002/007, FR-O-003)', () => {
  afterEach(() => {
    logoutForTest();
    sessionStorage.clear();
  });

  it('/ renders Dashboard (FR-M-001)', async () => {
    loginAsForTest('analyst');
    renderAt('/');
    expect(await screen.findByText(/이달 정산 매출/)).toBeDefined();
  });

  it('/buildings/:id renders BuildingDetail (FR-M-002)', async () => {
    loginAsForTest('analyst');
    renderAt('/buildings/ULJN-001');
    const matches = await screen.findAllByText(/발전량/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('/portal/:user_id renders ResidentPortal (FR-M-007)', async () => {
    // Pre-login as the matching resident; RequireRole gate runs synchronously and
    // would redirect before the F1 in-component escape hatch could fire here.
    // The F1 escape hatch covers the FR-M-007 deep-link demo path (live BrowserRouter).
    loginAsForTest('resident');
    renderAt('/portal/h0001');
    expect(await screen.findByText(/안녕하세요/)).toBeDefined();
  });

  it('/admin renders AdminConsole (FR-O-003)', async () => {
    loginAsForTest('analyst');
    renderAt('/admin');
    expect(await screen.findByText(/관리자 콘솔/)).toBeDefined();
  });
});
