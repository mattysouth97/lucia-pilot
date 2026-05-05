import { describe, it } from 'vitest';

import { Building } from '../../domain/building.js';
import {
  PILOT_ULJIN_COUNT,
  REGION_OFFICES,
  REGION_OFFICES_SUM,
  TOTAL_BUILDINGS_NATIONWIDE,
} from '../../domain/region-office.js';
import { BUILDINGS_NATIONWIDE } from '../buildings-nationwide.js';

describe('BUILDINGS_NATIONWIDE — totals and integrity', () => {
  it('REGION_OFFICES counts sum to TOTAL_BUILDINGS_NATIONWIDE (9,354)', ({ expect }) => {
    expect(REGION_OFFICES_SUM).toBe(TOTAL_BUILDINGS_NATIONWIDE);
    expect(TOTAL_BUILDINGS_NATIONWIDE).toBe(9354);
  });

  it('BUILDINGS_NATIONWIDE has exactly 9,354 entries', ({ expect }) => {
    expect(BUILDINGS_NATIONWIDE).toHaveLength(9354);
  });

  it('every building_id is unique', ({ expect }) => {
    const ids = new Set(BUILDINGS_NATIONWIDE.map((b) => b.building_id));
    expect(ids.size).toBe(BUILDINGS_NATIONWIDE.length);
  });

  it('every entry passes Building.parse() (Coherence Guard 3)', () => {
    for (const b of BUILDINGS_NATIONWIDE) {
      Building.parse(b);
    }
  });
});

describe('BUILDINGS_NATIONWIDE — per-region counts match REGION_OFFICES targets', () => {
  for (const region of REGION_OFFICES) {
    it(`region ${region.name} has exactly ${region.buildingCount} buildings`, ({ expect }) => {
      const found = BUILDINGS_NATIONWIDE.filter((b) => b.region_office === region.name).length;
      expect(found).toBe(region.buildingCount);
    });
  }
});

describe('BUILDINGS_NATIONWIDE — Pilot Uljin invariants (UC-3 must keep working)', () => {
  it(`exactly ${PILOT_ULJIN_COUNT} ULJN-prefixed buildings exist`, ({ expect }) => {
    const uljin = BUILDINGS_NATIONWIDE.filter((b) => b.building_id.startsWith('ULJN-'));
    expect(uljin).toHaveLength(PILOT_ULJIN_COUNT);
  });

  it('ULJN-001 .. ULJN-116 are all present', ({ expect }) => {
    const uljinIds = new Set(
      BUILDINGS_NATIONWIDE.filter((b) => b.building_id.startsWith('ULJN-')).map((b) => b.building_id),
    );
    for (let i = 1; i <= PILOT_ULJIN_COUNT; i++) {
      const id = `ULJN-${String(i).padStart(3, '0')}`;
      expect(uljinIds.has(id), `${id} missing`).toBe(true);
    }
  });

  it('every ULJN-* building has deployment_status=operating', ({ expect }) => {
    const uljin = BUILDINGS_NATIONWIDE.filter((b) => b.building_id.startsWith('ULJN-'));
    for (const b of uljin) {
      expect(b.deployment_status, `${b.building_id} not operating`).toBe('operating');
    }
  });

  it('ULJN buildings sit inside region 대구경북', ({ expect }) => {
    const uljin = BUILDINGS_NATIONWIDE.filter((b) => b.building_id.startsWith('ULJN-'));
    for (const b of uljin) {
      expect(b.region_office, `${b.building_id} wrong region`).toBe('대구경북');
    }
  });

  it('ULJN buildings keep installed_kw=25.86 (FRD §11.3 pin)', ({ expect }) => {
    const uljin = BUILDINGS_NATIONWIDE.filter((b) => b.building_id.startsWith('ULJN-'));
    for (const b of uljin) {
      expect(b.installed_kw).toBe(25.86);
    }
  });
});

describe('BUILDINGS_NATIONWIDE — deployment_status distribution sanity', () => {
  it('non-Uljin buildings have a roughly 20/30/50 planned/construction/operating mix', ({ expect }) => {
    const nonUljin = BUILDINGS_NATIONWIDE.filter((b) => !b.building_id.startsWith('ULJN-'));
    let planned = 0;
    let construction = 0;
    let operating = 0;
    for (const b of nonUljin) {
      switch (b.deployment_status) {
        case 'planned':      planned++; break;
        case 'construction': construction++; break;
        case 'operating':    operating++; break;
        default: throw new Error(`unexpected deployment_status: ${b.deployment_status}`);
      }
    }
    const total = nonUljin.length;
    expect(total).toBe(9354 - PILOT_ULJIN_COUNT);

    // Allow ±5 percentage points wiggle around 20/30/50.
    const plannedPct = (planned / total) * 100;
    const constructionPct = (construction / total) * 100;
    const operatingPct = (operating / total) * 100;
    expect(plannedPct).toBeGreaterThan(15);
    expect(plannedPct).toBeLessThan(25);
    expect(constructionPct).toBeGreaterThan(25);
    expect(constructionPct).toBeLessThan(35);
    expect(operatingPct).toBeGreaterThan(45);
    expect(operatingPct).toBeLessThan(55);
  });
});

describe('BUILDINGS_NATIONWIDE — financial fields are populated and sane', () => {
  it('every building has expected_yield_pct in [4, 7]', ({ expect }) => {
    for (const b of BUILDINGS_NATIONWIDE) {
      expect(b.expected_yield_pct).toBeDefined();
      expect(b.expected_yield_pct!).toBeGreaterThanOrEqual(4);
      expect(b.expected_yield_pct!).toBeLessThanOrEqual(7);
    }
  });

  it('every building has est_capex_won within ±15% of capacity × 4M won/kW', ({ expect }) => {
    for (const b of BUILDINGS_NATIONWIDE) {
      expect(b.est_capex_won).toBeDefined();
      const expected = b.installed_kw * 4_000_000;
      const lo = expected * 0.85;
      const hi = expected * 1.15;
      expect(b.est_capex_won!).toBeGreaterThanOrEqual(Math.floor(lo));
      expect(b.est_capex_won!).toBeLessThanOrEqual(Math.ceil(hi));
    }
  });
});
