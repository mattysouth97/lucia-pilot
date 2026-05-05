// FRD-2026-001 v1.3.1 §FR-O-006 — investor-perspective financial simulator.
//
// THIS MODULE IS STRICTLY INVESTOR-FACING.
// TheKIE internal BM A vs BM B comparison is NOT computed here — that lives
// elsewhere (TheKIE strategy doc). This file computes:
//   - Equity IRR  (the investor's internal rate of return on their stake)
//   - Payback     (years for cumulative distributions to repay投자액)
//   - ROI Multiple (sum(distributions) / 投자액)
//
// Every assumption sourced from packages/finance/src/assumptions.ts.

import { BASE_ASSUMPTIONS, SCENARIOS, type ScenarioName } from './assumptions.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** 자본 구조 — 3 percentages summing to 100 (with tolerance). */
export interface CapitalStructure {
  /** 자기자본 (project equity, 0~100%). */
  project_equity_pct: number;
  /** 한국에너지공단 재생에너지지원사업 융자금. **MUST be ≤ 80** (UI cap). */
  kea_loan_pct: number;
  /** 기타 부채 (commercial loan). */
  other_debt_pct: number;
}

export interface KEALoanTerms {
  /** Annual rate, percent. Default 1.75%. */
  interest_rate_pct: number;
  /** Years of interest-only grace. Default 5. */
  grace_years: number;
  /** Years of annuity-equal repayment after grace. Default 10. */
  repayment_years: number;
}

export interface Sensitivity {
  /** Additive percent on SMP revenue (e.g. -20 = 80%). UI ±20. */
  smp_pct: number;
  /** Additive percent on REC revenue. UI ±20. */
  rec_pct: number;
  /** Additive percent on generation efficiency. UI ±10. */
  efficiency_pct: number;
  /** Additive basis points on KEA rate. UI ±50bps (=0.5%p). */
  kea_rate_bps: number;
}

export interface SimulationInput {
  /** Investor 출자액 in won. */
  investor_capex_won: number;
  /** Holding period in years (1~30). */
  years: number;
  /** Site or pool installed kW. Drives generation revenue. */
  installed_kw: number;
  /** Capital structure (must sum to 100% within tolerance). */
  capital_structure: CapitalStructure;
  /** KEA loan terms (rate / grace / repayment). */
  kea_loan_terms: KEALoanTerms;
  /** Macro scenario. */
  scenario: ScenarioName;
  /** Optional sensitivity tweaks. Default = no shift. */
  sensitivity?: Sensitivity;
}

export interface KEALoanScheduleRow {
  year: number;
  interest: number;
  principal: number;
  remaining_balance: number;
}

export interface YearlyCashflow {
  year: number;
  revenue: number;
  opex: number;
  housing_subsidy: number;
  kea_loan_interest: number;
  kea_loan_principal: number;
  other_debt_service: number;
  distributable_equity: number;
  investor_distribution: number;
  investor_cumulative: number;
}

