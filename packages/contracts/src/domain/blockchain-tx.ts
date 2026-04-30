import { z } from 'zod';

// FRD §11.1 — 블록체인 트랜잭션 (Hyperledger Fabric)
// FR-S-007: Settle, Verify, History interface — see chain/chaincode/main.go
export const BlockchainTxStatus = z.enum(['confirmed', 'rejected', 'pending']);
export type BlockchainTxStatus = z.infer<typeof BlockchainTxStatus>;

export const BlockchainTx = z.object({
  tx_id: z.string(),
  block_height: z.number().int().nonnegative(),
  hash: z.string().regex(/^[0-9a-f]{64}$/),
  prev_hash: z.string().regex(/^[0-9a-f]{64}$/).nullable(),
  payload_blob: z.string(), // canonical-JSON of Settlement.cash_flow + meta
  ts: z.string().datetime(),
  status: BlockchainTxStatus,
  rejection_reason: z.string().optional(),
});
export type BlockchainTx = z.infer<typeof BlockchainTx>;
