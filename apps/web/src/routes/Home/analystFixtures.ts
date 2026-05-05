// apps/web/src/routes/Home/analystFixtures.ts
//
// Single source of truth for AnalystHome data. Replaces the scattered hardcodes
// in EnvironmentalImpactCard / Dashboard HeroBand / AuditHeroStrip.
// Cohort math satisfies FR-S-004 invariant: sum(cohort_total) === revenue × 0.41.
//
// Phase 2 will replace these with TanStack Query calls against engine endpoints
// /audit/integrity-summary, /audit/integrity-timeline, /audit/distribution-round.

export interface IntegritySummary {
  readonly tampering_attempts: number;
  readonly attempts_rejected: number;
  readonly block_height: number;
  readonly validators_active: number;
  readonly validators_total: number;
  readonly unsettled_count: number;
  readonly pending_anomalies: number;
  readonly last_verified_at: string; // ISO 8601
}

export const INTEGRITY_SUMMARY: IntegritySummary = {
  tampering_attempts: 0,
  attempts_rejected: 0,
  block_height: 184729,
  validators_active: 4,
  validators_total: 4,
  unsettled_count: 0,
  pending_anomalies: 0,
  last_verified_at: '2026-04-30T13:24:18+09:00',
} as const;

export interface IntegrityTimelinePoint {
  readonly date: string;       // YYYY-MM-DD
  readonly verifications: number;
  readonly rejected_tamper: number;
  readonly unsettled: number;
}

// 30-day window ending 2026-04-30 (matches MEMORY.md currentDate context).
// Verifications ~720/day (block-time ~2s, ~720 blocks/24h after consensus).
// All `rejected_tamper === 0` for steady-state demo; demo storyboard step 5
// causes a single `1` to appear on the day of the demo run.
export const INTEGRITY_TIMELINE_30D: ReadonlyArray<IntegrityTimelinePoint> = Array.from(
  { length: 30 },
  (_, i): IntegrityTimelinePoint => {
    const day = new Date('2026-04-30T00:00:00+09:00');
    day.setDate(day.getDate() - (29 - i));
    const dateStr = day.toISOString().slice(0, 10);
    return {
      date: dateStr,
      verifications: 700 + ((i * 17) % 60),
      rejected_tamper: 0,
      unsettled: 0,
    };
  },
);

export interface CohortAllocation {
  readonly code: 'lh' | 'gukmin' | 'sowoe';
  readonly label: string;
  readonly share_pct: number;     // 0..1
  readonly households: number;
  readonly per_household: number; // KRW (may be float for the residual cohort to preserve invariant)
}

export type DistributionRoundStatus =
  | 'in_progress'
  | 'closing_soon'
  | 'sealing'
  | 'sealed';

export interface DistributionRound {
  readonly period: string;         // YYYY-MM
  readonly status: DistributionRoundStatus;
  readonly close_d_minus?: number;
  readonly sealed_at?: string;
  readonly revenue: number;
  readonly environ_total: number;
  readonly cohorts: ReadonlyArray<CohortAllocation>;
}

// FR-S-004 cohort math (re-derived to make sum_cohort_total === environ_total exactly):
//   revenue        = ₩32,356,400
//   environ_total  = revenue × 0.41 = ₩13,266,124 exactly (32_356_400 × 0.41)
//   LH 매입임대    = 1643 hh × ₩5,182 = ₩8,514,026
//   국민임대        = 280  hh × ₩5,164 = ₩1,445,920
//   에너지소외      = remainder = environ_total − LH − 국민 = ₩3,306,178
//                    per_household = 3,306,178 / 916 = ₩3,609.36 (float for exact sum)

const REVENUE = 32_356_400;
const ENVIRON_TOTAL = 13_266_124;

const LH_HOUSEHOLDS = 1643;
const LH_PER_HH = 5182;
const LH_TOTAL = LH_HOUSEHOLDS * LH_PER_HH; // 8_514_026

const GUKMIN_HOUSEHOLDS = 280;
const GUKMIN_PER_HH = 5164;
const GUKMIN_TOTAL = GUKMIN_HOUSEHOLDS * GUKMIN_PER_HH; // 1_445_920

const SOWOE_HOUSEHOLDS = 916;
const SOWOE_TOTAL = ENVIRON_TOTAL - LH_TOTAL - GUKMIN_TOTAL; // 3_306_178
const SOWOE_PER_HH = SOWOE_TOTAL / SOWOE_HOUSEHOLDS;          // ~3,609.36 (float — preserves exact sum)

export const DISTRIBUTION_ROUND_2026_04: DistributionRound = {
  period: '2026-04',
  status: 'in_progress',
  close_d_minus: 0,
  revenue: REVENUE,
  environ_total: ENVIRON_TOTAL,
  cohorts: [
    {
      code: 'lh',
      label: 'LH 매입임대',
      share_pct: LH_TOTAL / ENVIRON_TOTAL,
      households: LH_HOUSEHOLDS,
      per_household: LH_PER_HH,
    },
    {
      code: 'gukmin',
      label: '국민임대',
      share_pct: GUKMIN_TOTAL / ENVIRON_TOTAL,
      households: GUKMIN_HOUSEHOLDS,
      per_household: GUKMIN_PER_HH,
    },
    {
      code: 'sowoe',
      label: '에너지소외',
      share_pct: SOWOE_TOTAL / ENVIRON_TOTAL,
      households: SOWOE_HOUSEHOLDS,
      per_household: SOWOE_PER_HH,
    },
  ],
} as const;
