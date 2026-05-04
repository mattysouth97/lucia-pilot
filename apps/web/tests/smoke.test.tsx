import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../src/App.js';

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
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('smoke — four routes render without crashing (FR-M-001/002/007, FR-O-003)', () => {
  it('/ renders Dashboard (FR-M-001)', () => {
    renderAt('/');
    expect(screen.getByText(/이달 정산 매출/)).toBeDefined();
  });

  it('/buildings/:id renders BuildingDetail (FR-M-002)', () => {
    renderAt('/buildings/ULJN-001');
    expect(screen.getAllByText(/발전량/).length).toBeGreaterThan(0);
  });

  it('/portal/:user_id renders ResidentPortal (FR-M-007)', () => {
    renderAt('/portal/user-42');
    expect(screen.getByText(/안녕하세요/)).toBeDefined();
  });

  it('/admin renders AdminConsole (FR-O-003)', () => {
    renderAt('/admin');
    expect(screen.getByText(/관리자 콘솔/)).toBeDefined();
  });
});
