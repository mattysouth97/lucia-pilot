import { z } from 'zod';

// FRD §11.1 — 주거비 환원 내역
// FR-M-007: resident-portal display per (beneficiary, period)
export const SubsidyStatus = z.enum(['pending', 'sent', 'failed']);
export type SubsidyStatus = z.infer<typeof SubsidyStatus>;

export const Subsidy = z.object({
  subsidy_id: z.string().uuid(),
  beneficiary_id: z.string(),
  settlement_id: z.string().uuid(),
  period: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  amount: z.number().int().nonnegative(),
  status: SubsidyStatus,
  sent_at: z.string().datetime().nullable(),
});
export type Subsidy = z.infer<typeof Subsidy>;
