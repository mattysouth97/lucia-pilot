// apps/web/tests/routes/Invest/index.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { Landing } from '@/routes/Invest';

vi.mock('@/lib/useLuciaStream', () => ({
  useLuciaStream: () => ({ status: 'disconnected', txs: [] }),
}));

describe('/invest Landing', () => {
  it('renders the hero title', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    const heading = screen.queryByRole('heading', { level: 1, name: /햇빛으로 받는, 투명한 정기 수익/ });
    expect(heading).not.toBeNull();
  });
});
