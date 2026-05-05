# Analyst Dashboard — Audit-Integrity Pivot Design Spec

**Date:** 2026-05-06
**Author:** grill-me session (Claude Opus 4.7 + user)
**Owner route:** `/` for `role=analyst` (`apps/web/src/routes/Home/AnalystHome.tsx`)
**Companion plan:** `docs/superpowers/plans/2026-05-06-analyst-dashboard-audit-pivot.md`

## 1 — Stance

`AnalystHome` is an audit-integrity instrument. The single thing 김지호 처장 leaves with is "the chain has not been tampered with, and the 41% 환원 was distributed exactly per FR-S-004." Settlement-매출 figures are supporting evidence, not headline.

## 2 — The 17 decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Page purpose | Audit-integrity instrument |
| 2 | Hero number | `0 변조 시도`; 환원 분배 = second card |
| 3 | Hero treatment | Full-bleed white, monumental `0` (clamp 72–96px); no dark band |
| 4 | 매출 fate | Denominator inside audit-card formula strip; standalone HeroBand killed |
| 5 | Composition | `AnalystHome` stops wrapping `<Dashboard />`; `<ActivityZone />` extracted |
| 6 | Evidence row + footer | Provenance + zero-count integrity in evidence row; per-cohort completion in card footer |
| 7 | Hero semantics | σ3: counts attempts-with-rejection-framing. β3: live-bound, brief rose-flash on increment |
| 8 | Live-dot | Single dot in evidence row next to `마지막 검증` |
| 9 | Audit-report CTA | `감사 보고서 →` chevron-button, bottom-right of hero, same row as evidence |
| 10 | Audit card | Formula strip + 비중 % column; cohort math satisfies `sum === revenue × 0.41` |
| 11 | Ledger drill-down | Modal pattern; rejection escalates to dramatic FR-S-008 modal; same modal serves passive (engine event) and active (row click) triggers |
| 12 | Right rail | Replace `IncomeChartCard` with 30-day `감사 무결성 타임라인` (horizontal strip with rejection marks) |
| 13 | Live tx + Sankey | Live tx integrated into ledger via row-insert animation; Sankey via audit-card chevron `분배 흐름도 →` |
| 14 | Status filter | `이상만 보기` toggle in ledger toolbar; hero zero-counts clickable as filter triggers |
| 15 | Hero state matrix | `—` em-dash on load; muted last-known on stale/disconnect; gray dot on disconnect; rose dot + replace-block on unreachable |
| 16 | Greeting | Two-line overline: `안녕하세요, 김지호 처장님` / `2026.04 감사 무결성 라운드` |
| 17 | Monthly cycle | Auto-transitioning state-machine badge: 진행 중 (D-N) / 마감 임박 (D-1) / 마감 검증 중 / 마감 완료 |

## 3 — Hero state matrix (Q15)

| State | Numeral | Dot | Evidence row | Note |
|---|---|---|---|---|
| Loading | `—` (em-dash, ink-2) | gray, no pulse | em-dashes for stats | "● 검증 중..." appended |
| Fresh | `0` (full ink) | green, pulsing | full values | normal |
| Stale | last-known, muted | green, pulsing | stale values, muted | "마지막 검증 5분 전" |
| Disconnected | last-known, muted | gray, frozen | stale values, muted | "● 연결 끊김 — 13:24 기준" appended |
| Unreachable | hero replaced | rose | hidden | full-block error: "감사 엔진 연결 실패. 표시된 데이터는 신뢰할 수 없습니다." |

## 4 — Monthly cycle badge state machine (Q17)

| Period | Badge |
|---|---|
| Day 2..28 of current month | `라운드 진행 중 · 마감 예정 D-N` |
| Day 29..31 of current month | `라운드 마감 임박 · 마감 D-1` (amber) |
| Day 1 of next month, pre-seal | `마감 검증 중...` (gray dot, em-dash on figures) |
| Day 1+ of next month, post-seal | `마감 완료 · 검증 YYYY-MM-DD HH:MM` |
| Day 2+ of next month, after first new-month settlement | Card flips to new month's running, previous month gone (lives in `/audit/rounds` archive — out of scope) |

## 5 — FR-S-004 cohort math invariant

The `DISTRIBUTION_ROUND_2026_04` fixture MUST satisfy:
- `revenue × 0.41 === environ_total` (within ₩1 rounding tolerance)
- `sum(cohorts.map(c => c.households * c.per_household)) === environ_total`
- `sum(cohorts.map(c => c.share_pct)) === 1.0` (within 0.01% rounding)

## 6 — Phase 2 / out-of-scope

Engine endpoints `/audit/integrity-summary`, `/audit/integrity-timeline?days=30`, `/audit/distribution-round?period=YYYY-MM` and a WebSocket `integrity_event` payload extension to `/ws/transactions` are Phase 2. This PR uses fixtures via TanStack Query.
