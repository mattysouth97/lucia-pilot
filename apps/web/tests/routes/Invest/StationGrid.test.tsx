// apps/web/tests/routes/Invest/StationGrid.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { StationGrid } from '@/routes/Invest/sections/StationGrid';

describe('StationGrid filter', () => {
  afterEach(() => cleanup());


  it('shows all 8 cards by default', () => {
    render(<StationGrid />);
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBe(8);
  });

  it('filters to maintenance only when 점검 chip clicked', () => {
    render(<StationGrid />);
    fireEvent.click(screen.getByTestId('station-filter-maintenance'));
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBe(1);
  });

  it('filters to ok only when 가동중 chip clicked', () => {
    render(<StationGrid />);
    fireEvent.click(screen.getByTestId('station-filter-ok'));
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBe(7);
  });
});
