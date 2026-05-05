import { z } from 'zod';

// FRD §11.1 — 매입임대주택 동
// v1.0: 116 (Pilot Uljin)
// v1.3: 9,354 nationwide across 14 region offices (LH PDF p.9)
//   The Pilot Uljin 116 keep the legacy ULJN-NNN id; the additional 9,238
//   buildings use prefix codes from REGION_OFFICES (SEO-, INC-, KGN-, …).
//   See packages/contracts/src/domain/region-office.ts.
export const BuildingStatus = z.enum(['ok', 'warn', 'alert', 'maintenance']);
export type BuildingStatus = z.infer<typeof BuildingStatus>;

// v1.3: deployment lifecycle for FR-R-002 catalog filter and FR-O-005
// marker styling. Distinct from `status` (runtime health) — orthogonal concept.
export const DeploymentStatus = z.enum(['planned', 'construction', 'operating']);
export type DeploymentStatus = z.infer<typeof DeploymentStatus>;

// Building ID regex.
// v1.0: /^ULJN-\d{3}$/ (Pilot Uljin only).
// v1.3: relaxed to permit multi-region prefixes — every value valid before
// (ULJN-001..ULJN-116) is still valid; the validator just permits more.
// Decision logged in docs/IMPLEMENTATION_LOG.md (Decisions 2026-05-05).
//
// Format: 3–4 uppercase letters, hyphen, 3–4 digits.
//   Pilot:    ULJN-001 .. ULJN-116
//   v1.3:     SEO-0001 .. SEO-1307, INC-0001 .. INC-1054, etc.
export const BUILDING_ID_REGEX = /^[A-Z]{3,4}-\d{3,4}$/;

export const Building = z.object({
  building_id: z.string().regex(BUILDING_ID_REGEX),
  region_office: z.string(),
  city: z.string(),
  district: z.string(),
  address: z.string(),
  lat: z.number().min(33).max(43),
  lng: z.number().min(124).max(132),
  installed_kw: z.number().positive(),
  inverter_count: z.number().int().positive(),
  install_date: z.string().date(),
  status: BuildingStatus,
  // v1.3 fields — additive, optional. Existing ULJN fixtures parse without them.
  // FR-R-002 catalog and FR-O-005 explorer require these for the 9,354 cohort.
  deployment_status: DeploymentStatus.optional(),
  expected_yield_pct: z.number().min(0).max(15).optional(),
  est_capex_won: z.number().int().nonnegative().optional(),
});
export type Building = z.infer<typeof Building>;
