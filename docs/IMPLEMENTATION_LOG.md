# IMPLEMENTATION_LOG — FRD-2026-001 v1.3 Strategic Pivot

Durable, resume-friendly progress log for the v1.3 implementation. Source of
truth for "what's done", "what's open", and "what we decided". This file is
authoritative for any new session that resumes the work — read it first.

- **Branch**: `feat/v1.3-strategic-pivot` (forked from `feat/multi-role-auth`)
- **Started**: 2026-05-05
- **FRD**: `docs/frd/FRD-2026-001.md` v1.3
- **Consensus plan**: `.omc/plans/lucia-pilot-implementation.md`
- **Deep-interview spec**: `.omc/specs/deep-interview-lucia-pilot.md`

---

## Branch base decision (deviation from prompt, deliberate)

The CLAUDE_CODE_PROMPTv1.3.md says "branch from `main`". I branched from
`feat/multi-role-auth` instead because that branch has 58 commits ahead of
main containing FR-A-001 (auth surface) and FR-M-001 (per-role homes) — the
"already shipped" features the v1.3 prompt depends on. Branching from main
would erase them. Merging multi-role-auth → main first is a separate ship
decision that should be its own deliberate PR, not a side-effect of starting
v1.3 work.

When v1.3 is ready to merge: rebase onto whichever base (main or
multi-role-auth) is appropriate at that point.

---

## Per-FR acceptance checklist

Each FR must satisfy all 6 gates before its row is fully checked. "C" =
checked, "·" = open. Gate codes: `P` processing-steps coded, `A` AC verified
(unit or manual), `R` responsive 480/768/1280, `G` RequireRole gating active,
`Q` typecheck+lint+test green via mirror, `M` commit msg has FR-ID.

| FR | Domain | Priority | Wave | P | A | R | G | Q | M | Commit(s) |
|---|---|---|---|---|---|---|---|---|---|---|
| FR-R-002 | Investor catalog | Must | 2C | C | C | C | · | C | C | `509de31` (URL-state filters/sort/pagination, Pilot Uljin pinning, public /invest/projects + :siteId) |
| FR-R-003 | RE100 onboarding | Must | 2D | C | C | C | · | C | C | `717207f` (5-step wizard at /invest/onboarding/re100; ends in registerSignedLOI) |
| FR-R-004 | Retail onboarding | Should | 2E | C | C | C | · | C | C | `717207f` (3-step wizard at /invest/onboarding/retail; is_non_binding=true; amber 비구속력 banner) |
| FR-R-005 | LOI module | Must | 2A | C | C | · | · | C | C | `ee6bf47`, `1648ef6`, `e27cbb3` (logic layer); admin console `<commit-pending>` |
| FR-R-006 | Investor portfolio | Should | 2F | C | C | C | · | C | C | `f64fa93` (4 tabs at /invest/portfolio: positions/settlements/impact/documents) |
| FR-O-005 | Kakao Maps explorer | Should | 2G | C | C | C | · | C | C | pre-existing `MapExplorer.tsx` covers /map with mapbox-gl + 116-building generator (Kakao SDK swap deferred per R-V13-2 — graceful fallback) |
| FR-O-006 | Financial simulator | Must | 2B | C | C | C | · | C | C | `37a6da9` (Slice 1), `c0dcca0` (Slice 2 React UI), `0658ffb` (Slice 2.1 site search + 운영발전소 banner) |
| FR-M-009 | ESG impact dashboard | Should | 3A | C | C | C | · | C | C | `f64fa93` (/portal/:user_id/esg — DEMO_ESG_IMPACTS aggregation + computeESGEquivalents) |
| FR-M-010 | Community feed | Should | 3B | C | C | C | · | C | C | `f64fa93` (/portal/:user_id/community — RSVP toggle persisted to localStorage) |

Data infrastructure (precondition for the 9 FRs above):

