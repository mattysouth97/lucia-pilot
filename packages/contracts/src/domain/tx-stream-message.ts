import { z } from 'zod';

// FR-M-008 — Live Tx Stream WebSocket message envelope.
// Backend (apps/engine) broadcasts on /ws/transactions; frontend (apps/web LiveTxStream card) consumes.
// Promoted to demo-critical Must in plan (storyboard Step 3).
export const TxStreamMessageType = z.enum(['settle', 'rec', 'tamper', 'anomaly', 'subsidy']);
export type TxStreamMessageType = z.infer<typeof TxStreamMessageType>;

export const TxStreamMessage = z.object({
  ts: z.string().datetime(),
  type: TxStreamMessageType,
  tx_id: z.string().nullable(), // null for tamper/anomaly without chain entry
  building_id: z.string().regex(/^(ULJN-\d{3}|ADMIN)$/),
  kwh: z.number().nonnegative().nullable(),
  amount_won: z.number().nullable(),
  block_height: z.number().int().nonnegative().nullable(),
  status: z.enum(['confirmed', 'rejected']),
  rejection_reason: z.string().optional(),
});
export type TxStreamMessage = z.infer<typeof TxStreamMessage>;
