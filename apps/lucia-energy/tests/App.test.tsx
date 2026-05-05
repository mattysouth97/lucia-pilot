import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import App from '../src/App';

describe('App', () => {
  it('renders the LuciaEnergy brand in the topbar', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Lucia · Energy')).toBeInTheDocument();
  });

  it('renders the cross-link tabs (LH 햇빛발전소 + LuciaEnergy)', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    // The string "LuciaEnergy" appears in both the topbar tab AND the comparison
    // matrix header column, so we disambiguate by ARIA role.
    expect(screen.getByRole('tab', { name: 'LH 햇빛발전소' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'LuciaEnergy' })).toBeInTheDocument();
  });
});
