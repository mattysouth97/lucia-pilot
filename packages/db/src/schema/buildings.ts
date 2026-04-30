// FRD §11.1 — buildings table
// Shape mirrors Building from @lucia/contracts/domain — Zod is NOT used here (contract-side only).
import {
  pgTable,
  pgEnum,
  text,
  numeric,
  integer,
  date,
  real,
} from 'drizzle-orm/pg-core';

// Mirrors BuildingStatus from @lucia/contracts/domain/building
export const buildingStatusEnum = pgEnum('building_status', [
  'ok',
  'warn',
  'alert',
  'maintenance',
]);

export const buildings = pgTable('buildings', {
  building_id: text('building_id').primaryKey(),            // e.g. ULJN-001
  region_office: text('region_office').notNull(),
  city: text('city').notNull(),
  district: text('district').notNull(),
  address: text('address').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  installed_kw: numeric('installed_kw', { precision: 10, scale: 3 }).notNull(), // kWh-class; numeric per ADR
  inverter_count: integer('inverter_count').notNull(),
  install_date: date('install_date').notNull(),
  status: buildingStatusEnum('status').notNull().default('ok'),
});

export type BuildingInsert = typeof buildings.$inferInsert;
export type BuildingSelect = typeof buildings.$inferSelect;
