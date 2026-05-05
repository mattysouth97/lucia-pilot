# Lucia Pilot Prototype — FRD v1.3 구현 작업 (v1.3.1 prompt update)

> v1.3.1 prompt update: FR-O-006 financial simulator has been substantially
> revised to investor-equity perspective only. This file supersedes the
> earlier `CLAUDE_CODE_PROMPTv1.3.md`. The substantive change is in §2-B
> (FR-O-006). All other sections retained verbatim from v1.3.

## Mission

본 작업은 **FRD-2026-001 v1.3** 의 사양에 맞춰 Lucia Pilot prototype 코드베이스를
**완전히 구현**하는 것이다. v1.3 신규/승격 11개 FR을 모두 구현 가능한 상태로
마무리한 후에만 작업 종료를 선언할 수 있다.

## v1.3.1 changes (FR-O-006 deltas)

핵심: 본 시뮬레이터는 **투자자의 출자액 관점**만 다룬다. TheKIE 내부 BM A vs BM B
비교는 별도 전략 도구이며 **본 시뮬레이터에 노출 금지**.

### 핵심 입력 (3-slider capital structure, sum auto-normalised to 100%)

| Slider | Range | Notes |
|---|---|---|
| Project equity | 0~100% | 자기자본 |
| KEA 재생에너지지원사업 융자금 | **0~80% (cap)** | 한국에너지공단 한도, 80% 초과 시 80%로 cap |
| 기타 부채 | 0~remaining | commercial debt |

### KEA loan default terms (overridable via Collapsible)

| 항목 | 기본값 | UI range |
|---|---|---|
| 금리 | 1.75% | 0~5% |
| 거치기간 (이자만) | 5년 | 0~10년 |
| 상환기간 (원리금균등) | 10년 | 5~20년 |

### 핵심 결과 (investor-perspective 4 cards)

- 출자액 대비 누적 분배 (won)
- **Equity IRR (%)** — internal rate of return
- **Payback Period** (년)
- **ROI Multiple** (배수)

### 결과 차트 (no BM A/B comparison)

- 자본 구조 도넛 차트 (Project Equity / KEA loan / Other debt + 절대 금액)
- 프로젝트 30년 cash flow ComposedChart
- 투자자 분배 흐름 (line + cumulative bar)
- KEA 융자금 상환 스케줄 표 (year, interest, principal, remaining)
- 발전수익 → {운영비, 41% 환원, 부채 상환, 분배가능 → 본인 share} Sankey

### Required disclaimers (PDF + UI)

1. `"본 시뮬레이션은 가정 기반이며 실제 수익을 보장하지 않습니다."`
2. `"재생에너지지원사업 융자금 적용은 한국에너지공단 심사 후 확정됩니다."`

### 명시적 금지 사항

- BM A vs BM B 비교 차트를 시뮬레이터에 추가하지 말 것 (투자자 혼동 위험)
- BM A/B 단어를 투자자 facing UI 카피에 노출하지 말 것
- TheKIE Lucia SaaS / KIE-REMS 매출을 투자자 분배에 포함하지 말 것

### 모듈/함수 신규 명세

```ts
// packages/finance/src/investor-model.ts
export function simulateInvestorReturn(input: SimulationInput): InvestorResult;
export function validateCapitalStructure(cs: CapitalStructure): { valid: boolean; error?: string };
export function generateKEALoanSchedule(loan_amount: number, terms: KEALoanTerms): KEALoanScheduleRow[];
```

```ts
// packages/finance/src/assumptions.ts
export const BASE_ASSUMPTIONS = {
  smp_won_per_kwh: 119,
  rec_won_per_mwh: 70_000,
  rec_weight: 1.2,
  daily_generation_hours: 3.6,
  efficiency_decay_pct: 0.5,
  lucia_saas_won_per_building_month: 50_000,
  kie_rems_won_per_building_month: 30_000,
  oem_pct_of_revenue: 5.0,
  housing_subsidy_pct_of_revenue: 41,
  kea_loan_default_rate_pct: 1.75,
  kea_loan_default_grace_years: 5,
  kea_loan_default_repayment_years: 10,
  kea_loan_max_pct: 80,
  other_debt_default_rate_pct: 4.5,
  capex_won_per_kw: 4_000_000,
} as const;

export const SCENARIOS = {
  conservative: { smp_multiplier: 0.85, rec_multiplier: 0.85, efficiency_multiplier: 0.95 },
  base:         { smp_multiplier: 1.00, rec_multiplier: 1.00, efficiency_multiplier: 1.00 },
  optimistic:   { smp_multiplier: 1.15, rec_multiplier: 1.15, efficiency_multiplier: 1.05 },
} as const;
```

## Other FRs (FR-R-002~006, FR-O-005, FR-M-009/010)

Identical to the v1.3 prompt — no semantic changes. Refer to FRD-2026-001.md
v1.3 §9.5.2 / §9 / §6 for full requirements.

## Anti-patterns specific to v1.3.1

Adds to the v1.3 anti-pattern list:

- BM A/B 비교 차트를 FR-O-006 시뮬레이터에 추가 ❌
- 투자자 facing UI에서 "BM A" / "BM B" 라는 용어 노출 ❌
- TheKIE SaaS 매출을 투자자 returns 에 포함 ❌
- KEA 융자금 80% 한도를 ignore ❌
- 융자금 심사 disclaimer 누락 ❌

## Reference

- FRD-2026-001.md v1.3 (markdown source of truth, this directory)
- docs/IMPLEMENTATION_LOG.md (durable progress log)
- Earlier v1.3 prompt preserved at docs/frd/CLAUDE_CODE_PROMPTv1.3.md (legacy)
