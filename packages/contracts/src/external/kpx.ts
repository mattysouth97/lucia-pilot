import { z } from 'zod';

// FR-X-001 — KPX SMP (계통한계가격) Mock
// Land avg 2026-04: 119원/kWh ±10원 hourly (per FRD pinned value)
export const KpxSmpInput = z.object({
  timestamp: z.string().datetime(),
  market: z.enum(['land', 'jeju']),
});
export type KpxSmpInput = z.infer<typeof KpxSmpInput>;

export const KpxSmpOutput = z.object({
  smp_price: z.number().positive(), // 원/kWh
  timestamp: z.string().datetime(),
  market: z.enum(['land', 'jeju']),
});
export type KpxSmpOutput = z.infer<typeof KpxSmpOutput>;

/** Pinned 2026-04 land average SMP; jeju carries a fixed premium. */
export const SMP_LAND_AVG_2026_04 = 119; // 원/kWh
export const SMP_JEJU_PREMIUM = 15; // 원/kWh additive
export const SMP_HOURLY_VARIANCE = 10; // ±원/kWh
