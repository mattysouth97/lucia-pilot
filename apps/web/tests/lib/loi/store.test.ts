import { beforeEach, describe, expect, it } from 'vitest';

import {
  __resetLOIStoreForTests,
  getLOI,
  listLOIs,
  listLOIsByInvestor,
  transitionLOI,
  upsertLOI,
} from '../../../src/lib/loi/store.js';

import type { LOI } from '@lucia/contracts/domain';

const FRESH_LOI: LOI = {
  id: 'loi_unit_001',
  investor_id: 'i_re100_skh',
  sites: ['ULJN-001'],
  capex_won: 200_000_000,
  terms: { years: 10, equity_ratio_pct: 50, expected_yield_pct: 5.0 },
  status: 'draft',
  pdf_url: null,
  blockchain_hash: null,
  signed_at: null,
  is_non_binding: false,
  created_at: '2026-05-05T00:00:00.000Z',
  updated_at: '2026-05-05T00:00:00.000Z',
};

beforeEach(() => {
  __resetLOIStoreForTests();
});

describe('LOI store — seed-on-first-read', () => {
  it('first listLOIs() returns the 3-row demo seed', () => {
    const all = listLOIs();
    expect(all).toHaveLength(3);
    const ids = new Set(all.map((l) => l.id));
    expect(ids.has('loi_skh_2026_q2')).toBe(true);
    expect(ids.has('loi_kim_2026_05')).toBe(true);
    expect(ids.has('loi_skh_2026_q1')).toBe(true);
  });

  it('getLOI() returns undefined for an unknown id', () => {
    expect(getLOI('loi_does_not_exist')).toBeUndefined();
  });

  it('getLOI() returns the seeded LOI for a known id', () => {
    const l = getLOI('loi_skh_2026_q2');
    expect(l?.status).toBe('submitted');
  });

  it('listLOIsByInvestor() filters to the right investor', () => {
    const skh = listLOIsByInvestor('i_re100_skh');
    expect(skh).toHaveLength(2);
    const kim = listLOIsByInvestor('i_retail_kim');
    expect(kim).toHaveLength(1);
    const none = listLOIsByInvestor('i_unknown');
    expect(none).toHaveLength(0);
  });
});

describe('LOI store — upsert', () => {
  it('upsertLOI() adds a new LOI when id is unknown', () => {
    const before = listLOIs().length;
    upsertLOI(FRESH_LOI);
    const after = listLOIs().length;
    expect(after).toBe(before + 1);
    expect(getLOI(FRESH_LOI.id)?.capex_won).toBe(200_000_000);
  });

  it('upsertLOI() updates an existing LOI in place', () => {
    upsertLOI(FRESH_LOI);
    upsertLOI({ ...FRESH_LOI, capex_won: 300_000_000 });
    expect(getLOI(FRESH_LOI.id)?.capex_won).toBe(300_000_000);
  });

  it('upsertLOI() bumps updated_at to "now"', () => {
    const result = upsertLOI(FRESH_LOI);
    // Updated_at should be a recent ISO timestamp (within last minute).
    const dt = new Date(result.updated_at);
    expect(Date.now() - dt.getTime()).toBeLessThan(60_000);
  });
});

describe('LOI store — transitionLOI (FR-R-005 §6 workflow)', () => {
  it('moves draft → submitted', () => {
    upsertLOI(FRESH_LOI);
    const out = transitionLOI(FRESH_LOI.id, 'submitted');
    expect(out.status).toBe('submitted');
  });

  it('rejects draft → approved (must go through submitted/under_review first)', () => {
    upsertLOI(FRESH_LOI);
    expect(() => transitionLOI(FRESH_LOI.id, 'approved')).toThrow(/cannot transition/);
  });

  it('rejects rejected → submitted (terminal status)', () => {
    upsertLOI({ ...FRESH_LOI, status: 'rejected' });
    expect(() => transitionLOI(FRESH_LOI.id, 'submitted')).toThrow(/cannot transition/);
  });

  it('rejects unknown id', () => {
    expect(() => transitionLOI('loi_unknown', 'submitted')).toThrow(/not found/);
  });

  it('full happy path draft → submitted → under_review → approved → contract', () => {
    upsertLOI(FRESH_LOI);
    transitionLOI(FRESH_LOI.id, 'submitted');
    transitionLOI(FRESH_LOI.id, 'under_review');
    transitionLOI(FRESH_LOI.id, 'approved');
    const final = transitionLOI(FRESH_LOI.id, 'contract');
    expect(final.status).toBe('contract');
  });
});
