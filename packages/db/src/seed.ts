/**
 * Drizzle seed script — FRD §11.3 seed data targets.
 *
 * Inserts:
 *   - 116 buildings (ULJN-001 … ULJN-116) across 10 Uljin districts
 *   - 2,839 beneficiary rows (1,643 LH 매입임대 + 280 국민임대 + 916 에너지소외)
 *     distributed proportionally across buildings
 *   - 3 mock residents (NFR-4 masked names, mock_login_token UUIDs)
 *   - 4 RE100 mock companies (FR-X-004)
 *
 * Idempotent: every INSERT uses ON CONFLICT DO NOTHING.
 *
 * Run:
 *   DATABASE_URL=postgres://... pnpm --filter @lucia/db seed
 */
/* eslint-disable no-console */

import 'dotenv/config';
import { SHARE_RATIO_PINNED, SUBSIDY_PINNED } from '@lucia/contracts';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

if (!process.env['DATABASE_URL']) {
  throw new Error('DATABASE_URL environment variable is required');
}

const connectionString = process.env['DATABASE_URL'];
const pg = postgres(connectionString, { max: 1 });
const db = drizzle(pg, { schema });

// ---------------------------------------------------------------------------
// District data — 10 dong-level regions in 울진군 (Uljin-gun)
// ---------------------------------------------------------------------------

interface District {
  name: string;
  lat_base: number;
  lng_base: number;
  street_prefix: string;
}

const DISTRICTS: District[] = [
  { name: '울진읍',  lat_base: 36.993, lng_base: 129.404, street_prefix: '읍내로' },
  { name: '근남면',  lat_base: 36.947, lng_base: 129.387, street_prefix: '근남길' },
  { name: '기성면',  lat_base: 36.875, lng_base: 129.386, street_prefix: '기성로' },
  { name: '온정면',  lat_base: 36.861, lng_base: 129.258, street_prefix: '온정로' },
  { name: '후포면',  lat_base: 36.686, lng_base: 129.456, street_prefix: '후포항길' },
  { name: '북면',   lat_base: 37.066, lng_base: 129.362, street_prefix: '북면로' },
  { name: '평해읍',  lat_base: 36.736, lng_base: 129.390, street_prefix: '평해로' },
  { name: '죽변면',  lat_base: 37.053, lng_base: 129.425, street_prefix: '죽변항길' },
  { name: '원남면',  lat_base: 36.952, lng_base: 129.262, street_prefix: '원남로' },
  { name: '서면',   lat_base: 37.005, lng_base: 129.280, street_prefix: '서면길' },
];

// Distribute 116 buildings across 10 districts (roughly even; last district absorbs remainder)
const BUILDINGS_PER_DISTRICT = Math.floor(116 / DISTRICTS.length); // 11
const REMAINDER = 116 - BUILDINGS_PER_DISTRICT * DISTRICTS.length; // 6

// ---------------------------------------------------------------------------
// Building generation helpers
// ---------------------------------------------------------------------------

function buildingId(n: number): string {
  return `ULJN-${String(n).padStart(3, '0')}`;
}

function districtForIndex(idx: number): { district: District; localSeq: number } {
  // idx is 0-based (0 … 115)
  let running = 0;
  for (let d = 0; d < DISTRICTS.length; d++) {
    const count = BUILDINGS_PER_DISTRICT + (d < REMAINDER ? 1 : 0);
    if (idx < running + count) {
      return { district: DISTRICTS[d]!, localSeq: idx - running + 1 };
    }
    running += count;
  }
  // Fallback (should never reach)
  return { district: DISTRICTS[DISTRICTS.length - 1]!, localSeq: idx + 1 };
}

// Tiny deterministic jitter so coordinates are not identical within a district
function jitter(base: number, seq: number, scale: number): number {
  return Math.round((base + (seq * scale) % 0.05) * 1e5) / 1e5;
}

