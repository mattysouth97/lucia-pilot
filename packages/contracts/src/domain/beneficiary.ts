import { z } from 'zod';

// FRD §11.1 — 수혜자 그룹 (3 groups)
// FR-S-004: LH 매입임대 64.2% (1,643세대), 국민임대 10.9% (280세대), 에너지소외 35.8% (916세대)
export const BeneficiaryCategory = z.enum(['LH_매입임대', '국민임대', '에너지소외']);
export type BeneficiaryCategory = z.infer<typeof BeneficiaryCategory>;

export const Beneficiary = z.object({
  beneficiary_id: z.string(),
  building_id: z.string().regex(/^ULJN-\d{3}$/),
  category: BeneficiaryCategory,
  household_count: z.number().int().positive(),
  share_ratio: z.number().min(0).max(1), // within the 41% reservation
  monthly_subsidy_per_household: z.number().int().nonnegative(),
});
export type Beneficiary = z.infer<typeof Beneficiary>;

// Pinned per FR-S-004 acceptance: 6,420 / 7,420 / 18,195 원 ±1
export const SUBSIDY_PINNED = {
  LH_매입임대: 6420,
  국민임대: 7420,
  에너지소외: 18195,
} as const satisfies Record<BeneficiaryCategory, number>;

// Pinned share ratios within the 41% revenue reservation
export const SHARE_RATIO_PINNED = {
  LH_매입임대: 0.642,
  국민임대: 0.109,
  에너지소외: 0.358, // sum = 1.109 — FRD wording; per-household amounts are the real invariant
} as const satisfies Record<BeneficiaryCategory, number>;