export interface InvestorResult {
  /** 투자자 누적 분배 (won). */
  cumulative_distribution_won: number;
  /** Equity IRR (%). NaN if cashflows make IRR undefined. */
  equity_irr_pct: number;
  /** Discounted-payback in years. Infinity if never paid back inside horizon. */
  payback_years: number;
  /** ROI Multiple (cumulative distribution / capex). */
  roi_multiple: number;
  /** Year-1 project revenue. */
  project_revenue_year1_won: number;
  /** Sum of revenue across the holding period. */
  project_cumulative_revenue_won: number;
  /** Per-year breakdown (length = years). */
  yearly: YearlyCashflow[];
  /** KEA loan amortization schedule (length = grace + repayment). */
  kea_loan_schedule: KEALoanScheduleRow[];
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCapitalStructure(cs: CapitalStructure): ValidationResult {
  const { project_equity_pct, kea_loan_pct, other_debt_pct } = cs;
  for (const [name, v] of Object.entries(cs)) {
    if (!Number.isFinite(v) || v < 0 || v > 100) {
      return { valid: false, error: `${name} must be in [0, 100], got ${v}` };
    }
  }
  if (kea_loan_pct > BASE_ASSUMPTIONS.kea_loan_max_pct) {
    return {
      valid: false,
      error: `kea_loan_pct exceeds 한국에너지공단 한도 ${BASE_ASSUMPTIONS.kea_loan_max_pct}% (got ${kea_loan_pct}%)`,
    };
  }
  const sum = project_equity_pct + kea_loan_pct + other_debt_pct;
  const tol = BASE_ASSUMPTIONS.capital_structure_tolerance_pct;
  if (Math.abs(sum - 100) > tol) {
    return {
      valid: false,
      error: `capital structure must sum to 100 (±${tol}), got ${sum.toFixed(2)}`,
    };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// KEA loan schedule
// ---------------------------------------------------------------------------

/**
 * Generate the FR-O-006 §처리-7 KEA loan amortization schedule.
 *
 * Years 1..grace: interest only (interest = balance × rate, principal = 0).
 * Years grace+1..grace+repayment: annuity-equal (interest + principal sum to
 *   the same amount each year; principal portion grows over time).
 *
 * `loan_amount` is the original principal in won. Schedule has
 * grace_years + repayment_years rows. Returns rounded won (no fractional 원).
 */
export function generateKEALoanSchedule(
  loan_amount: number,
  terms: KEALoanTerms,
): KEALoanScheduleRow[] {
  if (loan_amount <= 0) return [];
  const rate = terms.interest_rate_pct / 100;
  const rows: KEALoanScheduleRow[] = [];
  let balance = loan_amount;

  // Interest-only grace
  for (let y = 1; y <= terms.grace_years; y++) {
    const interest = Math.round(balance * rate);
    rows.push({ year: y, interest, principal: 0, remaining_balance: Math.round(balance) });
  }

  // Annuity-equal repayment
  const n = terms.repayment_years;
  const annuityPayment =
    rate === 0
      ? balance / n
      : (balance * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);

  for (let y = terms.grace_years + 1; y <= terms.grace_years + n; y++) {
    const interest = balance * rate;
    const principal = annuityPayment - interest;
    balance -= principal;
    rows.push({
      year: y,
      interest: Math.round(interest),
      principal: Math.round(principal),
      remaining_balance: Math.max(0, Math.round(balance)),
    });
  }

  // Force last row's remaining_balance to 0 (rounding drift correction)
  if (rows.length > 0) {
    rows[rows.length - 1]!.remaining_balance = 0;
  }
  return rows;
}

// ---------------------------------------------------------------------------
// IRR (Newton-Raphson with bisection fallback)
// ---------------------------------------------------------------------------

/**
 * Compute IRR for a cash-flow series. cashflows[0] is investor outlay
 * (negative); cashflows[1..N] are distributions in subsequent years (positive).
 *
 * Returns the rate as a fraction (0.07 = 7%). Returns NaN if no real root
 * exists in [-99%, +1000%] (e.g. all negative cashflows).
 */
export function calculateIRR(cashflows: readonly number[]): number {
  if (cashflows.length < 2) return Number.NaN;
  // Quick rejection: all-positive or all-negative → undefined IRR.
  let hasPos = false;
  let hasNeg = false;
  for (const cf of cashflows) {
    if (cf > 0) hasPos = true;
    if (cf < 0) hasNeg = true;
  }
  if (!hasPos || !hasNeg) return Number.NaN;

  const npv = (rate: number): number => {
    let sum = 0;
    for (let i = 0; i < cashflows.length; i++) {
      sum += cashflows[i]! / Math.pow(1 + rate, i);
    }
    return sum;
  };

  // Bisection bracket: search for sign change in [-0.99, 10].
  let lo = -0.99;
  let hi = 10;
  let nlo = npv(lo);
  let nhi = npv(hi);
  if (nlo * nhi > 0) return Number.NaN;

  for (let iter = 0; iter < 80; iter++) {
    const mid = (lo + hi) / 2;
    const nmid = npv(mid);
    if (Math.abs(nmid) < 1e-2) return mid;
    if (nlo * nmid < 0) {
      hi = mid;
      nhi = nmid;
    } else {
      lo = mid;
      nlo = nmid;
    }
  }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------------
// Other-debt amortization (simple annuity over default tenor)
// ---------------------------------------------------------------------------

function generateOtherDebtAnnualService(
  amount: number,
  ratePct: number,
  tenorYears: number,
  totalYears: number,
): number[] {
  if (amount <= 0) return new Array(totalYears).fill(0);
  const rate = ratePct / 100;
  const pmt =
    rate === 0
      ? amount / tenorYears
      : (amount * rate * Math.pow(1 + rate, tenorYears)) /
        (Math.pow(1 + rate, tenorYears) - 1);
  return Array.from({ length: totalYears }, (_, i) => (i < tenorYears ? pmt : 0));
}

// ---------------------------------------------------------------------------
// Main simulation
// ---------------------------------------------------------------------------

export function simulateInvestorReturn(input: SimulationInput): InvestorResult {
  const validation = validateCapitalStructure(input.capital_structure);
  if (!validation.valid) {
    throw new Error(`simulateInvestorReturn: ${validation.error}`);
  }
  if (input.years < 1 || input.years > 30) {
    throw new Error(`simulateInvestorReturn: years must be in [1, 30], got ${input.years}`);
  }
  if (input.installed_kw <= 0) {
    throw new Error(`simulateInvestorReturn: installed_kw must be positive, got ${input.installed_kw}`);
  }

  const A = BASE_ASSUMPTIONS;
  const sc = SCENARIOS[input.scenario];
  const sens = input.sensitivity ?? { smp_pct: 0, rec_pct: 0, efficiency_pct: 0, kea_rate_bps: 0 };

  // Project CAPEX = investor's project_equity portion implies total project CAPEX.
  // Pilot model: investor IS the sole equity holder, so:
  //   investor_capex_won = total_project_capex × project_equity_pct / 100
  //   total_project_capex = investor_capex_won × 100 / project_equity_pct
  const equityFraction = input.capital_structure.project_equity_pct / 100;
  if (equityFraction <= 0) {
    throw new Error('simulateInvestorReturn: project_equity_pct must be > 0 (investor must hold equity)');
  }
  const totalProjectCapex = input.investor_capex_won / equityFraction;
  const keaLoanAmount = totalProjectCapex * (input.capital_structure.kea_loan_pct / 100);
  const otherDebtAmount = totalProjectCapex * (input.capital_structure.other_debt_pct / 100);

  // KEA loan schedule (apply sensitivity rate shift)
  const effKEAterms: KEALoanTerms = {
    ...input.kea_loan_terms,
    interest_rate_pct: input.kea_loan_terms.interest_rate_pct + sens.kea_rate_bps / 100,
  };
  const keaSchedule = generateKEALoanSchedule(keaLoanAmount, effKEAterms);
  const keaInterestByYear: number[] = new Array(input.years).fill(0);
  const keaPrincipalByYear: number[] = new Array(input.years).fill(0);
  for (const row of keaSchedule) {
    if (row.year <= input.years) {
      keaInterestByYear[row.year - 1] = row.interest;
      keaPrincipalByYear[row.year - 1] = row.principal;
    }
  }

  // Other debt service
  const otherDebtServiceByYear = generateOtherDebtAnnualService(
    otherDebtAmount,
    A.other_debt_default_rate_pct,
    A.other_debt_default_tenor_years,
    input.years,
  );

  // Generation revenue per year, with degradation + scenario + sensitivity
  const smpMult = sc.smp_multiplier * (1 + sens.smp_pct / 100);
  const recMult = sc.rec_multiplier * (1 + sens.rec_pct / 100);
  const effMult = sc.efficiency_multiplier * (1 + sens.efficiency_pct / 100);

  const yearly: YearlyCashflow[] = [];
  let cumDistribution = 0;
  let totalRevenue = 0;
  let revenueYear1 = 0;

  for (let y = 1; y <= input.years; y++) {
    const degradation = Math.pow(1 - A.efficiency_decay_pct / 100, y - 1);
    const annualKwh = input.installed_kw * A.daily_generation_hours * 365 * effMult * degradation;
    const smpRevenue = annualKwh * A.smp_won_per_kwh * smpMult;
    const recRevenue = (annualKwh / 1000) * A.rec_weight * A.rec_won_per_mwh * recMult;
    const revenue = smpRevenue + recRevenue;

    const housingSubsidy = revenue * (A.housing_subsidy_pct_of_revenue / 100);
    const opex = revenue * (A.oem_pct_of_revenue / 100);
    const keaInterest = keaInterestByYear[y - 1]!;
    const keaPrincipal = keaPrincipalByYear[y - 1]!;
    const otherDebtService = otherDebtServiceByYear[y - 1]!;

    const distributableEquity =
      revenue - housingSubsidy - opex - keaInterest - keaPrincipal - otherDebtService;
    const investorDistribution = distributableEquity; // investor holds 100% of equity in Pilot model
    cumDistribution += investorDistribution;

    yearly.push({
      year: y,
      revenue: Math.round(revenue),
      opex: Math.round(opex),
      housing_subsidy: Math.round(housingSubsidy),
      kea_loan_interest: keaInterest,
      kea_loan_principal: keaPrincipal,
      other_debt_service: Math.round(otherDebtService),
      distributable_equity: Math.round(distributableEquity),
      investor_distribution: Math.round(investorDistribution),
      investor_cumulative: Math.round(cumDistribution),
    });

    if (y === 1) revenueYear1 = revenue;
    totalRevenue += revenue;
  }

  // Equity IRR — investor's POV: outlay at Y0, distributions at Y1..N
  const cashflows = [-input.investor_capex_won, ...yearly.map((r) => r.investor_distribution)];
  const irr = calculateIRR(cashflows);
  const equityIrrPct = Number.isNaN(irr) ? Number.NaN : irr * 100;

  // Payback (linear interp inside the breach year)
  let paybackYears = Number.POSITIVE_INFINITY;
  let cumulative = 0;
  for (let i = 0; i < yearly.length; i++) {
    const dist = yearly[i]!.investor_distribution;
    if (cumulative + dist >= input.investor_capex_won) {
      const remaining = input.investor_capex_won - cumulative;
      const fraction = dist > 0 ? remaining / dist : 1;
      paybackYears = i + Math.min(1, Math.max(0, fraction));
      break;
    }
    cumulative += dist;
  }

  const roiMultiple = input.investor_capex_won > 0 ? cumDistribution / input.investor_capex_won : 0;

  return {
    cumulative_distribution_won: Math.round(cumDistribution),
    equity_irr_pct: equityIrrPct,
    payback_years: paybackYears,
    roi_multiple: roiMultiple,
    project_revenue_year1_won: Math.round(revenueYear1),
    project_cumulative_revenue_won: Math.round(totalRevenue),
    yearly,
    kea_loan_schedule: keaSchedule,
  };
}
