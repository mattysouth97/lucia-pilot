# FRD-2026-001 Change Log

This file tracks revisions to the Functional Requirements Document for
the Lucia Pilot (FRD-2026-001). The authoritative source is
`docs/frd/FRD-2026-001.md`; the binary `.docx` consumed by LH is built
from it via `bash scripts/build-frd.sh`.

---

## v1.2 — 2026-05-05

**Type**: Deltas-only revision driven by week-1 code reality. Existing FR
bodies are preserved verbatim except for FR-R-001 (re-spec to shipped
sections) and FR-M-001 / FR-M-007 (auth dependency notes). One new FR
domain added (FR-A — Authentication).

### What changed

| # | Change | Source |
|---|---|---|
| 1 | New domain **FR-A — Authentication & Authorization** added (§9.7); 7th active domain. | `feat/multi-role-auth` branch (26 commits) shipped multi-role auth surface that v1.1 did not document |
| 2 | New **FR-A-001 (Multi-role authentication & route gating)** **Must Have**. Defines 4-role login (`analyst` / `operator` / `investor` / `resident`), `AuthProvider`, `useRole`, `RequireRole`, `RoleRedirect`, demo accounts (6 total), open-redirect validation, `noindex` defense-in-depth on private routes. | `apps/web/src/auth/`, `apps/web/src/routes/Login/`, `apps/web/src/routes/Home/`. Per user direction: not tagged demo-critical |
| 3 | FR-M-001 (통합 대시보드) — **per-role differentiation explicit**. v1.0/v1.1 said "단일 화면"; v1.2 acknowledges Analyst / Operator / Investor / Resident split into separate Home routes. | Commits `ccd5bcd`, `eee2a8b` on `feat/multi-role-auth` |
| 4 | FR-M-007 (입주민 포털) — **auth mechanism named**. v1.0/v1.1 said "Mock 신원 인증" with no spec; v1.2 binds it to FR-A-001 `resident` role with `RequireRole` gate; URL-token escape hatch removed (impersonation risk). | Commits `83e9b1f` (added) → `7fbf432` (removed) on same branch |
| 5 | **FR-R-001 (투자자 랜딩) — fully re-specified** (per user direction) to shipped section list: Hero / EditorialStatement / EnergyFlow / YieldHistory / Disclosure / PreFooterCTA + NotificationRibbon / LandingHeader / LandingFooter. Dropped v1.1 sections (ImpactStrip, HowItWorks, StationGrid, TrustGrid, LiveLedgerRibbon) that did not survive the M+1 designer cycle. CustomerReviews flagged as shipped-but-unmounted. | `apps/web/src/routes/Invest/index.tsx`, `sections/*.tsx` |
| 6 | §3.1 / §3.2 — **Resident promoted from Secondary to Primary** (4th login role). §3.1 introduces the `analyst / operator / investor / resident` role-code column. | FR-A-001 surface; `demoAccounts.ts` 6-account list |
| 7 | §11.1 — **Resident entity row added** (9 entities). v1.0 P0 scaffolding shipped `packages/contracts/src/domain/resident.ts` + `packages/db/src/schema/residents.ts` but the table never listed it. | Schema/contracts files; v1.0 commit `403bff3` |
| 8 | §4 UC-4 — referenced FR-A-001 as the auth mechanism; noted URL-token removal. | Same as #4 |
| 9 | §12 — FR-O-005 / FR-O-006 descriptors changed from "탐색 기능" to **"scaffolding 출하 (route mounted, feature inert)"**. Routes are on `main` (`MapExplorer.tsx` / `InstallSimulator.tsx`) but `9a5e2be` removed `maplibre-gl` dead code. Phase 2 status retained per user direction. | `apps/web/src/routes/MapExplorer.tsx`, `apps/web/src/routes/InstallSimulator.tsx`, commit `9a5e2be` |
| 10 | §1.2 distribution table updated: 31 → 32 active FRs (+1 FR-A-001), 28 → 29 Must-Have, 6 → 7 domains. Appendix B traceability matrix updated to 37 rows. | Roll-up of changes 1–9 |
| 11 | §0 in-document change log replaced (v1.0→v1.1 → v1.1→v1.2). | This revision |
| 12 | §14.2 가정 3 / 부록 A 용어집 MVP — Must count 28 → 29. | Roll-up |

### What did **not** change

Out of scope for v1.2 per the deltas-only directive:

- §13 Demo Storyboard — unchanged. The 9 steps still match shipped Demo Mode; FR-A-001 enables Step 5 ("입주민 입장") via auto-`loginAs('resident')` but does not change the storyboard sequence.
- §14.1 Risks — **R-6 (backend track lag) NOT added** per user direction. The FRD is forward-looking; project execution risks live in the consensus plan.
- FR-S-001..009 bodies — backend not yet implemented (engine = 184 LOC, only `chat.ts` route), but the FRD describes target spec, not status.
- §3.2 울진군 공무원 / 감사원·산자부·환경부 — unchanged.
- ChainStub fallback (ADR-0002) — lives in ADR per current convention, not FRD.

### Source artifacts referenced for these changes

