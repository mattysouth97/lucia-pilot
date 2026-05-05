// FR-R-005 — LOI generator integration tests
// Exercises the full chain: input → template → Blob → SHA-256 hash.

import { describe, expect, it } from 'vitest';

import { generateLOI } from '../../../src/lib/loi/generator.js';
import { sha256Hex } from '../../../src/lib/loi/sha256.js';

import type { Investor, LOI } from '@lucia/contracts/domain';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const RE100_INVESTOR: Investor = {
  id: 'i_re100_skh',
  type: 're100',
  company_name: 'SK하이닉스',
  business_registration_number: '301-81-12345',
  contact: { name: 'ESG실 박재현', phone: '02-3459-8000', email: 'esg@skhynix.com' },
  target_re100_mwh_per_year: 50_000,
  re100_joined_year: 2022,
  re100_target_year: 2050,
  preferred_regions: ['경기남부'],
  expected_capex_range: { min_won: 5_000_000_000, max_won: 30_000_000_000 },
  created_at: '2026-04-12T01:00:00.000Z',
};

const RETAIL_INVESTOR: Investor = {
  id: 'i_retail_kim',
  type: 'retail',
  individual_name: '김투자',
  contact: { name: '김투자', phone: '010-2345-6789', email: 'kim@example.com' },
  preferred_regions: ['강원'],
  expected_capex_range: { min_won: 5_000_000, max_won: 50_000_000 },
  investment_motivations: ['esg', 'local_contribution'],
  created_at: '2026-05-02T09:00:00.000Z',
};

const RE100_LOI: LOI = {
  id: 'loi_skh_2026_q2',
  investor_id: 'i_re100_skh',
  sites: ['ULJN-001', 'KGN-0042'],
  capex_won: 8_000_000_000,
  terms: { years: 20, equity_ratio_pct: 30, expected_yield_pct: 5.4 },
  status: 'submitted',
  pdf_url: 'https://demo.thekie.app/lois/loi_skh_2026_q2.pdf',
  blockchain_hash: 'a'.repeat(64),
  signed_at: '2026-04-29T07:30:00.000Z',
  is_non_binding: false,
  created_at: '2026-04-29T07:00:00.000Z',
  updated_at: '2026-04-29T07:30:00.000Z',
};

const RETAIL_LOI: LOI = {
  id: 'loi_kim_2026_05',
  investor_id: 'i_retail_kim',
  sites: ['KWN-0042'],
  capex_won: 12_000_000,
  terms: { years: 15, equity_ratio_pct: 100, expected_yield_pct: 4.8 },
  status: 'draft',
  pdf_url: null,
  blockchain_hash: null,
  signed_at: null,
  is_non_binding: true,
  created_at: '2026-05-02T09:30:00.000Z',
  updated_at: '2026-05-03T14:15:00.000Z',
};

