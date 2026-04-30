// FRD §11.1 — audit_logs table
// Shape mirrors AuditLog from @lucia/contracts/domain — Zod is NOT used here.
// NFR-6, FR-O-003: all admin mutations write an audit log entry.
// §11.2 retention policy: 5-year retention (DO NOT purge rows older than 5 years without explicit PM approval).
// Implement TimescaleDB data retention policy for this table in wk11 ops tuning (Phase 2 / P3).
import {
  pgTable,
  pgEnum,
  text,
  uuid,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

// Mirrors AuditAction from @lucia/contracts/domain/audit-log
export const auditActionEnum = pgEnum('audit_action', [
  'building.create',
  'building.update',
  'building.delete',
  'policy.update',
  'anomaly.inject',
  'anomaly.clear',
  'demo.start',
  'demo.pause',
  'demo.resume',
  'demo.jump',
  'tamper.attempt',
  'settlement.rollback',
  'mock.reset',
]);

export const auditLogs = pgTable('audit_logs', {
  log_id: uuid('log_id').primaryKey().defaultRandom(),
  action: auditActionEnum('action').notNull(),
  actor: text('actor').notNull(),                                   // 'admin@lucia' | 'system' | 'cron'
  ts: timestamp('ts', { withTimezone: true }).notNull(),           // UTC
  // payload: JSONB; engine validates per-action schema separately (see @lucia/contracts)
  payload: jsonb('payload').notNull(),
  ip_address: text('ip_address'),                                   // null for cron/system actors
  user_agent: text('user_agent'),
});

export type AuditLogInsert = typeof auditLogs.$inferInsert;
export type AuditLogSelect = typeof auditLogs.$inferSelect;
