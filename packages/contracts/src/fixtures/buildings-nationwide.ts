// FRD §1 v1.3 — 9,354-building nationwide catalog (Pilot Uljin 116 + 9,238 others)
//
// Deterministic generator: same input always produces same output. Consumed by:
//   - FR-R-002 (investor catalog grid + filter panel)
//   - FR-O-005 (Kakao Maps explorer)
//   - FR-R-006 (investor portfolio AUM rollups)
//
// Pilot Uljin 116 (`ULJN-001`..`ULJN-116`) are the legacy P3 buildings — they
// keep their legacy ID, sit inside region '대구경북', and are forced to
// `deployment_status='operating'` per the v1.3 prompt.
//
// The other 9,238 use REGION_OFFICES[].prefix + 4-digit sequence. Per-region
// distribution: ~20% planned, ~30% construction, ~50% operating.
//
// All values pass Building.parse() — see __tests__/buildings-nationwide.test.ts.

import {
  type Building,
  type DeploymentStatus,
  PILOT_ULJIN_COUNT,
  REGION_OFFICES,
  type RegionOfficeMeta,
} from '../domain/index.js';

// ---------------------------------------------------------------------------
// Per-region city/district roster (시 + 구)
// Compact, representative; building i in region picks roster[i % len].
// ---------------------------------------------------------------------------

interface CityDistrict {
  readonly city: string;
  readonly district: string;
}

const REGION_CITIES: Record<RegionOfficeMeta['name'], readonly CityDistrict[]> = {
  '서울':     [
    { city: '서울특별시', district: '강남구' },
    { city: '서울특별시', district: '관악구' },
    { city: '서울특별시', district: '노원구' },
    { city: '서울특별시', district: '마포구' },
    { city: '서울특별시', district: '성북구' },
  ],
  '인천':     [
    { city: '인천광역시', district: '남동구' },
    { city: '인천광역시', district: '부평구' },
    { city: '인천광역시', district: '서구' },
    { city: '인천광역시', district: '연수구' },
  ],
  '경기남부': [
    { city: '경기도 수원시', district: '영통구' },
    { city: '경기도 성남시', district: '분당구' },
    { city: '경기도 화성시', district: '동탄' },
    { city: '경기도 용인시', district: '기흥구' },
    { city: '경기도 안산시', district: '단원구' },
  ],
  '경기북부': [
    { city: '경기도 의정부시', district: '용현동' },
    { city: '경기도 고양시', district: '일산동구' },
    { city: '경기도 양주시', district: '회천동' },
    { city: '경기도 파주시', district: '운정동' },
  ],
  '부산울산': [
    { city: '부산광역시', district: '해운대구' },
    { city: '부산광역시', district: '사하구' },
    { city: '부산광역시', district: '북구' },
    { city: '울산광역시', district: '남구' },
    { city: '울산광역시', district: '동구' },
  ],
  '강원':     [
    { city: '강원특별자치도 춘천시', district: '석사동' },
    { city: '강원특별자치도 원주시', district: '단계동' },
    { city: '강원특별자치도 강릉시', district: '교동' },
  ],
  '충북':     [
    { city: '충청북도 청주시', district: '서원구' },
    { city: '충청북도 충주시', district: '연수동' },
    { city: '충청북도 제천시', district: '하소동' },
  ],
  '대전충남': [
    { city: '대전광역시', district: '유성구' },
    { city: '대전광역시', district: '서구' },
    { city: '충청남도 천안시', district: '서북구' },
    { city: '충청남도 아산시', district: '배방읍' },
  ],
  '전북':     [
    { city: '전북특별자치도 전주시', district: '덕진구' },
    { city: '전북특별자치도 군산시', district: '나운동' },
    { city: '전북특별자치도 익산시', district: '영등동' },
  ],
  '광주전남': [
    { city: '광주광역시', district: '광산구' },
    { city: '광주광역시', district: '북구' },
    { city: '전라남도 목포시', district: '하당' },
    { city: '전라남도 여수시', district: '국동' },
  ],
  '경남':     [
    { city: '경상남도 창원시', district: '의창구' },
    { city: '경상남도 김해시', district: '내외동' },
    { city: '경상남도 진주시', district: '신안동' },
  ],
  '제주':     [
    { city: '제주특별자치도 제주시', district: '노형동' },
    { city: '제주특별자치도 서귀포시', district: '대정읍' },
  ],
  '세종':     [
    { city: '세종특별자치시', district: '한솔동' },
  ],
  '대구경북': [
    { city: '대구광역시', district: '달서구' },
    { city: '대구광역시', district: '북구' },
    { city: '경상북도 포항시', district: '북구' },
    { city: '경상북도 경주시', district: '용강동' },
    { city: '경상북도 안동시', district: '옥동' },
  ],
};

// 116 Pilot Uljin districts (lifted compact from packages/db/src/seed.ts)
const ULJIN_DISTRICTS: readonly string[] = [
  '울진읍', '근남면', '기성면', '온정면', '후포면',
  '북면',   '평해읍', '죽변면', '원남면', '서면',
];

