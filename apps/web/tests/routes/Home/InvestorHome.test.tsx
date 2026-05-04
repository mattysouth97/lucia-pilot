// apps/web/tests/routes/Home/InvestorHome.test.tsx
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { InvestorHome } from '@/routes/Home/InvestorHome';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

describe('InvestorHome smoke', () => {
  it('renders without throwing', () => {
    render(<MemoryRouter><InvestorHome /></MemoryRouter>);
    expect(screen.queryByText(/누적 투자금/)).not.toBeNull();
  });
});
