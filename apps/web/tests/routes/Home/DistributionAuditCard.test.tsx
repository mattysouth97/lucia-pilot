import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { DISTRIBUTION_ROUND_2026_04 } from '@/routes/Home/analystFixtures';
import { DistributionAuditCard } from '@/routes/Home/DistributionAuditCard';

afterEach(cleanup);

describe('DistributionAuditCard', () => {
  test('renders all 4 figures of the formula strip', () => {
    render(<DistributionAuditCard round={DISTRIBUTION_ROUND_2026_04} />);
    expect(screen.getByText(/매출/)).toBeInTheDocument();
    expect(screen.getAllByText('₩32,356,400').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('41%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('₩13,266,124').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/2,839세대/)).toBeInTheDocument();
  });

  test('cohort table shows 비중 percentage column for each cohort', () => {
    render(<DistributionAuditCard round={DISTRIBUTION_ROUND_2026_04} />);
    const lh = screen.getByRole('row', { name: /LH 매입임대/ });
    expect(within(lh).getByText(/64\./)).toBeInTheDocument();
  });

  test('cohort table sum equals environ_total', () => {
    render(<DistributionAuditCard round={DISTRIBUTION_ROUND_2026_04} />);
    const sumRow = screen.getByRole('row', { name: /합계/ });
    expect(within(sumRow).getByText('₩13,266,124')).toBeInTheDocument();
  });

  test('in-progress monthly badge renders D-N', () => {
    render(
      <DistributionAuditCard
        round={{ ...DISTRIBUTION_ROUND_2026_04, status: 'in_progress', close_d_minus: 5 }}
      />,
    );
    expect(screen.getByText(/마감 예정 D-5/)).toBeInTheDocument();
  });

  test('sealed monthly badge renders 마감 완료 with timestamp', () => {
    render(
      <DistributionAuditCard
        round={{
          ...DISTRIBUTION_ROUND_2026_04,
          status: 'sealed',
          sealed_at: '2026-05-01T02:14:00+09:00',
        }}
      />,
    );
    expect(screen.getByText(/마감 완료/)).toBeInTheDocument();
    expect(screen.getByText(/05-01 02:14/)).toBeInTheDocument();
  });
});
