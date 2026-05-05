// FRD §9 v1.3 — SimulationResult (FR-O-006 financial-simulator persistence)
//
// Saves the full input + output of one BM A vs BM B comparison so an investor
// can revisit the run from FR-R-006 portfolio's "시뮬레이션 이력" tab.
//
// IMPORTANT: cashflow numerics in this module are NOT yet reconciled to the
// authoritative TheKIE_LH_재무모델.xlsx — see docs/IMPLEMENTATION_LOG.md
// risk R-V13-1. The shape is final; the values come from constants in
// packages/finance.

import { z } from 'zod';

import { RegionOffice } from './region-office.js';

export const Scenario = z.enum(['conservative', 'base', 'optimistic']);
export type Scenario = z.infer<typeof Scenario>;

const Sensitivity = z.object({
  smp_pct: z.number().min(-50).max(50),       // SMP ±20% per FR-O-006 toggle
  rec_pct: z.number().min(-50).max(50),       // REC ±20%
  lucia_pct: z.number().min(-50).max(50),     // Lucia SaaS ±30%
});
export type Sensitivity = z.infer<typeof Sensitivity>;

const SimulationInputs = z.object({
  capex_won: z.number().int().nonnegative(),
  years: z.number().int().min(1).max(30),
  /** When set, scopes the simulation to a specific building rather than a region. */
  site_id: z.string().nullable(),
  region_office: RegionOffice.nullable(),
  installed_kw: z.number().positive(),
  equity_ratio_pct: z.number().min(0).max(100),
  scenario: Scenario,
  sensitivity: Sensitivity,
});
export type SimulationInputs = z.infer<typeof SimulationInputs>;

export const YearlyCashflow = z.object({
  year: z.number().int().min(1).max(30),
  cashflow_won: z.number(),
});
export type YearlyCashflow = z.infer<typeof YearlyCashflow>;

export const BMResult = z.object({
  /** Year-1 generation revenue (won). */
  year1_revenue_won: z.number().nonnegative(),
  /** 20-year cumulative revenue (or `years` years if shorter). */
  cumulative_revenue_won: z.number().nonnegative(),
  /** Net profit after OPEX/tax/depreciation. May be negative for early years. */
  net_profit_won: z.number(),
  /** Return on equity, percent. */
  roe_pct: z.number(),
  /** Discounted payback period in years. Infinity if not paid back inside the horizon. */
  payback_years: z.number().nonnegative(),
  yearly_cashflows: z.array(YearlyCashflow).min(1),
});
export type BMResult = z.infer<typeof BMResult>;

export const SimulationResult = z.object({
  id: z.string().min(1),
  /** Null for anonymous (non-logged-in) simulator runs. */
  investor_id: z.string().nullable(),
  inputs: SimulationInputs,
  bm_a_result: BMResult,
  bm_b_result: BMResult,
  /** True if the result has been pinned against the authoritative xlsx. */
  reconciled_to_xlsx: z.boolean().default(false),
  created_at: z.string().datetime(),
});
export type SimulationResult = z.infer<typeof SimulationResult>;
