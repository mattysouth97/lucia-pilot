// FRD §3.1 v1.3 — Investor (RE100 corporate or retail individual)
//
// Backs FR-R-003 (RE100 onboarding), FR-R-004 (retail onboarding),
// FR-R-006 (investor portfolio dashboard).
//
// Discriminated union on `type` so TS narrows company-only vs individual-only
// fields. RE100 entries carry annual MWh target + corp registration; retail
// entries carry individual name + smaller capex range.

import { z } from 'zod';

import { RegionOffice } from './region-office.js';

export const InvestorType = z.enum(['re100', 'retail']);
export type InvestorType = z.infer<typeof InvestorType>;

const Contact = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^(\+82|0)\d{1,3}-?\d{3,4}-?\d{4}$/),
  email: z.string().email(),
});
export type Contact = z.infer<typeof Contact>;

const CapexRange = z.object({
  min_won: z.number().int().nonnegative(),
  max_won: z.number().int().nonnegative(),
}).refine((r) => r.max_won >= r.min_won, { message: 'max_won must be ≥ min_won' });
export type CapexRange = z.infer<typeof CapexRange>;

// RE100 corporate investor — Mock 사업자등록번호 pattern (NNN-NN-NNNNN).
const InvestorRE100 = z.object({
  id: z.string().min(1),
  type: z.literal('re100'),
  company_name: z.string().min(1),
  business_registration_number: z.string().regex(/^\d{3}-\d{2}-\d{5}$/),
  contact: Contact,
  target_re100_mwh_per_year: z.number().nonnegative(),
  re100_joined_year: z.number().int().min(2014).max(2030),
  re100_target_year: z.number().int().min(2030).max(2060),
  preferred_regions: z.array(RegionOffice).default([]),
  expected_capex_range: CapexRange,
  created_at: z.string().datetime(),
});

const InvestorRetail = z.object({
  id: z.string().min(1),
  type: z.literal('retail'),
  individual_name: z.string().min(1),
  contact: Contact,
  preferred_regions: z.array(RegionOffice).default([]),
  expected_capex_range: CapexRange,
  investment_motivations: z.array(z.enum(['esg', 'yield', 'local_contribution', 'other'])).default([]),
  created_at: z.string().datetime(),
});

export const Investor = z.discriminatedUnion('type', [InvestorRE100, InvestorRetail]);
export type Investor = z.infer<typeof Investor>;
