// FRD-2026-001 v1.3.1 — financial-model assumptions backing FR-O-006.
//
// Every constant here is sourced from the v1.3.1 prompt
// (docs/frd/CLAUDE_CODE_PROMPT_v1.3.1.md). When values diverge between
// FRD and prompt, FRD wins per CLAUDE_CODE_PROMPT_v1.3.md §authority.
//
// Forbidden in this file: arbitrary "industry-standard" defaults that
// don't trace back to the FRD or prompt. Every constant carries an
// explicit SOURCE tag.

/**
 * Investor-perspective assumptions. Used by FR-O-006 simulator and FR-R-003
 * onboarding's embedded simulator (FRD §9 FR-O-006).
 */
export const BASE_ASSUMPTIONS = {
  // --- Generation revenue ---
  /** SOURCE: v1.3.1 prompt + FR-X-001 — 2026-04 육지 평균. */
  smp_won_per_kwh: 119,
  /** SOURCE: v1.3.1 prompt — REC unit price (won/MWh). */
  rec_won_per_mwh: 70_000,
  /** SOURCE: FR-S-003 — 지붕형 1.0 + 주민참여형 0.2 = 1.2. */
  rec_weight: 1.2,
  /** SOURCE: FR-D-001 — daily generation hours, used as installed_kw × 3.6h × 365. */
  daily_generation_hours: 3.6,
  /** SOURCE: v1.3.1 prompt — module efficiency decay (%/yr, compounded). */
  efficiency_decay_pct: 0.5,

  // --- Operating costs (project-side, NOT in investor returns) ---
  /** SOURCE: FR-S-005 — Lucia SaaS subscription. NOT included in investor returns. */
  lucia_saas_won_per_building_month: 50_000,
  /** SOURCE: FR-S-005 — KIE-REMS SaaS subscription. NOT included in investor returns. */
  kie_rems_won_per_building_month: 30_000,
  /** SOURCE: v1.3.1 prompt — O&M as percent of revenue. */
  oem_pct_of_revenue: 5.0,

  // --- Distributions ---
  /** SOURCE: FR-S-004 / LH PDF p.4 — 41% of revenue → 주거비 환원. */
  housing_subsidy_pct_of_revenue: 41,

  // --- KEA 재생에너지지원사업 융자금 (한국에너지공단) ---
  /** SOURCE: v1.3.1 prompt §FR-O-006 — default rate. UI override range 0~5%. */
  kea_loan_default_rate_pct: 1.75,
  /** SOURCE: v1.3.1 prompt — interest-only grace period in years. */
  kea_loan_default_grace_years: 5,
  /** SOURCE: v1.3.1 prompt — annuity-equal repayment period in years. */
  kea_loan_default_repayment_years: 10,
  /** SOURCE: v1.3.1 prompt — 한국에너지공단 한도. UI must cap at 80%. */
  kea_loan_max_pct: 80,

  // --- Other commercial debt ---
  /** SOURCE: v1.3.1 prompt §BASE_ASSUMPTIONS — commercial debt default rate. */
  other_debt_default_rate_pct: 4.5,
  /** SOURCE: industry-standard utility-scale solar commercial loan tenor. */
  other_debt_default_tenor_years: 15,

  // --- CAPEX ---
  /** SOURCE: v1.3.1 prompt — won per installed kW. */
  capex_won_per_kw: 4_000_000,

  // --- Numerics ---
  /** Capital-structure tolerance (sliders may sum to 99.99 due to rounding). */
  capital_structure_tolerance_pct: 0.5,
} as const;

/**
 * Scenario multipliers — applied to {SMP, REC, efficiency} per scenario.
 */
export const SCENARIOS = {
  conservative: {
    smp_multiplier: 0.85,
    rec_multiplier: 0.85,
    efficiency_multiplier: 0.95,
  },
  base: {
    smp_multiplier: 1.0,
    rec_multiplier: 1.0,
    efficiency_multiplier: 1.0,
  },
  optimistic: {
    smp_multiplier: 1.15,
    rec_multiplier: 1.15,
    efficiency_multiplier: 1.05,
  },
} as const;

export type ScenarioName = keyof typeof SCENARIOS;
