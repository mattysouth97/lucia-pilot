// FRD §11.1 — residents table
// Shape mirrors Resident from @lucia/contracts/domain — Zod is NOT used here.
// FR-M-007: Mock auth via token; PII masked per NFR-4.
import { pgTable, text } from 'drizzle-orm/pg-core';

import { beneficiaries, beneficiaryCategoryEnum } from './beneficiaries.js';
import { buildings } from './buildings.js';

export const residents = pgTable('residents', {
  resident_id: text('resident_id').primaryKey(),
  beneficiary_id: text('beneficiary_id')
    .notNull()
    .references(() => beneficiaries.beneficiary_id, { onDelete: 'cascade' }),
  category: beneficiaryCategoryEnum('category').notNull(),
  building_id: text('building_id')
    .notNull()
    .references(() => buildings.building_id, { onDelete: 'restrict' }),
  // NFR-4 PII masking — stored already masked e.g. "홍*동"
  masked_name: text('masked_name').notNull(),
  // demo-only token; replaced by real auth in Phase 2
  mock_login_token: text('mock_login_token').notNull(),
});

export type ResidentInsert = typeof residents.$inferInsert;
export type ResidentSelect = typeof residents.$inferSelect;