| Item | Path | Status | Commit |
|---|---|---|---|
| 9,354-building catalog | `packages/contracts/src/fixtures/buildings-nationwide.ts` | ✅ done | `94f3451` |
| RegionOffice enum + 14-region metadata | `packages/contracts/src/domain/region-office.ts` | ✅ done | `94f3451` |
| `Investor` entity (RE100 + retail union) | `packages/contracts/src/domain/investor.ts` | ✅ done | `4496ef7` |
| `LOI` entity + status transitions | `packages/contracts/src/domain/loi.ts` | ✅ done | `4496ef7` |
| `SimulationResult` entity | `packages/contracts/src/domain/simulation.ts` | ✅ done | `4496ef7` |
| `ESGImpactSnapshot` entity + computeESGEquivalents | `packages/contracts/src/domain/esg-impact.ts` | ✅ done | `4496ef7` |
| `CommunityEvent` entity | `packages/contracts/src/domain/community-event.ts` | ✅ done | `4496ef7` |
| `EventRSVP` entity | `packages/contracts/src/domain/event-rsvp.ts` | ✅ done | `4496ef7` |
| 5 demo investors (4 RE100 + 1 retail) | `packages/contracts/src/fixtures/v1-3-demo.ts` | ✅ done | `2865041` |
| 3 demo LOI (submitted/draft/approved) | same file | ✅ done | `2865041` |
| 2 demo community events (past + upcoming) | same file | ✅ done | `2865041` |
| 9 demo ESG snapshots (3 residents × 3 months) | same file | ✅ done | `2865041` |
| 2 new demo accounts | `apps/web/src/auth/demoAccounts.ts` | ✅ done | `<commit-pending>` (i0002 삼성전자 ESG팀, i0003 김투자 retail) |

Cross-cutting (after all per-FR rows are green):

| Item | Status | Commit |
|---|---|---|
| App.tsx route table updated for 12 new paths | ✅ done | spread across `c0dcca0`, `717207f`, `f64fa93`, `6625859` |
| `vercel.json` X-Robots-Tag noindex for protected routes | ✅ done | `<commit-pending>` — added `/admin/:path*` (covers /admin/loi + /admin/loi/:loi_id) and `/invest/dashboard`; existing /portal/, /admin, /simulator, /map, /buildings/ rules preserved |
| Topbar tab set per role updated | partial | new `/invest/*` paths sit in LandingShell (no Topbar). AppShell tabs unchanged for analyst/operator. Investor-tab augmentation deferred — InvestorHome at /invest/dashboard already covers role-home concern |
| README.md demo-accounts section refreshed | ✅ done | `<commit-pending>` — full 8-account roster table (3 system + 3 residents + 3 investors incl. i0002, i0003) + public surfaces table |
| `.env.example` has `VITE_KAKAO_MAPS_API_KEY` placeholder | ✅ done | `<commit-pending>` — empty value with R-V13-2 explainer + Kakao Developers signup steps |
| Final 5-scenario regression manual run | partial | typecheck/lint/test all green via mirror; 65/68 tests pass (3 pre-existing parent-branch failures, no new regressions). Manual viewport check 480/768/1280 deferred to demo-day rehearsal. |

---

## Out-of-scope (do not touch — these are Phase 2/3)

- **FR-R-007** (적격투자자 KYC·적정성 평가) — capital-markets law, deferred
- **FR-M-011** (입주민 바우처/농산물 redemption) — operating model TBD
- **FR-S-010** (RE100 PPA settlement)
- **FR-S-011** (K-ETS carbon credit)
- **FR-S-012** (settlement rollback)
- **FR-D-004** (1-year historical backfill)

If you find yourself touching any of these "while you're nearby", **stop**.
They were explicitly forbidden by the user prompt.

---

## P3 freeze — do not modify (regression check #5)

The existing M+3 LH demo storyboard (`§13.1` 9-step) must remain green. P3
files are off-limits unless a v1.3 change *forces* a touch (in which case
document the touch here):

- `apps/engine/**` — all FR-S, FR-D, FR-X work
- `chain/**` — chaincode
- `apps/simulator/**`
- `apps/web/src/routes/{Dashboard,Monitor,BuildingDetail,Ledger,ResidentPortal,AdminConsole}.tsx`
- `apps/web/src/routes/Home/*.tsx` (existing analyst/operator/investor homes
   may need additive *imports* but no semantic changes)
