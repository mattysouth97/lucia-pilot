import { z } from 'zod';

// FRD §11.1 — 감사 로그 (NFR-6, FR-O-003)
// 5-year retention per §11.2
export const AuditAction = z.enum([
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
export type AuditAction = z.infer<typeof AuditAction>;

export const AuditLog = z.object({
  log_id: z.string().uuid(),
  action: AuditAction,
  actor: z.string(), // 'admin@lucia' / 'system' / 'cron'
  ts: z.string().datetime(),
  payload: z.unknown(), // JSON; engine validates per-action schema separately
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
});
export type AuditLog = z.infer<typeof AuditLog>;