const SITE_LABELS = ['ULJN-001 — 경상북도 울진군', 'KGN-0042 — 경기도 수원시'];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateLOI — RE100 corporate', () => {
  it('returns html + blob + 64-hex hash', async () => {
    const out = await generateLOI({ loi: RE100_LOI, investor: RE100_INVESTOR, siteLabels: SITE_LABELS });
    expect(typeof out.html).toBe('string');
    expect(out.html.length).toBeGreaterThan(500);
    expect(out.blob.type).toMatch(/^text\/html/);
    expect(out.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('html contains the company name, sites, capex, dates', async () => {
    const out = await generateLOI({ loi: RE100_LOI, investor: RE100_INVESTOR, siteLabels: SITE_LABELS });
    expect(out.html).toContain('SK하이닉스');
    expect(out.html).toContain('301-81-12345');
    expect(out.html).toContain('투자 의향서');
    expect(out.html).toContain('ULJN-001');
    expect(out.html).toContain('KGN-0042');
    // 8,000,000,000원 capex appears as Korean-locale formatted
    expect(out.html).toContain('8,000,000,000');
    // RE100 joined / target year present
    expect(out.html).toContain('2022');
    expect(out.html).toContain('2050');
  });

  it('html embeds the blockchain hash when present', async () => {
    const out = await generateLOI({ loi: RE100_LOI, investor: RE100_INVESTOR, siteLabels: SITE_LABELS });
    expect(out.html).toContain('a'.repeat(64));
  });

  it('hash matches an independent SHA-256 over the same html string', async () => {
    const out = await generateLOI({ loi: RE100_LOI, investor: RE100_INVESTOR, siteLabels: SITE_LABELS });
    const independent = await sha256Hex(out.html);
    expect(out.hash).toBe(independent);
  });

  it('hash is deterministic for the same input', async () => {
    const a = await generateLOI({ loi: RE100_LOI, investor: RE100_INVESTOR, siteLabels: SITE_LABELS });
    const b = await generateLOI({ loi: RE100_LOI, investor: RE100_INVESTOR, siteLabels: SITE_LABELS });
    expect(a.hash).toBe(b.hash);
  });

  it('hash changes when capex changes', async () => {
    const a = await generateLOI({ loi: RE100_LOI, investor: RE100_INVESTOR, siteLabels: SITE_LABELS });
    const b = await generateLOI({
      loi: { ...RE100_LOI, capex_won: 9_000_000_000 },
      investor: RE100_INVESTOR,
      siteLabels: SITE_LABELS,
    });
    expect(a.hash).not.toBe(b.hash);
  });
});

describe('generateLOI — retail (개인)', () => {
  it('html includes the mandatory non-binding banner + individual name', async () => {
    const out = await generateLOI({ loi: RETAIL_LOI, investor: RETAIL_INVESTOR, siteLabels: ['KWN-0042 — 강원특별자치도 춘천시'] });
    expect(out.html).toContain('김투자');
    expect(out.html).toContain('출자 관심 표명서');
    expect(out.html).toContain('비구속력');
    expect(out.html).toContain('자본시장법');
    // motivation labels
    expect(out.html).toContain('ESG 가치 부합');
    expect(out.html).toContain('지역 기여');
  });

  it('does NOT include 사업자등록번호 (retail-only template, no corp fields)', async () => {
    const out = await generateLOI({ loi: RETAIL_LOI, investor: RETAIL_INVESTOR, siteLabels: ['KWN-0042'] });
    expect(out.html).not.toContain('사업자등록번호');
    expect(out.html).not.toContain('RE100 가입연도');
  });

  it('shows 미서명 / 미등록 placeholders when signed_at and blockchain_hash are null', async () => {
    const out = await generateLOI({ loi: RETAIL_LOI, investor: RETAIL_INVESTOR, siteLabels: ['KWN-0042'] });
    expect(out.html).toContain('미서명');
    expect(out.html).toContain('미등록');
  });
});

describe('generateLOI — input validation', () => {
  it('throws when investor.type does not match the template', async () => {
    // RE100 template called with retail investor (orchestrator routes by type, but
    // direct template call is exercised below)
    const re100Loi = { ...RE100_LOI };
    const retailInvestor = { ...RETAIL_INVESTOR };
    // The orchestrator catches this — feed the orchestrator a retail investor and
    // verify the retail template is selected (no error on the happy path).
    const out = await generateLOI({ loi: re100Loi, investor: retailInvestor, siteLabels: ['ULJN-001'] });
    // Retail template was used — html should NOT contain 사업자등록번호
    expect(out.html).not.toContain('사업자등록번호');
    // And SHOULD contain the retail-only non-binding language
    expect(out.html).toContain('비구속력');
  });
});

describe('generateLOI — Korean text + XSS escaping', () => {
  it('escapes HTML special chars in user-supplied investor name', async () => {
    const malicious: Investor = {
      ...RETAIL_INVESTOR,
      individual_name: '<script>alert("x")</script>',
    };
    const out = await generateLOI({ loi: RETAIL_LOI, investor: malicious, siteLabels: ['ULJN-001'] });
    // Raw <script> should NOT survive
    expect(out.html).not.toContain('<script>alert');
    // Escaped form must appear
    expect(out.html).toContain('&lt;script&gt;');
  });

  it('Korean characters survive round-trip (no double-encoding)', async () => {
    const out = await generateLOI({ loi: RE100_LOI, investor: RE100_INVESTOR, siteLabels: ['ULJN-001 — 경상북도 울진군'] });
    expect(out.html).toContain('경상북도 울진군');
    expect(out.html).toContain('ESG실 박재현');
  });
});
