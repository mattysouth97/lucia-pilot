import { z } from 'zod';

// FRD §11.1 — 이상 감지
// FR-M-004: kWh < 30% avg, inverter eff < 90%, settle delay > 1h
// FR-D-002: admin injection types
export const AnomalyType = z.enum([
  'inverter_fail',
  'shadow',
  'module_damage',
  'low_yield',
  'settlement_delay',
]);
export type AnomalyType = z.infer<typeof AnomalyType>;

export const AnomalySeverity = z.enum(['info', 'warn', 'critical']);
export type AnomalySeverity = z.infer<typeof AnomalySeverity>;

export const Anomaly = z.object({
  anomaly_id: z.string().uuid(),
  building_id: z.string().regex(/^ULJN-\d{3}$/),
  type: AnomalyType,
  detected_at: z.string().datetime(),
  resolved_at: z.string().datetime().nullable(),
  severity: AnomalySeverity,
  drop_pct: z.number().nullable(), // -67.6 etc; null for non-yield anomalies
  source: z.enum(['detector', 'admin_injected']),
});
export type Anomaly = z.infer<typeof Anomaly>;
