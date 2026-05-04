// apps/web/tests/routes/Invest/Disclosure.test.tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Disclosure } from '@/routes/Invest/sections/Disclosure';

describe('Disclosure FAQ a11y', () => {
  it('renders all FAQ items as <details>/<summary> structure', () => {
    const { container } = render(<Disclosure />);
    const detailsEls = container.querySelectorAll('details');
    expect(detailsEls.length).toBeGreaterThanOrEqual(5);
    const summaryEls = container.querySelectorAll('details > summary');
    expect(summaryEls.length).toBe(detailsEls.length);
    const summaryText = Array.from(summaryEls).map(el => el.textContent ?? '').join('|');
    expect(summaryText).toMatch(/투자금은 어떻게 회수되나요/);
    expect(summaryText).toMatch(/Hyperledger/);
    expect(summaryText).toMatch(/41% 환원/);
    expect(summaryText).toMatch(/최소 투자 금액/);
    expect(summaryText).toMatch(/세금/);
  });
});
