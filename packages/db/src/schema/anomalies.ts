// FRD §11.1 — anomalies table
// Shape mirrors Anomaly from @lucia/contracts/domain — Zod is NOT used here.
// FR-M-004: kWh < 30% avg, inverter eff < 90%, settle delay > 1h
// FR-D-002: admin injection types
import {
  pgTable,
  pgEnum,
  text,
  uuid,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core';

import { buildings } from './buildings.js';

// Mirrors AnomalyType from @lucia/contracts/domain/anomaly
export const anomalyTypeEnum = pgEnum('anomaly_type', [
  'inverter_fail',
  'shadow',
  'module_damage',
  'low_yield',
  'settlement_delay',
]);

// Mirrors AnomalySeverity from @lucia/contracts/domain/anomaly
export const anomalySeverityEnum = pgEnum('anomaly_severity', [
  'info',
  'warn',
  'critical',
]);

// Mirrors anomaly source from @lucia/contracts/domain/anomaly
export const anomalySourceEnum = pgEnum('anomaly_source', [
  'detector',
  'admin_injected',
]);

export const anomalies = pgTable('anomalies', {
  anomaly_id: uuid('anomaly_id').primaryKey().defaultRandom(),
  building_id: text('building_id')
    .notNull()
    .references(() => buildings.building_id, { onDelete: 'restrict' }),
  type: anomalyTypeEnum('type').notNull(),
  detected_at: timestamp('detected_at', { withTimezone: true }).notNull(),
  resolved_at: timestamp('resolved_at', { withTimezone: true }),   // null until resolved
  severity: anomalySeverityEnum('severity').notNull(),
  // drop_pct: percentage drop; null for non-yield anomalies (e.g. settlement_delay)
  drop_pct: numeric('drop_pct', { precision: 7, scale: 2 }),
  source: anomalySourceEnum('source').notNull(),
});

export type AnomalyInsert = typeof anomalies.$inferInsert;
export type AnomalySelect = typeof anomalies.$inferSelect;