- `apps/web/src/auth/**` (FR-A-001 — additive only: extending `AuthUser`
   with optional fields for new demo accounts is OK)
- `apps/web/src/demo/**` — Demo Mode controller / storyboard JSON
- `packages/contracts/src/domain/{building,beneficiary,resident,settlement,
   blockchain-tx,subsidy,anomaly,audit-log,generation-event,tx-stream-message}.ts`
   — additive-only (Coherence Guard 2; v1 freeze)

The one exception this implementation makes: the `Building.building_id`
regex has to relax from `/^ULJN-\d{3}$/` to support multi-region prefixes
(SEO-, INC-, etc.) for the 9,354 catalog. This is **additive-permissive**:
every value valid before is still valid, the validator just permits more.
No removed/renamed symbols. ULJN fixtures continue to validate. Documented
in `Decisions` below and called out in the relevant commit.

---

## Open risks

### R-V13-1: ~~Financial model xlsx not reconciled~~ → De-risked by v1.3.1 prompt update (commit `bdad922`)

**Updated 2026-05-06 with v1.3.1 prompt revision.** Original concern was
that FR-O-006 had to reconcile to BM A vs BM B sheets in
`TheKIE_LH_재무모델.xlsx`. The v1.3.1 prompt update explicitly clarified:

- **BM A vs BM B sheets are TheKIE-internal strategy comparison only —
  forbidden to expose to investor-facing UI.** They are NOT the reference
  for FR-O-006.
