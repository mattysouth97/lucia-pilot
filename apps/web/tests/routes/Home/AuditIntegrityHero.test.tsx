import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { AuditIntegrityHero } from '@/routes/Home/AuditIntegrityHero';

const FRESH_DATA = {
  tampering_attempts: 0,
  attempts_rejected: 0,
  block_height: 184729,
  validators_active: 4,
  validators_total: 4,
  unsettled_count: 0,
  pending_anomalies: 0,
  last_verified_at: '2026-04-30T13:24:18+09:00',
} as const;

afterEach(cleanup);

describe('AuditIntegrityHero', () => {
  test('renders the two-line greeting overline with honorific', () => {
    render(
      <AuditIntegrityHero
        greeting={{ displayName: '김지호', honorific: '처장' }}
        period="2026-04"
        state="fresh"
        data={FRESH_DATA}
      />,
    );
    expect(screen.getByText(/안녕하세요, 김지호 처장님/)).toBeInTheDocument();
    expect(screen.getByText(/2026\.04 감사 무결성 라운드/)).toBeInTheDocument();
  });

  test('fresh state renders monumental 0 with σ3 framing', () => {
    render(
      <AuditIntegrityHero
        greeting={{ displayName: '김지호', honorific: '처장' }}
        period="2026-04"
        state="fresh"
        data={FRESH_DATA}
      />,
    );
    expect(screen.getByLabelText(/이번 달 변조 시도/)).toHaveTextContent('0');
    expect(screen.getByText(/✓ 모두 거부/)).toBeInTheDocument();
  });

  test('loading state renders em-dash placeholder, no monumental 0', () => {
    render(
      <AuditIntegrityHero
        greeting={{ displayName: '김지호', honorific: '처장' }}
        period="2026-04"
        state="loading"
      />,
    );
    expect(screen.getByLabelText(/이번 달 변조 시도/)).toHaveTextContent('—');
  });

  test('unreachable state replaces hero with refusal block', () => {
    render(
      <AuditIntegrityHero
        greeting={{ displayName: '김지호', honorific: '처장' }}
        period="2026-04"
        state="unreachable"
      />,
    );
    expect(screen.getByText(/감사 엔진 연결 실패/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/이번 달 변조 시도/)).toBeNull();
  });

  test('audit-report CTA renders with chevron label `감사 보고서 →`', () => {
    render(
      <AuditIntegrityHero
        greeting={{ displayName: '김지호', honorific: '처장' }}
        period="2026-04"
        state="fresh"
        data={FRESH_DATA}
      />,
    );
    const cta = screen.getByRole('button', { name: /감사 보고서/ });
    expect(cta.textContent).toMatch(/→/);
  });
});
