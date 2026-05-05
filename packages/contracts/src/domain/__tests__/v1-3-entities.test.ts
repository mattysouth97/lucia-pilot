// FRD §3.1, §6, §9, §9.5.2 v1.3 — sanity tests for the 6 new entities.
// Each test exercises one Zod schema with both a valid case and a deliberate
// invalid case to confirm the schema actually constrains.

import { describe, it } from 'vitest';

import {
  CommunityEvent,
  EventRSVP,
  ESGImpactSnapshot,
  Investor,
  LOI,
  SimulationResult,
  canTransition,
  computeESGEquivalents,
  CO2_KG_PER_KWH,
} from '../index.js';

// ---------------------------------------------------------------------------
// Investor — discriminated union
// ---------------------------------------------------------------------------

describe('Investor (discriminated union)', () => {
  it('valid RE100 entry parses', () => {
    Investor.parse({
      id: 'i_re100_skh',
      type: 're100',
      company_name: 'SK하이닉스',
      business_registration_number: '301-81-12345',
      contact: { name: 'ESG실', phone: '02-1234-5678', email: 'esg@skhynix.com' },
      target_re100_mwh_per_year: 50_000,
      re100_joined_year: 2022,
      re100_target_year: 2050,
      preferred_regions: ['경기남부', '대구경북'],
      expected_capex_range: { min_won: 5_000_000_000, max_won: 30_000_000_000 },
      created_at: '2026-05-05T09:00:00.000Z',
    });
  });

  it('valid retail entry parses', () => {
    Investor.parse({
      id: 'i_retail_kim',
      type: 'retail',
      individual_name: '김투자',
      contact: { name: '김투자', phone: '010-1234-5678', email: 'kim@example.com' },
      preferred_regions: ['강원'],
      expected_capex_range: { min_won: 5_000_000, max_won: 50_000_000 },
      investment_motivations: ['esg', 'local_contribution'],
      created_at: '2026-05-05T09:00:00.000Z',
    });
  });

  it('rejects RE100 entry missing target_re100_mwh_per_year', ({ expect }) => {
    const result = Investor.safeParse({
      id: 'bad',
      type: 're100',
      company_name: 'X',
      business_registration_number: '301-81-12345',
      contact: { name: 'A', phone: '02-1-1234', email: 'a@b.com' },
      // target_re100_mwh_per_year missing
      re100_joined_year: 2022,
      re100_target_year: 2050,
      expected_capex_range: { min_won: 0, max_won: 0 },
      created_at: '2026-05-05T09:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects expected_capex_range with max < min', ({ expect }) => {
    const result = Investor.safeParse({
      id: 'bad',
      type: 'retail',
      individual_name: 'X',
      contact: { name: 'X', phone: '010-1234-5678', email: 'a@b.com' },
      expected_capex_range: { min_won: 1_000_000, max_won: 500_000 }, // bad
      created_at: '2026-05-05T09:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// LOI — status transitions + hash format
// ---------------------------------------------------------------------------

describe('LOI', () => {
  const validLoi = {
    id: 'loi_001',
    investor_id: 'i_re100_skh',
    sites: ['ULJN-001', 'KGN-0042'],
    capex_won: 1_000_000_000,
    terms: { years: 20, equity_ratio_pct: 30, expected_yield_pct: 5.5 },
    status: 'submitted' as const,
    pdf_url: 'https://example.com/loi/loi_001.pdf',
    blockchain_hash: 'a'.repeat(64),
    signed_at: '2026-05-05T09:00:00.000Z',
    is_non_binding: false,
    created_at: '2026-05-05T08:00:00.000Z',
    updated_at: '2026-05-05T09:00:00.000Z',
  };

  it('valid LOI parses', () => {
    LOI.parse(validLoi);
  });

  it('rejects invalid blockchain_hash (not 64 hex)', ({ expect }) => {
    const result = LOI.safeParse({ ...validLoi, blockchain_hash: 'NOT_HEX' });
    expect(result.success).toBe(false);
  });

  it('rejects empty sites array', ({ expect }) => {
    const result = LOI.safeParse({ ...validLoi, sites: [] });
    expect(result.success).toBe(false);
  });

  it('canTransition allows draft → submitted', ({ expect }) => {
    expect(canTransition('draft', 'submitted')).toBe(true);
  });

  it('canTransition rejects approved → draft', ({ expect }) => {
    expect(canTransition('approved', 'draft')).toBe(false);
  });

  it('canTransition rejects rejected → anything', ({ expect }) => {
    expect(canTransition('rejected', 'submitted')).toBe(false);
    expect(canTransition('rejected', 'approved')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SimulationResult
// ---------------------------------------------------------------------------

describe('SimulationResult', () => {
  const bm = {
    year1_revenue_won: 10_000_000,
    cumulative_revenue_won: 200_000_000,
    net_profit_won: 50_000_000,
    roe_pct: 6.5,
    payback_years: 12.5,
    yearly_cashflows: [{ year: 1, cashflow_won: 8_000_000 }],
  };

  it('valid SimulationResult (anonymous) parses', () => {
    SimulationResult.parse({
      id: 'sim_001',
      investor_id: null,
      inputs: {
        capex_won: 100_000_000,
        years: 20,
        site_id: 'ULJN-001',
        region_office: '대구경북',
        installed_kw: 25.86,
        equity_ratio_pct: 30,
        scenario: 'base',
        sensitivity: { smp_pct: 0, rec_pct: 0, lucia_pct: 0 },
      },
      bm_a_result: bm,
      bm_b_result: bm,
      reconciled_to_xlsx: false,
      created_at: '2026-05-05T09:00:00.000Z',
    });
  });

  it('rejects scenario outside enum', ({ expect }) => {
    const result = SimulationResult.safeParse({
      id: 'sim_bad',
      investor_id: null,
      inputs: {
        capex_won: 0, years: 1, site_id: null, region_office: null,
        installed_kw: 1, equity_ratio_pct: 0,
        scenario: 'wild',  // bad
        sensitivity: { smp_pct: 0, rec_pct: 0, lucia_pct: 0 },
      },
      bm_a_result: bm,
      bm_b_result: bm,
      created_at: '2026-05-05T09:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ESGImpactSnapshot — conversion factors
// ---------------------------------------------------------------------------

describe('ESGImpactSnapshot', () => {
  it('valid snapshot parses', () => {
    ESGImpactSnapshot.parse({
      id: 'esg_h0001_2026-04',
      resident_id: 'h0001',
      period: '2026-04',
      kwh_generated: 110.7,
      co2_saved_kg: 47.0,
      equivalent_trees: 2.13,
      equivalent_km: 224,
      equivalent_household_months: 0.32,
      ranking_pct: 78,
      created_at: '2026-05-05T09:00:00.000Z',
    });
  });

  it('rejects period not in YYYY-MM format', ({ expect }) => {
    const result = ESGImpactSnapshot.safeParse({
      id: 'x', resident_id: 'h0001', period: '2026-13', // bad month
      kwh_generated: 1, co2_saved_kg: 0, equivalent_trees: 0,
      equivalent_km: 0, equivalent_household_months: 0, ranking_pct: 0,
      created_at: '2026-05-05T09:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('CO2_KG_PER_KWH is exactly 0.4244 (FRD AC ±0.001)', ({ expect }) => {
    expect(CO2_KG_PER_KWH).toBeCloseTo(0.4244, 4);
  });

  it('computeESGEquivalents reproduces the FRD example (110.7 kWh → ~47 kg CO2)', ({ expect }) => {
    // 110.7 × 0.4244 = 46.98108 kg
    const eq = computeESGEquivalents(110.7);
    expect(eq.co2_saved_kg).toBeCloseTo(46.981, 2);
    // 46.98 / 22 ≈ 2.135 trees
    expect(eq.equivalent_trees).toBeCloseTo(2.135, 2);
    // 46.98 / 0.21 ≈ 223.7 km
    expect(eq.equivalent_km).toBeCloseTo(223.72, 1);
    // 110.7 / 350 ≈ 0.316 household-months
    expect(eq.equivalent_household_months).toBeCloseTo(0.3163, 3);
  });
});

// ---------------------------------------------------------------------------
// CommunityEvent
// ---------------------------------------------------------------------------

describe('CommunityEvent', () => {
  const valid = {
    id: 'evt_2025-11-21_carbon',
    title: '입주민 참여형 탄소중립 한마당',
    description: 'LH 사업자료 PDF p.5에 명시된 ESG 행사',
    datetime: '2025-11-21T13:00:00.000Z',
    location: '울진군 평해읍',
    capacity: 200,
    photo_url: null,
    beneficiary_groups: ['LH_매입임대' as const, '국민임대' as const, '에너지소외' as const],
    status: 'past' as const,
    created_by_operator_id: 'u_operator_spc',
    created_at: '2025-11-01T00:00:00.000Z',
    updated_at: '2025-11-22T00:00:00.000Z',
  };

  it('valid past event parses', () => {
    CommunityEvent.parse(valid);
  });

  it('rejects non-positive capacity', ({ expect }) => {
    const result = CommunityEvent.safeParse({ ...valid, capacity: 0 });
    expect(result.success).toBe(false);
  });

  it('beneficiary_groups defaults to []', ({ expect }) => {
    const { beneficiary_groups: _omit, ...rest } = valid;
    void _omit;
    const parsed = CommunityEvent.parse(rest);
    expect(parsed.beneficiary_groups).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// EventRSVP
// ---------------------------------------------------------------------------

describe('EventRSVP', () => {
  it('valid RSVP parses', () => {
    EventRSVP.parse({
      id: 'rsvp_001',
      event_id: 'evt_2026-06-15_tour',
      resident_id: 'h0001',
      status: 'attending',
      rsvp_at: '2026-05-05T09:00:00.000Z',
    });
  });

  it('rejects status outside enum', ({ expect }) => {
    const result = EventRSVP.safeParse({
      id: 'r', event_id: 'e', resident_id: 'h0001',
      status: 'maybe-later',  // bad
      rsvp_at: '2026-05-05T09:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});
