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

describe('smoke — four routes render their placeholder text', () => {
  it('/ renders Dashboard placeholder (FR-M-001)', () => {
    renderAt('/');
    expect(screen.getByText(/FR-M-001 placeholder/i)).toBeDefined();
  });

  it('/buildings/:id renders BuildingDetail placeholder (FR-M-002)', () => {
    renderAt('/buildings/ULJN-001');
    expect(screen.getByText(/FR-M-002 placeholder/i)).toBeDefined();
  });

  it('/portal/:user_id renders ResidentPortal placeholder (FR-M-007)', () => {
    renderAt('/portal/user-42');
    expect(screen.getByText(/FR-M-007 placeholder/i)).toBeDefined();
  });

  it('/admin renders AdminConsole placeholder (FR-O-003)', () => {
    renderAt('/admin');
    expect(screen.getByText(/FR-O-003 placeholder/i)).toBeDefined();
  });
});
