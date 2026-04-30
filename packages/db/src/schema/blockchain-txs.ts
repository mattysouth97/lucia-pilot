// FRD §11.1 — blockchain_txs table
// Shape mirrors BlockchainTx from @lucia/contracts/domain — Zod is NOT used here.
// FR-S-007: Settle / Verify / History interface — see chain/chaincode/main.go
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

// Mirrors BlockchainTxStatus from @lucia/contracts/domain/blockchain-tx
export const blockchainTxStatusEnum = pgEnum('blockchain_tx_status', [
  'confirmed',
  'rejected',
  'pending',
]);

export const blockchainTxs = pgTable('blockchain_txs', {
  tx_id: text('tx_id').primaryKey(),
  block_height: integer('block_height').notNull(),
  hash: text('hash').notNull(),                                     // SHA-256 hex
  prev_hash: text('prev_hash'),                                     // nullable for genesis tx
  // payload_blob: canonical-JSON text of Settlement.cash_flow + meta
  // Stored as text (not jsonb) to preserve exact serialization for hash verification
  payload_blob: text('payload_blob').notNull(),
  ts: timestamp('ts', { withTimezone: true }).notNull(),           // UTC timestamp of chain commit
  status: blockchainTxStatusEnum('status').notNull().default('pending'),
  rejection_reason: text('rejection_reason'),                       // null unless rejected
});

export type BlockchainTxInsert = typeof blockchainTxs.$inferInsert;
export type BlockchainTxSelect = typeof blockchainTxs.$inferSelect;
