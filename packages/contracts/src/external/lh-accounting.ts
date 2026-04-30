import { z } from 'zod';

// FR-X-003 — LH 입주민 회계 Mock
// Simulates bulk subsidy disbursement to LH resident households.
export const LhAccountingInput = z.object({
  household_ids: z.array(z.string()).min(1),
  amount_per_household: z.number().int().positive(), // 원
  period: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
});
export type LhAccountingInput = z.infer<typeof LhAccountingInput>;

export const LhAccountingOutput = z.object({
  status: z.enum(['sent', 'failed']),
  transaction_id: z.string(),
  sent_count: z.number().int().nonnegative(),
});
export type LhAccountingOutput = z.infer<typeof LhAccountingOutput>;