// ---------------------------------------------------------------------------
// Mulberry32 PRNG — deterministic, in-process. Each region uses a distinct
// seed offset so the streams don't interfere.
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stable seed (won't change build-to-build). Bump if catalog data needs to change deterministically.
const NATIONWIDE_SEED_BASE = 0xC1A0_2026;

// ---------------------------------------------------------------------------
// Per-row generators
// ---------------------------------------------------------------------------

function jitterDeg(rng: () => number, base: number): number {
  // ±0.5° uniform
  return Math.round((base + (rng() - 0.5)) * 1e5) / 1e5;
}

function pickInstalledKw(rng: () => number): number {
  // 15–45 kW uniform; mean ≈ 30. ULJN locked to 25.86 in the Pilot section below.
  const v = 15 + rng() * 30;
  return Math.round(v * 100) / 100;
}

function pickExpectedYield(rng: () => number): number {
  // 4–7%
  return Math.round((4 + rng() * 3) * 100) / 100;
}

function pickCapex(installed_kw: number, rng: () => number): number {
  // 4,000,000 ± 10% per kW
  const perKw = 4_000_000 * (0.9 + rng() * 0.2);
  return Math.round(installed_kw * perKw);
}

function pickDeployment(rng: () => number): DeploymentStatus {
  // ~20% planned / 30% construction / 50% operating
  const r = rng();
  if (r < 0.2) return 'planned';
  if (r < 0.5) return 'construction';
  return 'operating';
}

function pickInstallDate(deployment: DeploymentStatus, rng: () => number): string {
  if (deployment === 'operating') {
    // 2024 or 2025
    const year = rng() < 0.5 ? 2024 : 2025;
    const month = 1 + Math.floor(rng() * 12);
    const day = 1 + Math.floor(rng() * 28);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  if (deployment === 'construction') {
    // 2026 install target
    const month = 1 + Math.floor(rng() * 12);
    const day = 1 + Math.floor(rng() * 28);
    return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  // planned: nominal future date
  return '2027-06-01';
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

function generateNationwideBuildings(): Building[] {
  const out: Building[] = [];

  // 1. Pilot Uljin — 116 buildings, deployment_status='operating' (forced).
  //    region_office is '대구경북' (the v1.3 14-region taxonomy); the legacy
  //    seed.ts uses '울진군청' which is not in the v1.3 enum. Both views
  //    coexist: the engine's seed.ts owns the canonical persistence and we
  //    don't touch it (P3 freeze). This nationwide fixture is what FR-R-002
  //    and FR-O-005 read.
  const uljinRng = mulberry32(NATIONWIDE_SEED_BASE ^ 0xDEAD_BEEF);
  for (let i = 0; i < PILOT_ULJIN_COUNT; i++) {
    const seq = i + 1;
    const id = `ULJN-${String(seq).padStart(3, '0')}`;
    const district = ULJIN_DISTRICTS[i % ULJIN_DISTRICTS.length]!;
    out.push({
      building_id: id,
      region_office: '대구경북',
      city: '경상북도 울진군',
      district,
      address: `경상북도 울진군 ${district} 매입임대 ${seq}`,
      lat: jitterDeg(uljinRng, 36.99),
      lng: jitterDeg(uljinRng, 129.40),
      installed_kw: 25.86, // FRD §11.3 Pilot fixed
      inverter_count: 2,
      install_date: '2024-03-15',
      status: 'ok',
      deployment_status: 'operating',
      expected_yield_pct: pickExpectedYield(uljinRng),
      est_capex_won: pickCapex(25.86, uljinRng),
    });
  }

  // 2. The other 13 regions + DGB (대구경북 minus its 116 Pilot Uljin).
  for (const region of REGION_OFFICES) {
    const targetCount =
      region.name === '대구경북'
        ? region.buildingCount - PILOT_ULJIN_COUNT // 1079 - 116 = 963
        : region.buildingCount;

    if (targetCount <= 0) continue;

    const cities = REGION_CITIES[region.name];
    if (cities.length === 0) {
      throw new Error(`[buildings-nationwide] no cities for region ${region.name}`);
    }

    // Distinct sub-seed per region — independent streams, deterministic ordering.
    const rng = mulberry32(NATIONWIDE_SEED_BASE ^ hashStr(region.prefix));

    for (let i = 0; i < targetCount; i++) {
      const seq = i + 1;
      const id = `${region.prefix}-${String(seq).padStart(4, '0')}`;
      const cd = cities[i % cities.length]!;
      const installed_kw = pickInstalledKw(rng);
      const deployment = pickDeployment(rng);

      out.push({
        building_id: id,
        region_office: region.name,
        city: cd.city,
        district: cd.district,
        address: `${cd.city} ${cd.district} 매입임대 ${seq}`,
        lat: jitterDeg(rng, region.centroidLat),
        lng: jitterDeg(rng, region.centroidLng),
        installed_kw,
        inverter_count: installed_kw < 25 ? 1 : 2,
        install_date: pickInstallDate(deployment, rng),
        status: 'ok',
        deployment_status: deployment,
        expected_yield_pct: pickExpectedYield(rng),
        est_capex_won: pickCapex(installed_kw, rng),
      });
    }
  }

  return out;
}

// FNV-1a 32-bit string hash — used to derive deterministic per-region PRNG seeds.
function hashStr(s: string): number {
  let h = 0x811c_9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h;
}

/**
 * Nationwide 9,354-building catalog. Generated once at module load; immutable
 * thereafter. Pinned PRNG seed → deterministic across builds.
 *
 * - Length: 9,354 (14-region totals per LH PDF p.9 verified by REGION_OFFICES_SUM).
 * - Pilot Uljin: ULJN-001..ULJN-116, all `deployment_status='operating'`.
 * - All entries pass Building.parse() (verified by fixtures.test.ts).
 */
export const BUILDINGS_NATIONWIDE: readonly Building[] = Object.freeze(
  generateNationwideBuildings(),
);
