// FR-R-005 §4 — registerSignedLOI integration tests.
// Exercises generate → hash → upsert → transition pipeline end-to-end.

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { registerSignedLOI } from '../../../src/lib/loi/blockchain-hash.js';
import { __resetLOIStoreForTests, getLOI, upsertLOI } from '../../../src/lib/loi/store.js';

import type { Investor, LOI } from '@lucia/contracts/domain';

const RE100_INVESTOR: Investor = {
  id: 'i_test_skh',
  type: 're100',
  company_name: 'TestCorp',
  business_registration_number: '301-81-99999',
  contact: { name: 'TestPM', phone: '02-1234-5678', email: 't@example.com' },
  target_re100_mwh_per_year: 1000,
  re100_joined_year: 2022,
  re100_target_year: 2050,
  preferred_regions: ['서울'],
  expected_capex_range: { min_won: 1_000_000, max_won: 100_000_000 },
  created_at: '2026-05-05T00:00:00.000Z',
};

const DRAFT_LOI: LOI = {
  id: 'loi_test_001',
  investor_id: 'i_test_skh',
  sites: ['ULJN-001'],
  capex_won: 100_000_000,
  terms: { years: 20, equity_ratio_pct: 30, expected_yield_pct: 5.0 },
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
  // Suppress the [FR-S-007 mock] log noise in test output.
  vi.spyOn(console, 'info').mockImplementation(() => undefined);
});

describe('registerSignedLOI — happy path', () => {
  it('returns loi + document + mockTxId', async () => {
    upsertLOI(DRAFT_LOI);
    const result = await registerSignedLOI({
      input: { loi: DRAFT_LOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001'] },
      signedAt: '2026-05-05T09:00:00.000Z',
    });
    expect(result.loi.id).toBe(DRAFT_LOI.id);
    expect(result.document.html.length).toBeGreaterThan(100);
    expect(result.document.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.mockTxId).toMatch(/^mock-tx-loi_test_001-/);
  });

  it('persists blockchain_hash + signed_at + status=submitted to the store', async () => {
    upsertLOI(DRAFT_LOI);
    const signedAt = '2026-05-05T09:00:00.000Z';
    const result = await registerSignedLOI({
      input: { loi: DRAFT_LOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001'] },
      signedAt,
    });
    const persisted = getLOI(DRAFT_LOI.id);
    expect(persisted).toBeDefined();
    expect(persisted?.blockchain_hash).toBe(result.document.hash);
    expect(persisted?.signed_at).toBe(signedAt);
    expect(persisted?.status).toBe('submitted');
  });

  it('mock tx id has stable shape (mock-tx-{loi_id}-{base36 timestamp})', async () => {
    upsertLOI(DRAFT_LOI);
    const result = await registerSignedLOI({
      input: { loi: DRAFT_LOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001'] },
      signedAt: '2026-05-05T09:00:00.000Z',
    });
    expect(result.mockTxId).toMatch(/^mock-tx-loi_test_001-[0-9a-z]+$/);
  });

  it('logs a [FR-S-007 mock] line with hash + signed_at + tx_id', async () => {
    const spy = vi.spyOn(console, 'info');
    upsertLOI(DRAFT_LOI);
    await registerSignedLOI({
      input: { loi: DRAFT_LOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001'] },
      signedAt: '2026-05-05T09:00:00.000Z',
    });
    expect(spy).toHaveBeenCalledWith(
      '[FR-S-007 mock] LOI hash registered',
      expect.objectContaining({
        loi_id: 'loi_test_001',
        hash: expect.stringMatching(/^[0-9a-f]{64}$/),
        signed_at: '2026-05-05T09:00:00.000Z',
        mock_tx_id: expect.stringMatching(/^mock-tx-loi_test_001-/),
      }),
    );
  });
});

describe('registerSignedLOI — non-draft starting status', () => {
  it('does NOT transition status when starting from a non-draft state', async () => {
    // Pre-existing 'submitted' LOI being re-registered (e.g. operator re-runs).
    const submittedLOI: LOI = { ...DRAFT_LOI, status: 'submitted' };
    upsertLOI(submittedLOI);
    const result = await registerSignedLOI({
      input: { loi: submittedLOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001'] },
      signedAt: '2026-05-05T09:00:00.000Z',
    });
    expect(result.loi.status).toBe('submitted');
    // Hash + signed_at still updated
    expect(getLOI(submittedLOI.id)?.blockchain_hash).toBe(result.document.hash);
  });
});

describe('registerSignedLOI — hash determinism + sensitivity', () => {
  it('same input → same hash across calls', async () => {
    upsertLOI(DRAFT_LOI);
    const a = await registerSignedLOI({
      input: { loi: DRAFT_LOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001'] },
      signedAt: '2026-05-05T09:00:00.000Z',
    });
    __resetLOIStoreForTests();
    upsertLOI(DRAFT_LOI);
    const b = await registerSignedLOI({
      input: { loi: DRAFT_LOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001'] },
      signedAt: '2026-05-05T09:00:00.000Z',
    });
    expect(a.document.hash).toBe(b.document.hash);
  });

  it('different signedAt → different hash (timestamp is in the document)', async () => {
    upsertLOI(DRAFT_LOI);
    const a = await registerSignedLOI({
      input: { loi: DRAFT_LOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001'] },
      signedAt: '2026-05-05T09:00:00.000Z',
    });
    __resetLOIStoreForTests();
    upsertLOI(DRAFT_LOI);
    const b = await registerSignedLOI({
      input: { loi: DRAFT_LOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001'] },
      signedAt: '2026-05-06T09:00:00.000Z',
    });
    expect(a.document.hash).not.toBe(b.document.hash);
  });
});
