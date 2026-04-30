import { z } from 'zod';

// FRD §11.1 — 발전 이벤트 (시계열, TimescaleDB hypertable)
// FR-S-001 input: { building_id, timestamp, kwh, source }
export const GenerationSource = z.enum(['simulator', 'real']);
export type GenerationSource = z.infer<typeof GenerationSource>;

export const GenerationEvent = z.object({
  event_id: z.string().uuid(),
  building_id: z.string().regex(/^ULJN-\d{3}$/),
  ts: z.string().datetime(),
  kwh: z.number().min(0).max(10000),
  inverter_temp_c: z.number().nullable(),
  source: GenerationSource,
});
export type GenerationEvent = z.infer<typeof GenerationEvent>;

// FR-S-001 ingest envelope (post-validation)
export const GenerationEventInput = GenerationEvent.omit({ event_id: true });
export type GenerationEventInput = z.infer<typeof GenerationEventInput>;
