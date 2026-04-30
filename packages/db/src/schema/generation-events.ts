// FRD §11.1 — generation_events table (TimescaleDB hypertable)
// NOTE: The hypertable is created in migration 0002 via raw SQL
//   SELECT create_hypertable('generation_events', 'ts', if_not_exists => TRUE);
// Do NOT add ts to PK here — TimescaleDB requires ts in the partitioning dimension but Drizzle
// manages the regular PK separately; the unique constraint on (building_id, ts) enforces idempotency.
import {
  pgTable,
  pgEnum,
  text,
  uuid,
  timestamp,
  numeric,
  real,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { buildings } from './buildings.js';

// Mirrors GenerationSource from @lucia/contracts/domain/generation-event
export const generationSourceEnum = pgEnum('generation_source', [
  'simulator',
  'real',
]);

export const generationEvents = pgTable(
  'generation_events',
  {
    event_id: uuid('event_id').primaryKey().defaultRandom(),
    building_id: text('building_id')
      .notNull()
      .references(() => buildings.building_id, { onDelete: 'restrict' }),
    ts: timestamp('ts', { withTimezone: true }).notNull(),           // UTC; TimescaleDB partition column
    kwh: numeric('kwh', { precision: 10, scale: 3 }).notNull(),     // kWh stored as numeric
    inverter_temp_c: real('inverter_temp_c'),                        // nullable — not always present
    source: generationSourceEnum('source').notNull(),
  },
  (table) => [
    uniqueIndex('generation_events_building_ts_idx').on(
      table.building_id,
      table.ts,
    ),
  ],
);

export type GenerationEventInsert = typeof generationEvents.$inferInsert;
export type GenerationEventSelect = typeof generationEvents.$inferSelect;
