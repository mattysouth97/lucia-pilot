// FRD §11.3 v1.3 — demo fixtures used by the M+3 LH 시연 + investor flows.
//
// Five investors (4 RE100 + 1 retail), three LOI in different states, two
// community events (one past, one upcoming, the past event matches LH PDF
// p.5's 25.11.21 입주민 참여형 탄소중립 한마당), nine ESG-impact snapshots
// (3 demo residents × 3 most-recent months).
//
// All entries pass their respective Zod schemas — see
// __tests__/v1-3-demo.test.ts.

import { computeESGEquivalents } from '../domain/esg-impact.js';
import type {
  CommunityEvent,
  ESGImpactSnapshot,
  Investor,
  LOI,
} from '../domain/index.js';

// ---------------------------------------------------------------------------
// Investors — 4 RE100 corporates + 1 retail individual
// ---------------------------------------------------------------------------

export const DEMO_INVESTORS: readonly Investor[] = Object.freeze([
  {
    id: 'i_re100_skh',
    type: 're100',
    company_name: 'SK하이닉스',
    business_registration_number: '301-81-12345',
    contact: { name: 'ESG실 박재현', phone: '02-3459-8000', email: 'esg@skhynix.com' },
    target_re100_mwh_per_year: 50_000,
    re100_joined_year: 2022,
    re100_target_year: 2050,
    preferred_regions: ['경기남부', '대구경북'],
    expected_capex_range: { min_won: 5_000_000_000, max_won: 30_000_000_000 },
    created_at: '2026-04-12T01:00:00.000Z',
  },
  {
    id: 'i_re100_samsung',
    type: 're100',
    company_name: '삼성전자',
    business_registration_number: '124-81-00998',
    contact: { name: 'ESG팀 김연희', phone: '031-200-1114', email: 'esg@samsung.com' },
    target_re100_mwh_per_year: 80_000,
    re100_joined_year: 2022,
    re100_target_year: 2050,
    preferred_regions: ['경기남부', '경기북부', '서울'],
    expected_capex_range: { min_won: 10_000_000_000, max_won: 50_000_000_000 },
    created_at: '2026-04-21T03:00:00.000Z',
  },
  {
    id: 'i_re100_naver',
    type: 're100',
    company_name: '네이버',
    business_registration_number: '220-81-62517',
    contact: { name: '지속가능경영실 최민수', phone: '031-784-2700', email: 'esg@navercorp.com' },
    target_re100_mwh_per_year: 35_000,
    re100_joined_year: 2020,
    re100_target_year: 2040,
    preferred_regions: ['경기남부'],
    expected_capex_range: { min_won: 3_000_000_000, max_won: 15_000_000_000 },
    created_at: '2026-04-28T05:00:00.000Z',
  },
  {
    id: 'i_re100_kia',
    type: 're100',
    company_name: '기아',
    business_registration_number: '119-81-02554',
    contact: { name: 'ESG실 정수현', phone: '02-3464-1114', email: 'esg@kia.com' },
    target_re100_mwh_per_year: 22_000,
    re100_joined_year: 2022,
    re100_target_year: 2040,
    preferred_regions: ['광주전남', '경기남부'],
    expected_capex_range: { min_won: 2_500_000_000, max_won: 12_000_000_000 },
    created_at: '2026-04-30T02:00:00.000Z',
  },
  {
    id: 'i_retail_kim',
    type: 'retail',
    individual_name: '김투자',
    contact: { name: '김투자', phone: '010-2345-6789', email: 'kim.invest@example.com' },
    preferred_regions: ['강원'],
    expected_capex_range: { min_won: 5_000_000, max_won: 50_000_000 },
    investment_motivations: ['esg', 'local_contribution'],
    created_at: '2026-05-02T09:00:00.000Z',
  },
] as const satisfies readonly Investor[]);

// ---------------------------------------------------------------------------
// LOIs — 3 entries spanning the workflow
// ---------------------------------------------------------------------------

export const DEMO_LOIS: readonly LOI[] = Object.freeze([
  // 1) SK하이닉스 — submitted (under TheKIE BD review)
  {
    id: 'loi_skh_2026_q2',
    investor_id: 'i_re100_skh',
    sites: ['KGN-0042', 'KGN-0148', 'KGN-0203', 'DGB-0019'],
    capex_won: 8_000_000_000,
    terms: { years: 20, equity_ratio_pct: 30, expected_yield_pct: 5.4 },
    status: 'submitted',
    pdf_url: 'https://demo.thekie.app/lois/loi_skh_2026_q2.pdf',
    blockchain_hash:
      'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678901234567890abcdef123456',
    signed_at: '2026-04-29T07:30:00.000Z',
    is_non_binding: false,
    created_at: '2026-04-29T07:00:00.000Z',
    updated_at: '2026-04-29T07:30:00.000Z',
  },
  // 2) 김투자 retail — draft (still editing)
  {
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
  },
  // 3) SK하이닉스 — approved (earlier round, ready for contract)
  {
    id: 'loi_skh_2026_q1',
    investor_id: 'i_re100_skh',
    sites: ['ULJN-001', 'ULJN-014', 'ULJN-073'],
    capex_won: 600_000_000,
    terms: { years: 20, equity_ratio_pct: 25, expected_yield_pct: 5.6 },
    status: 'approved',
    pdf_url: 'https://demo.thekie.app/lois/loi_skh_2026_q1.pdf',
    blockchain_hash:
      'b2c3d4e5f60718293a4b5c6d7e8f9012345678901234567890abcdef123456a1',
    signed_at: '2026-02-14T03:00:00.000Z',
    is_non_binding: false,
    created_at: '2026-02-14T02:30:00.000Z',
    updated_at: '2026-04-08T12:00:00.000Z',
  },
] as const satisfies readonly LOI[]);

