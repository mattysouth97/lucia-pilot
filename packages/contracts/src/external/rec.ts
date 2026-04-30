import { z } from 'zod';

// FR-X-002 — 한국에너지공단 REC (신재생에너지 공급인증서) Mock
// State machine: issued → transferred → burned
export const RecStatus = z.enum(['issued', 'transferred', 'burned']);
export type RecStatus = z.infer<typeof RecStatus>;

export const RecAction = z.enum(['issue', 'transfer', 'burn']);
export type RecAction = z.infer<typeof RecAction>;

export const RecHistoryEntry = z.object({
  ts: z.string().datetime(),
  action: RecAction,
  /** Present on transfer actions only. */
  owner_to: z.string().optional(),
});
export type RecHistoryEntry = z.infer<typeof RecHistoryEntry>;

// --- Input variants ---
export const RecIssueInput = z.object({
  action: z.literal('issue'),
  building_id: z.string(),
  kwh: z.number().positive(),
  owner: z.string(),
  weight: z.number().positive().default(1.2), // FR-S-003 REC weight
});
export type RecIssueInput = z.infer<typeof RecIssueInput>;

export const RecTransferInput = z.object({
  action: z.literal('transfer'),
  rec_id: z.string(),
  owner_to: z.string(),
});
export type RecTransferInput = z.infer<typeof RecTransferInput>;

export const RecBurnInput = z.object({
  action: z.literal('burn'),
  rec_id: z.string(),
});
export type RecBurnInput = z.infer<typeof RecBurnInput>;

export const RecInput = z.discriminatedUnion('action', [
  RecIssueInput,
  RecTransferInput,
  RecBurnInput,
]);
export type RecInput = z.infer<typeof RecInput>;

// --- Output ---
export const RecOutput = z.object({
  rec_id: z.string(),
  status: RecStatus,
  owner: z.string(),
  history: z.array(RecHistoryEntry),
});
export type RecOutput = z.infer<typeof RecOutput>;
