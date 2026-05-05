// FRD §1 v1.3 strategic pivot — 14 LH 지역본부 (regional offices)
// Source: LH 사업자료 PDF p.9 (전국 매입임대주택 분포)
// Authoritative for FR-R-002 (catalog), FR-O-005 (GIS explorer), FR-R-003 (RE100 onboarding).

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enum (Zod + TS)
// ---------------------------------------------------------------------------

export const RegionOffice = z.enum([
  '서울',
  '인천',
  '경기남부',
  '경기북부',
  '부산울산',
  '강원',
  '충북',
  '대전충남',
  '전북',
  '광주전남',
  '경남',
  '제주',
  '세종',
  '대구경북',
]);
export type RegionOffice = z.infer<typeof RegionOffice>;

// ---------------------------------------------------------------------------
// Per-region metadata (totals + centroid + slug + colour token)
// ---------------------------------------------------------------------------

export interface RegionOfficeMeta {
  /** Human-readable Korean name (matches the enum value). */
  readonly name: RegionOffice;
  /** Stable 3–4 char prefix used for non-Pilot building_id (e.g. SEO-0001). */
  readonly prefix: string;
  /** Total number of buildings in this region per LH PDF p.9 (sum = 9,354). */
  readonly buildingCount: number;
  /** Centroid lat (degrees, EPSG:4326). Used as base for ±0.5° marker jitter. */
  readonly centroidLat: number;
  /** Centroid lng (degrees, EPSG:4326). */
  readonly centroidLng: number;
  /** Tailwind-style HSL token used by the FR-O-005 14-region colour coding. */
  readonly color: string;
}

// IMPORTANT: building counts MUST sum to exactly 9,354 (FRD §1.2 v1.3).
// 대구경북's 1,079 includes the 116 Pilot Uljin buildings (ULJN-001..ULJN-116).
// Centroids are approximate metropolitan/provincial midpoints; ±0.5° jitter
// in the seed generator is large enough to spread markers visibly without
// crossing into neighbouring regions.
export const REGION_OFFICES: readonly RegionOfficeMeta[] = [
  { name: '서울',     prefix: 'SEO', buildingCount: 1307, centroidLat: 37.5665, centroidLng: 126.9780, color: 'hsl(212 76% 52%)' },
  { name: '인천',     prefix: 'INC', buildingCount: 1054, centroidLat: 37.4563, centroidLng: 126.7052, color: 'hsl(196 76% 50%)' },
  { name: '경기남부', prefix: 'KGN', buildingCount: 1545, centroidLat: 37.2750, centroidLng: 127.0090, color: 'hsl(168 64% 42%)' },
  { name: '경기북부', prefix: 'KGB', buildingCount:  692, centroidLat: 37.8228, centroidLng: 127.1503, color: 'hsl(148 56% 44%)' },
  { name: '부산울산', prefix: 'BSU', buildingCount:  785, centroidLat: 35.1796, centroidLng: 129.0756, color: 'hsl(20 78% 52%)'  },
  { name: '강원',     prefix: 'KWN', buildingCount:  336, centroidLat: 37.8228, centroidLng: 128.1555, color: 'hsl(220 38% 56%)' },
  { name: '충북',     prefix: 'CHB', buildingCount:  341, centroidLat: 36.6283, centroidLng: 127.9296, color: 'hsl(96 50% 46%)'  },
  { name: '대전충남', prefix: 'DCN', buildingCount:  522, centroidLat: 36.6588, centroidLng: 127.0000, color: 'hsl(264 44% 56%)' },
  { name: '전북',     prefix: 'JNB', buildingCount:  432, centroidLat: 35.7175, centroidLng: 127.1530, color: 'hsl(46 78% 50%)'  },
  { name: '광주전남', prefix: 'GJN', buildingCount:  512, centroidLat: 35.1595, centroidLng: 126.8526, color: 'hsl(296 48% 56%)' },
  { name: '경남',     prefix: 'GNM', buildingCount:  684, centroidLat: 35.4606, centroidLng: 128.2132, color: 'hsl(0 64% 56%)'   },
  { name: '제주',     prefix: 'JEJ', buildingCount:   62, centroidLat: 33.4996, centroidLng: 126.5312, color: 'hsl(184 58% 44%)' },
  { name: '세종',     prefix: 'SJN', buildingCount:    3, centroidLat: 36.4800, centroidLng: 127.2890, color: 'hsl(40 64% 50%)'  },
  { name: '대구경북', prefix: 'DGB', buildingCount: 1079, centroidLat: 35.8714, centroidLng: 128.6014, color: 'hsl(338 60% 52%)' },
] as const satisfies readonly RegionOfficeMeta[];

// Compile-time-checked total. Mismatch produces a TS2367 (comparison always
// false) at the const-assertion below — fast-fail before any seed runs.
export const TOTAL_BUILDINGS_NATIONWIDE = 9354 as const;

// Sum-check at module load. Throws on mismatch — keeps the LH PDF totals
// honest. The constant is exported so tests can assert directly.
export const REGION_OFFICES_SUM: number = REGION_OFFICES.reduce(
  (acc, r) => acc + r.buildingCount,
  0,
);
if (REGION_OFFICES_SUM !== TOTAL_BUILDINGS_NATIONWIDE) {
  throw new Error(
    `[region-office] FATAL: REGION_OFFICES counts sum to ${REGION_OFFICES_SUM}, expected ${TOTAL_BUILDINGS_NATIONWIDE}`,
  );
}

// Convenience lookups
export const REGION_BY_NAME: ReadonlyMap<RegionOffice, RegionOfficeMeta> = new Map(
  REGION_OFFICES.map((r) => [r.name, r]),
);
export const REGION_BY_PREFIX: ReadonlyMap<string, RegionOfficeMeta> = new Map(
  REGION_OFFICES.map((r) => [r.prefix, r]),
);

/** Number of Pilot Uljin buildings (FR-D-001) reserved inside 대구경북's 1,079. */
export const PILOT_ULJIN_COUNT = 116 as const;