// ---------------------------------------------------------------------------
// Community events — one past (LH PDF p.5 reference), one upcoming
// ---------------------------------------------------------------------------

export const DEMO_EVENTS: readonly CommunityEvent[] = Object.freeze([
  {
    id: 'evt_2025_11_21_carbon_festival',
    title: '입주민 참여형 탄소중립 한마당',
    description:
      '울진 매입임대 햇빛발전소 1주년 기념 입주민 참여형 ESG 행사입니다. ' +
      '발전 실적 공유, 탄소절감 체험 부스, 농산물 나눔이 진행되었습니다.',
    datetime: '2025-11-21T04:00:00.000Z', // 13:00 KST
    location: '경상북도 울진군 평해읍 평해체육공원',
    capacity: 200,
    photo_url: null,
    beneficiary_groups: ['LH_매입임대', '국민임대', '에너지소외'],
    status: 'past',
    created_by_operator_id: 'u_operator_spc',
    created_at: '2025-10-15T01:00:00.000Z',
    updated_at: '2025-11-22T08:30:00.000Z',
  },
  {
    id: 'evt_2026_06_15_village_tour',
    title: '울진 매입임대 햇빛발전소 마을투어',
    description:
      '입주민과 가족이 함께 참여하는 발전소 견학 + 인근 농가 체험 행사입니다. ' +
      '점심 도시락과 농산물 선물세트가 제공됩니다. 사전 RSVP 필수.',
    datetime: '2026-06-15T01:00:00.000Z', // 10:00 KST
    location: '경상북도 울진군 죽변면 죽변항 주변',
    capacity: 80,
    photo_url: null,
    beneficiary_groups: [],
    status: 'upcoming',
    created_by_operator_id: 'u_operator_spc',
    created_at: '2026-05-04T02:00:00.000Z',
    updated_at: '2026-05-04T02:00:00.000Z',
  },
] as const satisfies readonly CommunityEvent[]);

// ---------------------------------------------------------------------------
// ESG snapshots — 3 demo residents × 3 most-recent months (Feb/Mar/Apr 2026)
// kWh figures derived from a single ULJN building (~110 kWh/month/resident),
// then split across the 3 residents per FR-S-004 share ratios.
// computeESGEquivalents() centralises the conversion math (FR-M-009).
// ---------------------------------------------------------------------------

interface ResidentMonthlyMix { resident_id: string; kwh_2026_02: number; kwh_2026_03: number; kwh_2026_04: number; ranking_pct: number; }

const RESIDENT_MIX: readonly ResidentMonthlyMix[] = [
  // h0001 LH 매입임대 (largest cohort) — moderate kWh share, mid percentile
  { resident_id: 'h0001', kwh_2026_02: 92.4, kwh_2026_03: 105.7, kwh_2026_04: 110.7, ranking_pct: 64 },
  // k0014 국민임대 — slightly lower kWh, lower percentile
  { resident_id: 'k0014', kwh_2026_02: 81.2, kwh_2026_03: 92.0,  kwh_2026_04: 98.5,  ranking_pct: 41 },
  // e0042 에너지소외 — highest per-household share (largest subsidy), top percentile
  { resident_id: 'e0042', kwh_2026_02: 113.6, kwh_2026_03: 128.4, kwh_2026_04: 134.2, ranking_pct: 88 },
];

function snapshot(resident_id: string, period: string, kwh: number, ranking_pct: number): ESGImpactSnapshot {
  const eq = computeESGEquivalents(kwh);
  return {
    id: `esg_${resident_id}_${period}`,
    resident_id,
    period,
    kwh_generated: round2(kwh),
    co2_saved_kg: round2(eq.co2_saved_kg),
    equivalent_trees: round2(eq.equivalent_trees),
    equivalent_km: round2(eq.equivalent_km),
    equivalent_household_months: round2(eq.equivalent_household_months),
    ranking_pct,
    created_at: '2026-05-01T00:00:00.000Z',
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const DEMO_ESG_IMPACTS: readonly ESGImpactSnapshot[] = Object.freeze(
  RESIDENT_MIX.flatMap((r) => [
    snapshot(r.resident_id, '2026-02', r.kwh_2026_02, r.ranking_pct),
    snapshot(r.resident_id, '2026-03', r.kwh_2026_03, r.ranking_pct),
    snapshot(r.resident_id, '2026-04', r.kwh_2026_04, r.ranking_pct),
  ]),
);
