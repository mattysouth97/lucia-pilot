import { describe, expect, test } from 'vitest';

import {
  DISTRIBUTION_ROUND_2026_04,
  INTEGRITY_SUMMARY,
  INTEGRITY_TIMELINE_30D,
} from '@/routes/Home/analystFixtures';

describe('analystFixtures — FR-S-004 invariants', () => {
  test('distribution round: revenue × 0.41 ≈ environ_total (within ₩1)', () => {
    const r = DISTRIBUTION_ROUND_2026_04;
    expect(Math.abs(r.revenue * 0.41 - r.environ_total)).toBeLessThanOrEqual(1);
  });

  test('distribution round: sum of cohort totals === environ_total', () => {
    const r = DISTRIBUTION_ROUND_2026_04;
    const sum = r.cohorts.reduce((acc, c) => acc + c.households * c.per_household, 0);
    expect(sum).toBe(r.environ_total);
  });

  test('distribution round: cohort share percentages sum to 1.0 within 0.01%', () => {
    const r = DISTRIBUTION_ROUND_2026_04;
    const sumPct = r.cohorts.reduce((acc, c) => acc + c.share_pct, 0);
    expect(Math.abs(sumPct - 1.0)).toBeLessThanOrEqual(0.0001);
  });

  test('integrity summary exposes σ3 fields', () => {
    expect(INTEGRITY_SUMMARY.tampering_attempts).toBeGreaterThanOrEqual(0);
    expect(INTEGRITY_SUMMARY.attempts_rejected).toBe(INTEGRITY_SUMMARY.tampering_attempts);
    expect(INTEGRITY_SUMMARY.validators_active).toBe(INTEGRITY_SUMMARY.validators_total);
    expect(INTEGRITY_SUMMARY.last_verified_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('integrity timeline: 30 entries', () => {
    expect(INTEGRITY_TIMELINE_30D).toHaveLength(30);
  });
});
