// FRD §11.1 — beneficiaries table
// Shape mirrors Beneficiary from @lucia/contracts/domain — Zod is NOT used here.
import {
  pgTable,
  pgEnum,
  text,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';

import { buildings } from './buildings.js';

// Mirrors BeneficiaryCategory from @lucia/contracts/domain/beneficiary
export const beneficiaryCategoryEnum = pgEnum('beneficiary_category', [
  'LH_매입임대',
  '국민임대',
  '에너지소외',
]);

export const beneficiaries = pgTable('beneficiaries', {
  beneficiary_id: text('beneficiary_id').primaryKey(),
  building_id: text('building_id')
    .notNull()
    .references(() => buildings.building_id, { onDelete: 'restrict' }),
  category: beneficiaryCategoryEnum('category').notNull(),
  household_count: integer('household_count').notNull(),
  // share_ratio is a fractional ratio [0, 1]; stored as numeric(6,5) for precision
  share_ratio: numeric('share_ratio', { precision: 6, scale: 5 }).notNull(),
  // monthly subsidy per household in KRW (won); integer amount, stored as numeric(14,2)
  monthly_subsidy_per_household: numeric('monthly_subsidy_per_household', {
    precision: 14,
    scale: 2,
  }).notNull(),
});

export type BeneficiaryInsert = typeof beneficiaries.$inferInsert;
export type BeneficiarySelect = typeof beneficiaries.$inferSelect;
