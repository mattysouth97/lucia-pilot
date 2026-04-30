// FRD §11.1 — settlements table
// Shape mirrors Settlement from @lucia/contracts/domain — Zod is NOT used here.
// FR-S-002~006: SMP, REC, 가상공유거래, SaaS, 거래수수료 — 9 cash flows stored as JSONB.
import {
  pgTable,
  text,
  uuid,
  timestamp,
  numeric,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';

import { generationEvents } from './generation-events.js';

export const settlements = pgTable('settlements', {
  settlement_id: uuid('settlement_id').primaryKey().defaultRandom(),
  // FK to generation_events — cascade: settlement is a child of the event
  event_id: uuid('event_id')
    .notNull()
    .references(() => generationEvents.event_id, { onDelete: 'cascade' }),
  building_id: text('building_id').notNull(),                       // denormalized for query speed
  ts: timestamp('ts', { withTimezone: true }).notNull(),           // UTC; mirrors event ts
  kwh: numeric('kwh', { precision: 10, scale: 3 }).notNull(),
  // cash_flow: JSONB storing SettlementCashFlow object (9 revenue/cost fields)
  // Schema: { smp_revenue, rec_amount, rec_value, ppa_revenue, kets_credit,
  //   housing_subsidy_lh, housing_subsidy_kookmin, housing_subsidy_energy,
  //   saas_fee_lucia, saas_fee_kie_rems, txn_fee, spc_net }
  // All monetary values are numeric; JSONB is used because the shape is typed in
  // @lucia/contracts and queried as a unit, not column-by-column.
  cash_flow: jsonb('cash_flow').notNull(),
  // SHA-256 hex of canonical-JSON payload — hash chain integrity (FR-S-007 / ADR-0002)
  payload_hash: text('payload_hash').notNull(),
  // prev_hash: nullable — null for the first settlement in a building's chain
  prev_hash: text('prev_hash'),
  // tx_id + block_height: null until the settlement is confirmed on-chain
  tx_id: text('tx_id'),
  block_height: integer('block_height'),
});

export type SettlementInsert = typeof settlements.$inferInsert;
export type SettlementSelect = typeof settlements.$inferSelect;
