import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { IntegrityTimelineCard } from '@/routes/Home/IntegrityTimelineCard';

afterEach(cleanup);

const FIXTURE_30 = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-04-${String(i + 1).padStart(2, '0')}`,
  verifications: 720,
  rejected_tamper: i === 14 ? 1 : 0, // single rejection on day 15
  unsettled: 0,
}));

describe('IntegrityTimelineCard', () => {
  test('renders 30 day cells', () => {
    render(<IntegrityTimelineCard data={FIXTURE_30} />);
    const cells = screen.getAllByRole('listitem');
    expect(cells).toHaveLength(30);
  });

  test('rejection day is visually distinguished (aria-label includes 거부)', () => {
    render(<IntegrityTimelineCard data={FIXTURE_30} />);
    const rejectCells = screen.getAllByRole('listitem').filter((el) =>
      (el.getAttribute('aria-label') ?? '').includes('거부'),
    );
    expect(rejectCells).toHaveLength(1);
  });

  test('renders the card heading "감사 무결성 타임라인"', () => {
    render(<IntegrityTimelineCard data={FIXTURE_30} />);
    expect(screen.getByText('감사 무결성 타임라인')).toBeInTheDocument();
  });
});
