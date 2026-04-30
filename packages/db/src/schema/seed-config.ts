// seed_config table — key/value store for seed-time master data.
// Used by the seed script to persist KIE-REMS inverter/region data
// that the engine reads at startup via:
//   SELECT value FROM seed_config WHERE key = 'kie_rems'
import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const seedConfig = pgTable('seed_config', {
  key:        text('key').primaryKey(),
  value:      jsonb('value').notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type SeedConfigInsert = typeof seedConfig.$inferInsert;
export type SeedConfigSelect = typeof seedConfig.$inferSelect;