// ---------------------------------------------------------------------------
// Beneficiary count distribution across buildings
// ---------------------------------------------------------------------------

// FRD §11.3 totals: LH 1,643 + 국민임대 280 + 에너지소외 916 = 2,839
const CATEGORY_TOTALS = {
  LH_매입임대:  1643,
  국민임대:    280,
  에너지소외:  916,
} as const;

type BeneficiaryCategory = keyof typeof CATEGORY_TOTALS;

/**
 * Distributes `total` households across `count` buildings proportionally.
 * Returns an array of per-building counts that sums exactly to `total`.
 */
function distributeHouseholds(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

// ---------------------------------------------------------------------------
// RE100 companies
// ---------------------------------------------------------------------------

interface Re100Company {
  id: string;
  name: string;
  target_pct: number;
  current_pct: number;
}

const RE100_COMPANIES: Re100Company[] = [
  { id: 're100-sk-hynix',    name: 'SK하이닉스',  target_pct: 100, current_pct: 42.3 },
  { id: 're100-samsung',     name: '삼성전자',    target_pct: 100, current_pct: 38.7 },
  { id: 're100-naver',       name: '네이버',      target_pct: 100, current_pct: 71.2 },
  { id: 're100-kia',         name: '기아',        target_pct: 100, current_pct: 29.5 },
];

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function seed(): Promise<void> {
  console.log('[seed] Starting Lucia Pilot seed — FRD §11.3');

  // --- 1. Buildings ---
  console.log('[seed] Inserting 116 buildings…');

  const buildingRows: schema.BuildingInsert[] = Array.from({ length: 116 }, (_, i) => {
    const n = i + 1;
    const id = buildingId(n);
    const { district, localSeq } = districtForIndex(i);

    // Pinned anomaly statuses per spec
    let status: 'ok' | 'warn' | 'alert' | 'maintenance' = 'ok';
    if (id === 'ULJN-042') status = 'alert';
    if (id === 'ULJN-058') status = 'warn';

    return {
      building_id:    id,
      region_office:  '울진군청',
      city:           '경상북도 울진군',
      district:       district.name,
      address:        `경상북도 울진군 ${district.name} ${district.street_prefix} ${localSeq * 7}`,
      lat:            jitter(district.lat_base, localSeq, 0.003),
      lng:            jitter(district.lng_base, localSeq, 0.004),
      installed_kw:   '25.860', // 25.86 kW per FRD §11.3
      inverter_count: 1,
      install_date:   '2024-03-01',
      status,
    };
  });

  const buildingResult = await db
    .insert(schema.buildings)
    .values(buildingRows)
    .onConflictDoNothing()
    .returning({ building_id: schema.buildings.building_id });

  console.log(`[seed]   buildings inserted: ${buildingResult.length}`);

  // --- 2. Beneficiaries ---
  console.log('[seed] Inserting beneficiary rows across 116 buildings…');

  const categories: BeneficiaryCategory[] = ['LH_매입임대', '국민임대', '에너지소외'];
  const beneficiaryRows: schema.BeneficiaryInsert[] = [];

  for (const category of categories) {
    const total = CATEGORY_TOTALS[category];
    const distribution = distributeHouseholds(total, 116);
    const shareRatio = SHARE_RATIO_PINNED[category];
    const subsidyPerHousehold = SUBSIDY_PINNED[category];

    for (let i = 0; i < 116; i++) {
      const householdCount = distribution[i]!;
      if (householdCount === 0) continue;

      beneficiaryRows.push({
        beneficiary_id:               `BEN-${buildingId(i + 1)}-${category}`,
        building_id:                  buildingId(i + 1),
        category,
        household_count:              householdCount,
        share_ratio:                  String(shareRatio),
        monthly_subsidy_per_household: String(subsidyPerHousehold),
      });
    }
  }

  const beneficiaryResult = await db
    .insert(schema.beneficiaries)
    .values(beneficiaryRows)
    .onConflictDoNothing()
    .returning({ beneficiary_id: schema.beneficiaries.beneficiary_id });

  console.log(`[seed]   beneficiary rows inserted: ${beneficiaryResult.length}`);

  // Verify totals
  const lhTotal = CATEGORY_TOTALS['LH_매입임대'];
  const kmTotal = CATEGORY_TOTALS['국민임대'];
  const eoTotal = CATEGORY_TOTALS['에너지소외'];
  console.log(`[seed]   household totals — LH 매입임대: ${lhTotal}, 국민임대: ${kmTotal}, 에너지소외: ${eoTotal}`);

  // --- 3. Mock residents (FR-M-007, NFR-4 PII masking) ---
  console.log('[seed] Inserting 3 mock residents…');

  const residentRows: schema.ResidentInsert[] = [
    {
      resident_id:      'RES-001',
      beneficiary_id:   `BEN-ULJN-001-LH_매입임대`,
      category:         'LH_매입임대',
      building_id:      'ULJN-001',
      masked_name:      '홍*동',
      mock_login_token: 'a1b2c3d4-0001-4000-8000-000000000001',
    },
    {
      resident_id:      'RES-002',
      beneficiary_id:   `BEN-ULJN-012-LH_매입임대`,
      category:         'LH_매입임대',
      building_id:      'ULJN-012',
      masked_name:      '김*수',
      mock_login_token: 'a1b2c3d4-0001-4000-8000-000000000002',
    },
    {
      resident_id:      'RES-003',
      beneficiary_id:   `BEN-ULJN-025-LH_매입임대`,
      category:         'LH_매입임대',
      building_id:      'ULJN-025',
      masked_name:      '이*경',
      mock_login_token: 'a1b2c3d4-0001-4000-8000-000000000003',
    },
  ];

  const residentResult = await db
    .insert(schema.residents)
    .values(residentRows)
    .onConflictDoNothing()
    .returning({ resident_id: schema.residents.resident_id });

  console.log(`[seed]   residents inserted: ${residentResult.length}`);

  // --- 4. RE100 companies as JSON — stored in a raw SQL table if it exists,
  //        otherwise logged for reference (schema includes no re100 table yet).
  //        FR-X-004 references these companies by name in the settlement engine. ---
  console.log('[seed] RE100 companies (FR-X-004):');
  for (const co of RE100_COMPANIES) {
    console.log(`[seed]   ${co.id} — ${co.name} (RE100 target ${co.target_pct}%, current ${co.current_pct}%)`);
  }

  // --- 5. KIE-REMS sim master data --- stored as raw JSON for wk4 loader.
  //        Engine reads this at startup to configure per-building inverter master.
  const kieRemsSeed = {
    regions: DISTRICTS.map((d, i) => ({
      region_id:    `KIE-REGION-${String(i + 1).padStart(2, '0')}`,
      name:         d.name,
      lat_base:     d.lat_base,
      lng_base:     d.lng_base,
    })),
    inverters: Array.from({ length: 116 }, (_, i) => ({
      inverter_id:  `INV-${buildingId(i + 1)}`,
      building_id:  buildingId(i + 1),
      model:        'SolarEdge SE25K',
      installed_kw: 25.86,
    })),
  };

  // Persist KIE-REMS seed as a config row via Drizzle (seed_config table is managed
  // by migration 0003_seed_config.sql; engine reads via SELECT value FROM seed_config WHERE key = 'kie_rems').
  await db
    .insert(schema.seedConfig)
    .values({ key: 'kie_rems', value: kieRemsSeed })
    .onConflictDoNothing();

  console.log(
    `[seed]   KIE-REMS seed stored: ${kieRemsSeed.regions.length} regions, ${kieRemsSeed.inverters.length} inverters`,
  );

  console.log('[seed] Done.');
  await pg.end();
}

seed().catch((err: unknown) => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
