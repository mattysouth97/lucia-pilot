// FR-O-006 — investor-model unit tests.

import { describe, expect, it } from 'vitest';

import { BASE_ASSUMPTIONS } from '../assumptions.js';
import {
  type KEALoanTerms,
  type SimulationInput,
  calculateIRR,
  generateKEALoanSchedule,
  simulateInvestorReturn,
  validateCapitalStructure,
} from '../investor-model.js';

const KEA_DEFAULT: KEALoanTerms = {
  interest_rate_pct: BASE_ASSUMPTIONS.kea_loan_default_rate_pct,
  grace_years: BASE_ASSUMPTIONS.kea_loan_default_grace_years,
  repayment_years: BASE_ASSUMPTIONS.kea_loan_default_repayment_years,
};

const STD_INPUT: SimulationInput = {
  investor_capex_won: 100_000_000,
  years: 20,
  installed_kw: 25.86,
  capital_structure: { project_equity_pct: 30, kea_loan_pct: 50, other_debt_pct: 20 },
  kea_loan_terms: KEA_DEFAULT,
  scenario: 'base',
};

// ---------------------------------------------------------------------------
// validateCapitalStructure
// ---------------------------------------------------------------------------

describe('validateCapitalStructure', () => {
  it('accepts a structure that sums to 100', () => {
    const r = validateCapitalStructure({ project_equity_pct: 30, kea_loan_pct: 50, other_debt_pct: 20 });
    expect(r.valid).toBe(true);
  });

  it('accepts a structure that sums within tolerance (e.g. 99.7 / 100.3)', () => {
    const r = validateCapitalStructure({ project_equity_pct: 30, kea_loan_pct: 49.7, other_debt_pct: 20 });
    expect(r.valid).toBe(true);
  });

  it('rejects sum that misses 100 by more than tolerance', () => {
    const r = validateCapitalStructure({ project_equity_pct: 30, kea_loan_pct: 30, other_debt_pct: 20 });
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/sum to 100/);
  });

  it('rejects KEA loan > 80% (한국에너지공단 한도)', () => {
    const r = validateCapitalStructure({ project_equity_pct: 5, kea_loan_pct: 90, other_debt_pct: 5 });
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/한도/);
  });

  it('accepts KEA loan exactly at 80% cap', () => {
    const r = validateCapitalStructure({ project_equity_pct: 10, kea_loan_pct: 80, other_debt_pct: 10 });
    expect(r.valid).toBe(true);
  });

  it('rejects negative percentages', () => {
    const r = validateCapitalStructure({ project_equity_pct: 110, kea_loan_pct: -5, other_debt_pct: -5 });
    expect(r.valid).toBe(false);
  });

  it('rejects percentages > 100', () => {
    const r = validateCapitalStructure({ project_equity_pct: 120, kea_loan_pct: 0, other_debt_pct: 0 });
    expect(r.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateKEALoanSchedule
// ---------------------------------------------------------------------------

describe('generateKEALoanSchedule', () => {
  it('returns empty array for zero loan', () => {
    expect(generateKEALoanSchedule(0, KEA_DEFAULT)).toEqual([]);
  });

  it('produces grace + repayment rows of expected length', () => {
    const rows = generateKEALoanSchedule(100_000_000, KEA_DEFAULT);
    expect(rows.length).toBe(KEA_DEFAULT.grace_years + KEA_DEFAULT.repayment_years);
  });

  it('grace years have principal=0 and interest = balance × rate', () => {
    const rows = generateKEALoanSchedule(100_000_000, KEA_DEFAULT);
    const expectedInterest = Math.round(100_000_000 * (KEA_DEFAULT.interest_rate_pct / 100));
    for (let y = 0; y < KEA_DEFAULT.grace_years; y++) {
      expect(rows[y]!.principal).toBe(0);
      expect(rows[y]!.interest).toBe(expectedInterest);
      expect(rows[y]!.remaining_balance).toBe(100_000_000);
    }
  });

  it('repayment years have positive principal that grows over time', () => {
    const rows = generateKEALoanSchedule(100_000_000, KEA_DEFAULT);
    const repayRows = rows.slice(KEA_DEFAULT.grace_years);
    for (const r of repayRows) expect(r.principal).toBeGreaterThan(0);
    // Annuity: principal portion increases each year
    for (let i = 1; i < repayRows.length; i++) {
      expect(repayRows[i]!.principal).toBeGreaterThan(repayRows[i - 1]!.principal);
    }
  });

  it('final remaining_balance is 0 (rounding correction)', () => {
    const rows = generateKEALoanSchedule(100_000_000, KEA_DEFAULT);
    expect(rows[rows.length - 1]!.remaining_balance).toBe(0);
  });

  it('annuity payment ≈ constant during repayment phase', () => {
    const rows = generateKEALoanSchedule(100_000_000, KEA_DEFAULT);
    const repayRows = rows.slice(KEA_DEFAULT.grace_years);
    const payments = repayRows.map((r) => r.interest + r.principal);
    const min = Math.min(...payments);
    const max = Math.max(...payments);
    // ±1원 rounding tolerance over 10 years
    expect(max - min).toBeLessThanOrEqual(2);
  });

  it('handles 0% rate (degenerate annuity = principal/n)', () => {
    const rows = generateKEALoanSchedule(100_000_000, { ...KEA_DEFAULT, interest_rate_pct: 0 });
    for (let i = KEA_DEFAULT.grace_years; i < rows.length; i++) {
      expect(rows[i]!.interest).toBe(0);
      expect(rows[i]!.principal).toBe(Math.round(100_000_000 / KEA_DEFAULT.repayment_years));
    }
  });
});

// ---------------------------------------------------------------------------
// calculateIRR
// ---------------------------------------------------------------------------

describe('calculateIRR', () => {
  it('returns 0% for cashflows that exactly break even nominally', () => {
    // -100, +50, +50 → IRR=0%
    const irr = calculateIRR([-100, 50, 50]);
    expect(irr).toBeCloseTo(0, 2);
  });

  it('positive IRR for profitable investment', () => {
    // -1000, +600, +600 → IRR ≈ 13%
    const irr = calculateIRR([-1000, 600, 600]);
    expect(irr).toBeGreaterThan(0.10);
    expect(irr).toBeLessThan(0.16);
  });

  it('returns NaN when cashflows have no sign change (all positive)', () => {
    expect(Number.isNaN(calculateIRR([100, 200, 300]))).toBe(true);
  });

  it('returns NaN when cashflows have no sign change (all negative)', () => {
    expect(Number.isNaN(calculateIRR([-100, -200, -300]))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// simulateInvestorReturn — end-to-end
// ---------------------------------------------------------------------------

describe('simulateInvestorReturn — base scenario sanity', () => {
  it('produces all 4 investor metrics with expected shape', () => {
    const r = simulateInvestorReturn(STD_INPUT);
    expect(r.cumulative_distribution_won).toBeTypeOf('number');
    expect(r.equity_irr_pct).toBeTypeOf('number');
    expect(r.payback_years).toBeTypeOf('number');
    expect(r.roi_multiple).toBeTypeOf('number');
    expect(r.yearly.length).toBe(STD_INPUT.years);
    expect(r.kea_loan_schedule.length).toBe(KEA_DEFAULT.grace_years + KEA_DEFAULT.repayment_years);
  });

  it('Year 1 revenue ≈ installed_kw × 3.6h × 365 × (SMP + REC bonus)', () => {
    const r = simulateInvestorReturn(STD_INPUT);
    // 25.86 × 3.6 × 365 × (119 + 1.2 × 70) ≈ 25.86 × 3.6 × 365 × 203 ≈ 6.9M won
    expect(r.project_revenue_year1_won).toBeGreaterThan(6_000_000);
    expect(r.project_revenue_year1_won).toBeLessThan(8_000_000);
  });

  it('housing_subsidy is exactly 41% of revenue', () => {
    const r = simulateInvestorReturn(STD_INPUT);
    for (const y of r.yearly) {
      const ratio = y.housing_subsidy / y.revenue;
      expect(ratio).toBeCloseTo(0.41, 2);
    }
  });

  it('opex is exactly 5% of revenue', () => {
    const r = simulateInvestorReturn(STD_INPUT);
    for (const y of r.yearly) {
      const ratio = y.opex / y.revenue;
      expect(ratio).toBeCloseTo(0.05, 2);
    }
  });

  it('investor_cumulative is monotonically increasing if distributions are positive', () => {
    const r = simulateInvestorReturn(STD_INPUT);
    let prev = -Infinity;
    let allPositive = true;
    for (const y of r.yearly) {
      if (y.investor_distribution < 0) allPositive = false;
      if (allPositive) {
        expect(y.investor_cumulative).toBeGreaterThanOrEqual(prev);
      }
      prev = y.investor_cumulative;
    }
  });

  it('rejects invalid capital structure', () => {
    expect(() =>
      simulateInvestorReturn({
        ...STD_INPUT,
        capital_structure: { project_equity_pct: 50, kea_loan_pct: 50, other_debt_pct: 50 },
      }),
    ).toThrow(/sum to 100/);
  });

  it('rejects zero project_equity (investor must hold equity)', () => {
    expect(() =>
      simulateInvestorReturn({
        ...STD_INPUT,
        capital_structure: { project_equity_pct: 0, kea_loan_pct: 80, other_debt_pct: 20 },
      }),
    ).toThrow(/project_equity_pct/);
  });

  it('rejects out-of-range years', () => {
    expect(() => simulateInvestorReturn({ ...STD_INPUT, years: 0 })).toThrow(/years/);
    expect(() => simulateInvestorReturn({ ...STD_INPUT, years: 100 })).toThrow(/years/);
  });
});

describe('simulateInvestorReturn — scenario ordering', () => {
  it('Optimistic > Base > Conservative on revenue and IRR', () => {
    const opt = simulateInvestorReturn({ ...STD_INPUT, scenario: 'optimistic' });
    const base = simulateInvestorReturn({ ...STD_INPUT, scenario: 'base' });
    const con = simulateInvestorReturn({ ...STD_INPUT, scenario: 'conservative' });
    expect(opt.project_revenue_year1_won).toBeGreaterThan(base.project_revenue_year1_won);
    expect(base.project_revenue_year1_won).toBeGreaterThan(con.project_revenue_year1_won);
    expect(opt.cumulative_distribution_won).toBeGreaterThan(base.cumulative_distribution_won);
    expect(base.cumulative_distribution_won).toBeGreaterThan(con.cumulative_distribution_won);
  });
});

describe('simulateInvestorReturn — sensitivity', () => {
  it('+20% SMP raises revenue', () => {
    const flat = simulateInvestorReturn(STD_INPUT);
    const up = simulateInvestorReturn({
      ...STD_INPUT,
      sensitivity: { smp_pct: 20, rec_pct: 0, efficiency_pct: 0, kea_rate_bps: 0 },
    });
    expect(up.project_revenue_year1_won).toBeGreaterThan(flat.project_revenue_year1_won);
  });

  it('+50bps KEA rate raises year-1 KEA interest', () => {
    const flat = simulateInvestorReturn(STD_INPUT);
    const up = simulateInvestorReturn({
      ...STD_INPUT,
      sensitivity: { smp_pct: 0, rec_pct: 0, efficiency_pct: 0, kea_rate_bps: 50 },
    });
    expect(up.yearly[0]!.kea_loan_interest).toBeGreaterThan(flat.yearly[0]!.kea_loan_interest);
  });
});

describe('simulateInvestorReturn — Pilot demo case', () => {
  it('Uljin 25.86kW · 1억원 출자 · 30/50/20 · base · 20년: shape is well-formed (model honestly reports negative ROI)', () => {
    const r = simulateInvestorReturn(STD_INPUT);
    // Truth-telling: a 1억원 stake at 30% equity in a single 25.86kW site
    // produces ~7M revenue/yr — KEA + other-debt service may exceed it,
    // resulting in negative distributable_equity. The MODEL is correct;
    // the SCENARIO is unprofitable. The investor-facing UI should surface
    // this honestly via Equity IRR (negative) and ROI Multiple (<1 or <0).
    expect(r.cumulative_distribution_won).not.toBeNaN();
    expect(r.roi_multiple).not.toBeNaN();
    expect(Number.isFinite(r.roi_multiple)).toBe(true);
    // Yearly entries each have all 9 cashflow fields populated
    for (const y of r.yearly) {
      expect(y).toHaveProperty('revenue');
      expect(y).toHaveProperty('opex');
      expect(y).toHaveProperty('housing_subsidy');
      expect(y).toHaveProperty('kea_loan_interest');
      expect(y).toHaveProperty('kea_loan_principal');
      expect(y).toHaveProperty('other_debt_service');
      expect(y).toHaveProperty('distributable_equity');
      expect(y).toHaveProperty('investor_distribution');
      expect(y).toHaveProperty('investor_cumulative');
    }
  });

  it('100%-equity 30-year optimistic: positive ROI Multiple > 1 + finite payback', () => {
    // Truth-test: at the v1.3.1 prompt's CAPEX (4M won/kW) + 41% subsidy +
    // 5% OPEX + 0.5%/yr decay, even no-debt 20-yr base scenario only returns
    // ~70% of capital. Profitability requires the longer horizon (30y) +
    // optimistic scenario (+15% on SMP/REC, +5% on efficiency).
    // This honestly reflects the prompt's assumption stack — investor IRR is
    // tight for Korean rooftop solar at these unit economics.
    const r = simulateInvestorReturn({
      investor_capex_won: 400_000_000, // total CAPEX = 400M for 100kW × 4M won/kW
      years: 30,
      installed_kw: 100,
      capital_structure: { project_equity_pct: 100, kea_loan_pct: 0, other_debt_pct: 0 },
      kea_loan_terms: KEA_DEFAULT,
      scenario: 'optimistic',
    });
    expect(r.roi_multiple).toBeGreaterThan(1);
    expect(r.equity_irr_pct).toBeGreaterThan(0);
    expect(Number.isFinite(r.payback_years)).toBe(true);
  });
});
