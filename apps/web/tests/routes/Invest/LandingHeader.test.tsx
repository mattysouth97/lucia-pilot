// apps/web/tests/routes/Invest/LandingHeader.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LandingHeader } from '@/routes/Invest/LandingHeader';

describe('LandingHeader mobile drawer', () => {
  it('toggles aria-expanded on hamburger click', () => {
    render(<LandingHeader />);
    const button = screen.getByTestId('landing-header-menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
