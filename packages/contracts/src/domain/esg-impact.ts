// FRD §6 v1.3 — ESGImpactSnapshot (FR-M-009 입주민 ESG 임팩트 dashboard)
//
// One row per resident per month. Records cumulative kWh attributable to the
// resident's building plus pre-computed conversions for visualisation:
//   - CO2 saved (kWh × 0.4244 kg/kWh, 환경부 표준)
//   - equivalent trees (CO2 / 22 kg per pine per year)
//   - equivalent vehicle km (CO2 / 0.21 kgCO2/km)
//   - household-month equivalents (kWh / 350)
// FRD AC: 환산계수 0.4244 kg/kWh ±0.001 — pinned constant below.

import { z } from 'zod';

/** kg CO₂ avoided per kWh of solar generation (환경부 표준 — FR-M-009 §1-A). */
export const CO2_KG_PER_KWH = 0.4244 as const;
/** kg CO₂ absorbed per pine tree per year (FRD pinning). */
export const CO2_KG_PER_TREE_YEAR = 22 as const;
/** kg CO₂ emitted per km driven (gasoline-equivalent). */
export const CO2_KG_PER_KM = 0.21 as const;
/** Average household monthly electricity consumption (kWh) — FRD pinning. */
export const HOUSEHOLD_MONTHLY_KWH = 350 as const;

export const ESGImpactSnapshot = z.object({
  id: z.string().min(1),
  resident_id: z.string().min(1),
  /** YYYY-MM (e.g. '2026-04'). */
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  kwh_generated: z.number().nonnegative(),
  co2_saved_kg: z.number().nonnegative(),
  equivalent_trees: z.number().nonnegative(),
  equivalent_km: z.number().nonnegative(),
  equivalent_household_months: z.number().nonnegative(),
  /** Resident's percentile within their building's 116-cohort. 0 = lowest, 100 = top. */
  ranking_pct: z.number().min(0).max(100),
  created_at: z.string().datetime(),
});
export type ESGImpactSnapshot = z.infer<typeof ESGImpactSnapshot>;

/**
 * Pure conversion helper — derives the four equivalents from raw kWh.
 * Same math the ESG-impact computation should use; centralising here so
 * both the seed and the FR-M-009 component share the formulas.
 */
export function computeESGEquivalents(kwh: number): {
  co2_saved_kg: number;
  equivalent_trees: number;
  equivalent_km: number;
  equivalent_household_months: number;
} {
  const co2_saved_kg = kwh * CO2_KG_PER_KWH;
  return {
    co2_saved_kg,
    equivalent_trees: co2_saved_kg / CO2_KG_PER_TREE_YEAR,
    equivalent_km: co2_saved_kg / CO2_KG_PER_KM,
    equivalent_household_months: kwh / HOUSEHOLD_MONTHLY_KWH,
  };
}
