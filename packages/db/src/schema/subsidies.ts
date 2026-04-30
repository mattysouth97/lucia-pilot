// FRD §11.1 — subsidies table
// Shape mirrors Subsidy from @lucia/contracts/domain — Zod is NOT used here.
// FR-M-007: resident-portal display per (beneficiary, period)
import {
  pgTable,
  pgEnum,
  text,
  uuid,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core';

import { beneficiaries } from './beneficiaries.js';
import { settlements } from './settlements.js';

// Mirrors SubsidyStatus from @lucia/contracts/domain/subsidy
export const subsidyStatusEnum = pgEnum('subsidy_status', [
  'pending',
  'sent',
  'failed',
]);

export const subsidies = pgTable('subsidies', {
  subsidy_id: uuid('subsidy_id').primaryKey().defaultRandom(),
  beneficiary_id: text('beneficiary_id')
    .notNull()
    .references(() => beneficiaries.beneficiary_id, { onDelete: 'restrict' }),
  settlement_id: uuid('settlement_id')
    .notNull()
    .references(() => settlements.settlement_id, { onDelete: 'restrict' }),
  period: text('period').notNull(),                                 // YYYY-MM format
  // amount in KRW (won); integer semantics but stored as numeric(14,2) per ADR convention
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  status: subsidyStatusEnum('status').notNull().default('pending'),
  sent_at: timestamp('sent_at', { withTimezone: true }),            // null until dispatched
});

export type SubsidyInsert = typeof subsidies.$inferInsert;
export type SubsidySelect = typeof subsidies.$inferSelect;