- `feat/multi-role-auth` branch git log (26 FR-A-001 commits, 2 FR-M-001 commits)
- `apps/web/src/auth/` (AuthProvider, types, demoAccounts, RoleRedirect, RequireRole, useRole)
- `apps/web/src/routes/Login/` (LoginPage with 4 role tabs, AccountCard, RoleTab, copy)
- `apps/web/src/routes/Home/` (AnalystHome, OperatorHome, InvestorHome, InvestorSections/)
- `apps/web/src/routes/Invest/index.tsx` (Landing composition — re-spec source)
- `packages/contracts/src/domain/resident.ts`, `packages/db/src/schema/residents.ts` (entity table fix)

### Audit posture

v1.2 is the first revision driven by **code reality** (week-1 audit) rather
than consensus-plan deviations. Future revisions should continue this
pattern: read the codebase first, treat plan deviations as one input among
many. The `commit-msg` CI hook enforces FR-ID references on every commit,
so any new FR-* prefix appearing in `git log` not yet in the FRD is a
detectable drift signal.

---

## v1.1 — 2026-05-04

**Type**: Deltas-only revision. No content rewrite; existing FR bodies
are preserved verbatim except for priority cell labels.

### What changed

| # | Change | Source |
|---|---|---|
| 1 | Markdown source-of-truth introduced (`docs/frd/FRD-2026-001.md`); pandoc build pipeline scripted. Future FRD updates are diff-clean. | This revision |
| 2 | FR-X-003 / FR-X-004 / FR-X-005 (LH 회계, RE100 ESG, K-ETS Mock 연동) priority **Should → Must**. | Consensus plan §"Spec deviations" #1 — trivial in-memory routes that round out the demo experience |
| 3 | FR-D-004 (1-year historical backfill) **Should → Phase 2 (§12)**. | Consensus plan §"Spec deviations" #2 — not on storyboard; 60M-row ingest cost not justified |
| 4 | FR-S-010 (RE100 PPA) **Should → Phase 2 (§12)** | Consensus plan §"Spec deviations" #3 — not budgeted for M+3 demo |
| 5 | FR-S-011 (K-ETS 적립) **Should → Phase 2 (§12)** | Consensus plan §"Spec deviations" #3 |
| 6 | FR-S-012 (Rollback) **Nice → Phase 3 (§12)** | Consensus plan §"Spec deviations" #3 |
| 7 | FR-M-007 (입주민 포털) **Should → Must (demo-critical)**. | Storyboard §13.1 Step 6 ("입주민 입장") is a core demo hypothesis |
| 8 | FR-M-008 (Live Tx Stream) **Nice → Must (demo-critical)**. | Storyboard §13.1 Step 3 ("1 kWh → 28 settlement items") implicitly requires it; consensus plan §"Spec deviations" #4 |
| 9 | FR-O-004 (Demo Mode) **Should → Must (demo-critical)**. | The mechanism by which LH demo automates itself; without it, §13 storyboard is manual-only |
| 10 | New §9.5 / **FR-R-001** (투자자 랜딩 페이지) **Should**. | Shipped on `feat/invest-landing-page` branch (37 commits); `/invest/*` route tree with Hero, ImpactStrip, HowItWorks, StationGrid, TrustGrid, LiveLedgerRibbon, Disclosure, FAQ, regulatory footer |
| 11 | **FR-O-005** (GIS site-selection) added to §12 Phase 2. | Exploratory feature shipped during execution (commit 774ecab); needs separate FRD |
| 12 | **FR-O-006** (투자 시뮬레이터) added to §12 Phase 2. | Exploratory feature shipped during execution (commit 774ecab); FR-R-001 후속으로 통합 가능 |
| 13 | §1.2 distribution table updated: 33 → 31 active FRs (+1 R, −3 S cut to Phase 2, −1 D cut to Phase 2); 22 → 28 Must-Have. Appendix B traceability matrix updated to 36 rows. | Roll-up of changes 2–12 |

### What did **not** change

Out of scope for v1.1 per the deltas-only directive:

- §3 Stakeholders — unchanged (no investor stakeholder added despite FR-R-001).
- §4 Use Cases — unchanged (no UC-6 investor onboarding).
- §11.1 Entities — unchanged (Resident remains implicit; not promoted to a documented entity row).
- §13 Demo Storyboard — unchanged (the 9 steps still match shipped Demo Mode).
- §14 Risks — unchanged (R-10 BullMQ memory growth not added; ChainStub fallback per ADR-0002 not added).

These are candidates for a future v1.2 once the M+3 demo lands.

### Source artifacts referenced for these changes

- `.omc/plans/lucia-pilot-implementation.md` §"Spec deviations / contradictions surfaced during planning" (lines 428–435)
- `.omc/specs/deep-interview-lucia-pilot.md` (deep-interview output that drove the consensus plan)
- `apps/web/src/routes/Invest/` (FR-R-001 acceptance criteria)
- `apps/web/vercel.json` (FR-R-001 SPA rewrite + X-Robots-Tag config)
- `feat/invest-landing-page` branch git log (37 FR-R-001 commits)

---

## v1.0 — 2026-04-30

Initial release. 33 FRs in 5 domains (S/M/D/X/O), 22 Must-Have. Authored
by TheKIE Digital Platform Center for the M+3 LH 본사 ESG 경영실 시연.
Source format: Microsoft Word `.docx`. Distributed as PDF +
`untitled/project/uploads/TheKIE_LH_FRD.docx`.