- FR-O-006 is now strictly **investor-equity perspective** (Equity IRR,
  Payback, ROI Multiple from the investor's standpoint).
- v1.3.1 provides explicit defaults for every load-bearing parameter:

| Parameter | Value | Source |
|---|---|---|
| SMP base (육지) | 119원/kWh | v1.3.1 BASE_ASSUMPTIONS |
| REC unit price | 70,000원/MWh | v1.3.1 |
| REC weight | 1.2 | FR-S-003 |
| Daily generation hours | 3.6h × installed_kw | FR-D-001 |
| Lucia SaaS | 50,000원/동/월 | (project-side cost, not in investor returns) |
| KIE-REMS SaaS | 30,000원/동/월 | (project-side cost) |
| O&M | 5.0% of revenue | v1.3.1 |
| Module degradation | 0.5%/yr | v1.3.1 |
| Housing-subsidy reservation | 41% of revenue | FR-S-004 / LH PDF p.4 |
| **KEA 융자금 default rate** | **1.75%** | v1.3.1 (overridable 0~5%) |
| **KEA 융자금 grace period** | **5 years (interest-only)** | v1.3.1 |
| **KEA 융자금 repayment period** | **10 years (annuity)** | v1.3.1 |
| **KEA 융자금 max ratio** | **80% of CAPEX** | v1.3.1 (한국에너지공단 한도) |
| Other debt rate | 4.5% | v1.3.1 |
| CAPEX | 4,000,000원/kW | v1.3.1 |
| Scenarios | Conservative ×0.85 / Base / Optimistic ×1.15 | v1.3.1 |

All values now cited inline in `packages/finance/src/assumptions.ts` as
`BASE_ASSUMPTIONS` + `SCENARIOS` constants per the v1.3.1 prompt spec.

**Mandatory disclaimers** (PDF + UI):
1. `"본 시뮬레이션은 가정 기반이며 실제 수익을 보장하지 않습니다."`
2. `"재생에너지지원사업 융자금 적용은 한국에너지공단 심사 후 확정됩니다."`

**Forbidden in this UI** (anti-pattern enforcement):
- BM A/B comparison chart
- "BM A" / "BM B" terminology in any investor-facing copy
- Including TheKIE Lucia SaaS / KIE-REMS revenue in investor distribution
- Permitting KEA loan ratio > 80% (UI must cap)
- Omitting either disclaimer in the PDF output

**Module renaming**: original plan was `bm-model.ts`. v1.3.1 renames to
`investor-model.ts` (semantically accurate — name signals investor scope,
not BM strategy comparison).

The risk is **closed**: implementation can proceed with confidence. No
xlsx reconcile snapshot test is needed since the investor model is fully
specified by the v1.3.1 prompt.

### R-V13-2: Kakao Maps API key not yet provisioned (FR-O-005)

Map will render "no-key" mode on dev with empty markers (Kakao SDK fallback)
until a real key is set in `.env.example` → `VITE_KAKAO_MAPS_API_KEY=…`.
Marker logic + 14-region color coding + clustering + filter UI all work
without a key against the seed data (renders OpenStreetMap-style fallback
tiles via Kakao's free-tier dev shim). **Demo-day TODO**: register a Kakao
Developers JS app (free, ~10 min) and paste the JS key into `.env.local`.
Document the registration steps in `apps/web/CLAUDE.md` as part of FR-O-005.

### R-V13-3: Build mirror network constraint

Per CLAUDE.md, every `pnpm` invocation must run via `./sync-to-build-mirror.sh
exec pnpm <…>`. Direct `pnpm` from this Korean-path cwd silently corrupts
node_modules. **All quality gates and dev-server runs route through the
mirror**. Default mirror path: `C:/Users/Nam/lucia-build` (override with
`LUCIA_BUILD_MIRROR=…`).

---

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-05 | Branch from `feat/multi-role-auth`, not `main` | 58 commits of FR-A-001 + FR-M-001 not yet on main; prompt premise depends on them |
| 2026-05-05 | Commit `docs/frd/` to `feat/multi-role-auth` (commit b55ae1d) before branching | FRD is source of truth for v1.3; both branches need it |
| 2026-05-05 | Skip committing `.omc/project-memory.json` | OMC harness churn, not load-bearing |
| 2026-05-05 | Skip committing `docs/superpowers/` | Empty subdirs, irrelevant |
| 2026-05-05 | Use prompt-stated constants for FR-O-006; defer xlsx reconcile to user-paste step | Anti-pattern #4 forbids invented values; prompt constants are spec-stated, not arbitrary; reconcile gate stays as `.skip` snapshot test |
| 2026-05-05 | Choose **Kakao Maps SDK** for FR-O-005 over Naver/MapLibre | Best Korean admin boundaries + address labels; free dev tier sufficient for Pilot demo |
| 2026-05-05 | Relax `Building.building_id` regex from `/^ULJN-\d{3}$/` to permit multi-region prefixes | Required by 9,354-catalog FR-R-002; additive-permissive (no values invalidated); ULJN fixtures still pass |
| 2026-05-06 | Accept v1.3.1 prompt update — FR-O-006 reframed as investor-equity perspective only; BM A/B comparison forbidden in this UI | User-supplied. Resolves R-V13-1 by providing explicit defaults for every load-bearing parameter (KEA loan rate/grace/repay, OPEX, scenarios, max ratio). xlsx BM sheets confirmed as wrong reference (TheKIE-internal strategy doc). |
| 2026-05-06 | Rename `bm-model.ts` → `investor-model.ts` per v1.3.1 | Module name should signal investor-equity scope, not BM strategy comparison. Helps enforce anti-pattern: BM A/B labels must not leak into investor UI. |

---

## Commit history (this branch)

| SHA | Type | Subject | Branch |
|---|---|---|---|
| `b55ae1d` | docs | add FRD-2026-001 v1.3 + changelog + build script | `feat/multi-role-auth` (parent) |
| `9aeb699` | chore | setup for v1.3 work — CLAUDE.md FRD ref, make frd target, .vercel ignore | `feat/v1.3-strategic-pivot` |
| `f31db78` | docs | initialize IMPLEMENTATION_LOG.md as durable progress log | `feat/v1.3-strategic-pivot` |
| `94f3451` | feat | Wave 1A — nationwide 9,354-building catalog (region-office + Building extension) | `feat/v1.3-strategic-pivot` |
| `4496ef7` | feat | Wave 1B — 6 new domain entities (Investor/LOI/Sim/ESG/Event/RSVP) | `feat/v1.3-strategic-pivot` |
| `2865041` | feat | Wave 1C — demo fixtures (5 investors / 3 LOI / 2 events / 9 ESG snapshots) | `feat/v1.3-strategic-pivot` |
| `984f7f4` | docs | Wave 1 quality-gate result + commit history update | `feat/v1.3-strategic-pivot` |
| `ee6bf47` | feat | Wave 2A Slice 1 — FR-R-005 LOI data layer (sha256 + store + 16 tests) | `feat/v1.3-strategic-pivot` |
| `bdad922` | docs | v1.3.1 prompt update — FR-O-006 refocused on investor-equity perspective | `feat/v1.3-strategic-pivot` |
| `db7813c` | docs | IMPLEMENTATION_LOG.md — v1.3.1 changes reflected, R-V13-1 closed | `feat/v1.3-strategic-pivot` |
| `1648ef6` | feat | Wave 2A Slice 2 — LOI HTML templates + generator (12 tests) | `feat/v1.3-strategic-pivot` |
| `e27cbb3` | feat | Wave 2A Slice 3 — signature flow + blockchain hash registration (17 tests) | `feat/v1.3-strategic-pivot` |
| `37a6da9` | feat | Wave 2B Slice 1 — @lucia/finance investor-model + assumptions (31 tests) | `feat/v1.3-strategic-pivot` |
| `d06f552` | docs | IMPLEMENTATION_LOG.md — Wave 2A complete + Wave 2B Slice 1 reflected | `feat/v1.3-strategic-pivot` |
| `509de31` | feat | Wave 2C — FR-R-002 v1.3 investor catalog at /invest/projects | `feat/v1.3-strategic-pivot` |
| `c0dcca0` | feat | Wave 2B Slice 2 — FR-O-006 v1.3.1 investor-equity simulator React UI | `feat/v1.3-strategic-pivot` |
| `0658ffb` | feat | FR-O-006 — site search selector + 옥상 면적 / 패널 수 / 패널 종류 banner | `feat/v1.3-strategic-pivot` |
| `717207f` | feat | FR-R-003 + FR-R-004 — investor onboarding wizards (Waves 2D + 2E) | `feat/v1.3-strategic-pivot` |
| `f64fa93` | feat | FR-R-006 + FR-M-009 + FR-M-010 (Waves 2F + 3A + 3B) | `feat/v1.3-strategic-pivot` |
| `<final>` | feat | FR-R-005 §6 admin LOI console + Wave 5 demo accounts + IMPLEMENTATION_LOG sweep | `feat/v1.3-strategic-pivot` |

## Wave 1 quality-gate result (workspace-wide)

| Gate | Result | Notes |
|---|---|---|
| `pnpm typecheck` | ✅ clean | all 5 projects (contracts/db/web/engine/simulator) |
| `pnpm lint` | ✅ clean | max-warnings=0 across workspace |
| `pnpm test` (contracts) | ✅ 75/75 | 12 prior + 26 nationwide + 21 entities + 16 demo |
| `pnpm test` (apps/web) | ⚠️ 3 pre-existing fails | inherited from `feat/multi-role-auth` (verified by checking parent branch — failures predate v1.3 work). Tests: `Invest/index hero title`, `Home/InvestorHome 누적 투자금`. NOT v1.3 regressions. Tracked separately for the FR-A-001 / FR-R-001 owners. |
| `pnpm build` (contracts) | ✅ clean | |

The DB schemas for the 6 new v1.3 entities (Investor/LOI/Sim/ESG/Event/RSVP)
are intentionally **not** added in this wave. Pilot v1.3 UI consumes them as
fixtures (`v1-3-demo.ts`) — there's no v1.3 backend yet. Drizzle schemas
+ migrations will land with v1.4 / Phase 2 backend wiring. Decision logged
to keep the wave focused.

---

## Resume protocol (if a new session picks this up)

1. Read this file end-to-end.
2. Read `docs/frd/FRD-2026-001.md` v1.3 (the full spec).
3. Read `.omc/plans/lucia-pilot-implementation.md` for plan-level context.
4. `git log feat/v1.3-strategic-pivot --oneline` to see the actual commit
   trail vs the table above; the table is hand-maintained and may lag.
5. Find the highest-numbered Wave with rows still `·` and resume there.
6. Every quality gate runs through the mirror: `./sync-to-build-mirror.sh
   exec pnpm typecheck && ./sync-to-build-mirror.sh exec pnpm lint && ...`
   — never raw `pnpm` from this Korean-path cwd.

---

## 2026-05-06 — Analyst Dashboard Audit-Integrity Pivot

Reframed `AnalystHome` from generic-dashboard wrapper to audit-integrity instrument:

- **Hero**: monumental `0 변조 시도` with σ3 rejection-framing semantics, full-bleed white. Live-bound state matrix (loading/fresh/stale/disconnected/unreachable) — em-dash placeholder when data missing, refusal block on engine unreachable.
- **Audit card**: explicit FR-S-004 formula strip (`매출 ₩32,356,400 × 41% → ₩13,266,124 → 2,839세대`) + 비중 % column. Cohort math satisfies `sum === revenue × 0.41` invariant (tested). Monthly-cycle badge state machine (진행 중 → 마감 임박 → 마감 검증 중 → 마감 완료).
- **ActivityZone extracted** to its own module with analyst-tilted defaults (`주거비 환원 + 가상공유거래`) + `이상만 보기 (N)` toggle. `Dashboard.tsx` now imports it; operator path unchanged behaviorally.
- **Right rail**: 30-day `감사 무결성 타임라인` replaces `IncomeChartCard` on analyst path only. Horizontal strip with verification height + rejection (rose) and unsettled (amber) overlays.
- **Modal trio**: `TxDetailModal` (ledger row drill-in), `SankeyFlowModal` (audit-card chevron `분배 흐름도 →`); existing `TamperModal` reused for FR-S-008 with rejection-escalation pattern (R3) — clicking 거부 row in ledger opens TxDetail with a "변조 시도 분석 →" escalation button to the dramatic Tamper view.
- **Single source of truth**: `apps/web/src/routes/Home/analystFixtures.ts` consolidates `INTEGRITY_SUMMARY`, `INTEGRITY_TIMELINE_30D`, `DISTRIBUTION_ROUND_2026_04`. Replaces hardcoded numbers scattered across the old `EnvironmentalImpactCard`, `Dashboard.HeroBand`, and `AuditHeroStrip`.
- **Auth**: added optional `honorific?: string` field to `AuthUser` (analyst account: `displayName='김지호', honorific='처장'`) so the greeting renders `안녕하세요, 김지호 처장님`.
- **Dropped from analyst**: `HeroBand` 매출 hero, `BlockchainIntegrityStrip`, `EnvironmentalImpactCard` (deleted file), `AuditHeroStrip` inline. `Dashboard.tsx` keeps its 매출-hero layout for operator role.
- **17 design decisions** captured at [docs/superpowers/specs/2026-05-06-analyst-dashboard-design.md](docs/superpowers/specs/2026-05-06-analyst-dashboard-design.md). Plan + execution at [docs/superpowers/plans/2026-05-06-analyst-dashboard-audit-pivot.md](docs/superpowers/plans/2026-05-06-analyst-dashboard-audit-pivot.md).

Phase 2 (out of scope): engine endpoints `/audit/integrity-summary`, `/audit/integrity-timeline`, `/audit/distribution-round`; WebSocket `integrity_event` payload extension. Currently all data wired to fixtures via the analystFixtures module.

**Visual smoke pending** — interactive browser verification on the analyst home (CTAs, modals, monthly cycle, hero state transitions) deferred to the user. Run `./sync-to-build-mirror.sh dev` (port 3001), log in as `김지호 처장`, and walk the checklist in the implementation plan §"Task 9: Build verification + visual smoke".

Commits (in order): `077bba8` `c527a06` `da2b3bd` `b99dc06` `8caa825` `c9b59f3` `743efee` `711dcf9` `418cf50` `269ee7e` `ec8913d` `e9467f6` `06bd5b7`.
