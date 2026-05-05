import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { ActivityZone } from '@/routes/Home/ActivityZone';

afterEach(cleanup);

describe('ActivityZone', () => {
  test('honors initialFilters prop on first render', () => {
    render(<ActivityZone initialFilters={['주거비 환원', '가상공유거래']} />);
    const chip = screen.getByRole('button', { name: '주거비 환원' });
    expect(chip.className).toMatch(/is-active/);
  });

  test('이상만 보기 toggle filters to 거부됨 + 검증중 only', () => {
    render(<ActivityZone initialFilters={['전체 정산']} />);
    const toggle = screen.getByRole('button', { name: /이상만 보기/ });
    expect(screen.queryAllByText('완료').length).toBeGreaterThan(0);
    fireEvent.click(toggle);
    expect(screen.queryByText('완료')).toBeNull();
  });

  test('이상만 보기 toggle label includes match count', () => {
    render(<ActivityZone initialFilters={['전체 정산']} />);
    const toggle = screen.getByRole('button', { name: /이상만 보기/ });
    expect(toggle.textContent).toMatch(/이상만 보기 \(2\)/);
  });

  test('renders rightRail prop in side area', () => {
    render(
      <ActivityZone
        initialFilters={['전체 정산']}
        rightRail={<div data-testid="rail-marker">RAIL</div>}
      />,
    );
    expect(screen.getByTestId('rail-marker')).toBeInTheDocument();
  });
});
