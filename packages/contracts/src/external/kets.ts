import { z } from 'zod';

// FR-X-005 — 환경부 K-ETS (한국 탄소배출권 거래제) Mock
export const KetsInput = z.object({
  period: z.string().regex(/^\d{4}-Q[1-4]$/), // YYYY-Qn
  total_co2_kg: z.number().nonnegative(),
  plant_id: z.string(),
});
export type KetsInput = z.infer<typeof KetsInput>;

export const KetsCertificate = z.object({
  certificate_id: z.string(),
  issued_at: z.string().datetime(),
  valid_until: z.string().date(), // end of quarter YYYY-MM-DD
  co2_avoided_kg: z.number().nonnegative(),
});
export type KetsCertificate = z.infer<typeof KetsCertificate>;

export const KetsOutput = z.object({
  status: z.enum(['registered', 'rejected']),
  /** Carbon credits awarded (1 credit = 1 tCO2e = 1000 kg). */
  k_ets_credits: z.number().nonnegative(),
  certificate: KetsCertificate,
});
export type KetsOutput = z.infer<typeof KetsOutput>;
