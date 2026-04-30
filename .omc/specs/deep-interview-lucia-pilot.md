# Deep Interview Spec: Lucia Pilot Prototype (FRD-2026-001)

## Metadata
- **Interview ID**: `di-lucia-pilot-2026-04-30`
- **Rounds**: 4
- **Final Ambiguity Score**: 13.2%
- **Type**: brownfield (existing frontend prototype + pre-existing FRD; greenfield for backend/chain/simulator)
- **Generated**: 2026-04-30
- **Threshold**: 20.0%
- **Status**: PASSED
- **Source FRD**: `untitled/project/uploads/TheKIE_LH_FRD.docx` / `TheKIE_LH_FRD.pdf` v1.0
- **Existing prototype**: `untitled/project/Lucia 정산 플랫폼.html` + `untitled/project/src/*.jsx`

## Clarity Breakdown

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.90 | 0.35 | 0.315 |
| Constraint Clarity | 0.85 | 0.25 | 0.213 |
| Success Criteria | 0.85 | 0.25 | 0.213 |
| Context Clarity (brownfield) | 0.85 | 0.15 | 0.128 |
| **Total Clarity** | | | **0.868** |
| **Ambiguity** | | | **0.132 (13.2%)** |

## Goal

Build the **Lucia Pilot Prototype** as defined in FRD-2026-001 v1.0 — a working Hyperledger-Fabric-based settlement platform plus KIE-REMS Lite monitoring dashboard for the LH-Uljin 116동 / 3MW solar project — to the **22 Must-Have functional requirements** within the FRD's M+0 → M+3 (12-week) timeline, culminating in a **10-minute auto-running demo at LH 본사 ESG 경영실** that supports the M+6 RE100 출자 MOU milestone.

The deliverable is a **single-tenant pilot system** (single SPC, 116 buildings) running on a 16GB demo laptop via `docker compose up`, demonstrating five hypotheses:

1. **정산 자동화** (FR-S-001~006) — 1 kWh → 9 cash-flow items computed and persisted automatically.
2. **가상공유거래 분배** (FR-S-004, FR-M-006) — 41% revenue distributed across 1,643 LH + 280 국민임대 + 916 에너지소외 households per FRD-pinned ratios.
3. **감사 추적 무결성** (FR-S-007/008/009) — All settlements recorded to Hyperledger Fabric; tamper attempts visibly rejected; full audit trail queryable.
4. **KIE-REMS 단일 운영** (FR-M-001~005) — 116-building dashboard with real-time generation, anomaly detection, drill-down.
5. **선형 확장성** (FR-O-001) — Load-test from 116 → 1,000 → 9,354 buildings demonstrating sub-5s settlement, sub-3s dashboard.

## Constraints

### Hard constraints (FRD-pinned)
- **Timeline**: M+0 → M+3 (12 weeks), with M+3 LH demo as Critical Path.
- **Scope gate**: 22 Must-Have FRs (8 Should-Have, 3 Nice-to-Have only if time allows).
- **Hosting**: Local/Testnet Hyperledger Fabric (NOT mainnet).
- **External systems**: All 5 (KPX, 한국에너지공단, LH 회계, RE100 ESG, 환경부 K-ETS) are **Mock APIs** in this MVP.
- **Demo laptop**: 16 GB RAM, M-series Mac or Windows 11; everything boots via `docker compose up`.
- **Language**: Korean UI 100% (NFR-5, NFR-8); i18n keys required for future English in Phase 2.
- **Performance**: 116동 정산 ≤ 2s, 9,354동 부하 정산 ≤ 5s + dashboard ≤ 3s (NFR-1, NFR-3).
- **Security**: HTTPS, admin API auth, blockchain immutability, PII masking. ISMS-P deferred to a parallel track (NFR-4).
- **Data retention**: Generation events 1y hot / 5y cold / 10y purge; settlements + chain perpetual; audit logs 5y.

### Decided in interview (interpretations / overrides of the FRD)
- **KIE-REMS**: existing TheKIE platform, but **simulated for the M+3 build**. Building/resident/region/inverter master data becomes seed data in our PostgreSQL. Real KIE-REMS DB integration deferred to Phase 2. (User decision Round 4.)
- **Demo Mode (FR-O-004)**: priority **promoted from Should-Have to Must-Have** because it is the literal M+3 Critical Path deliverable. (Spec deviation, with rationale.)
- **9,354동 부하 테스트 (FR-O-001)**: kept as Must-Have per FRD; runs on a temporary AWS/GCP environment if the laptop can't sustain it (R-3 mitigation). Pre-recorded screen-capture as backup per §13.2.
- **Team model**: Project Manager + AI augmentation (no traditional engineering team). The codebase must enforce coherence the way a human reviewer normally would (strict types, executable tests, ADRs, package-level CLAUDE.md).
- **Existing prototype**: ~30% of frontend surface (FR-M-001/002/005/006/008, FR-O-002/003/004 partial, FR-S-004/008 modals). Will be **rewritten, not extended**, into the new Vite + React + TS app — the prototype becomes a visual reference and asset source, not a starting point in code form.

### Stack (decided Round 4, accepted by user)

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Vite + React + TypeScript + React Router | Existing prototype is React; routing now needed for `/buildings/[id]`, `/portal/[user_id]`, `/admin`. Next.js SSR unnecessary for an internal-laptop demo. |
| Lucia engine | Node + TypeScript + Fastify | Same language as frontend → max AI-agent context coherence; Fabric Node SDK is mature; Fastify > Express for typed handlers + perf. |
| Fabric chaincode | Go | Largest community examples for Fabric; chain logic is stable, not the iteration surface; dual-language cost contained. |
| Simulator | Node + TypeScript | Reuses engine's MQTT client + types; one language for everything outside chain. |
| Mock external APIs | Same Fastify monorepo, separate `/api/mock/*` routes | Trivial; avoids 5 micro-services for what is functionally fixture-shaped data. |
| KIE-REMS faked source | Same simulator package, additional seed loaders | Treated as a data source, not a system; loads seed JSON for buildings/residents/regions. |
| Data | PostgreSQL 16 + TimescaleDB extension | Per FRD §11. |
| ORM | Drizzle | Typed schema + migrations, agent-friendly. |
| Chain client | `fabric-network` (Node SDK) | Engine talks to chain over Node SDK. |
| Realtime | MQTT (Mosquitto) for ingestion; WebSocket from engine to frontend | Per FRD §6, §7. |
| Repo | pnpm monorepo | One root, one CI, shared types via `packages/contracts`. |
| Container | Docker Compose | Per NFR-7. |
| Coherence guardrails | tsconfig strict, eslint, vitest, package-level CLAUDE.md, ADR/0001-stack.md, `pnpm typecheck` + `pnpm test` as CI gates | Replaces the human reviewer that doesn't exist. |

### Repo layout (target)

```
apps/
  web/             # Vite + React + TS — KIE-REMS Lite + admin + 입주민 portal
  engine/          # Fastify + TS — Lucia 정산 engine, Mock APIs, chain client, MQTT consumer
  simulator/       # Node + TS — 116동 generation simulator + KIE-REMS seed loader + anomaly injection
chain/             # Hyperledger Fabric Go chaincode + network bootstrap
packages/
  contracts/       # Shared TS types: GenerationEvent, Settlement, Beneficiary, ...
  db/              # Drizzle schema + migrations + seed
docker/            # docker-compose.yml + per-service Dockerfiles
docs/
  adr/             # Architecture decision records
  CLAUDE.md        # Repo-wide agent guidance
  specs/           # Deep-interview spec lives here (or .omc/specs/ as set up)
```

## Non-Goals (explicit)

These are out of scope for the M+3 deliverable and must not creep in:

- **Real IoT sensor hardware integration** (Phase 2 — Pilot 시공).
- **Mainnet Fabric deployment** (Phase 2).
- **Real KPX / 한국에너지공단 / LH 회계 / RE100 ESG / 환경부 K-ETS APIs** (Phase 2).
- **Real KIE-REMS DB integration** (deferred per Round 4 decision; was Phase 2, now firmly Phase 2).
- **CBAM integration** (Phase 3).
- **ISMS-P certification** (parallel track, separate engagement).
- **Multi-tenant SaaS** — single SPC only (Phase 3).
- **VPP wholesale market bidding** (Phase 3).
- **Open API licensing for external ReSCO/VPP** (Phase 3, M+22).
- **Production-grade auth for 입주민 포털** — Mock identity for 2–3 demo accounts only (FR-M-007).
- **Full English UI** — Korean only; i18n keys required but no second locale shipped.

## Acceptance Criteria

The deliverable is accepted when **all 22 Must-Have FRs pass their FRD-defined acceptance criteria**, the 10-minute demo (§13.1) auto-runs end-to-end, and the load test (FR-O-001) hits its NFR-1/NFR-3 numbers.

### Settlement domain (FR-S, 9 Must-Have)
- [ ] **FR-S-001** — Generation event ingest validates building_id ∈ 116동, rejects future timestamps and kWh > 1000, enqueues to Redis FIFO; ≤50ms; 100/100 valid pass, 100% invalid rejected.
- [ ] **FR-S-002** — SMP revenue calculated as `kWh × hourly_SMP_price`, rounded to 2 decimals; 1.2 kWh × 119원 = 142.8원 verifiable.
- [ ] **FR-S-003** — REC issued at weight 1.2 (지붕형 1.0 + 주민참여형 0.2); 1.2 kWh = 0.00144 REC; ≈100원 at 70,000원/REC; mock 한국에너지공단 issuance call recorded.
- [ ] **FR-S-004** — 41% of revenue split LH 64.2% / 국민임대 10.9% / 에너지소외 35.8%; 6,420 / 7,420 / 18,195 원 per household ±1원; chain-recorded.
- [ ] **FR-S-005** — Monthly cron on 1st 00:00 KST: 116 × 50,000원 (Lucia) + 116 × 30,000원 (KIE-REMS) = 9,280,000원 SaaS fee transferred SPC → TheKIE; chain-recorded.
- [ ] **FR-S-006** — Per-transaction fees: REC 1.5%, PPA 3원/kWh, VPP/K-ETS 2%; verifiable via the FRD-stated worked examples (100원 REC → 1.5원, 100kWh PPA → 300원).
- [ ] **FR-S-007** — Hyperledger Fabric chain records all settlements; ≥100 TPS; ≤1.5s avg latency; permanent retention; tx_id + block_height + hash + timestamp returned.
- [ ] **FR-S-008** — Tamper attempts rejected via hash-chain validation; UI alert shown ≤1s; attempt logged with IP/time/user; demo-visible.
- [ ] **FR-S-009** — Audit trail for any settlement_id / event_id / date_range queryable in ≤1s; PDF report generated in ≤5s; all lifecycle steps captured (event → calc → chain → external report).

### Monitoring domain (FR-M, 6 Must-Have — FR-M-007 promoted)
- [ ] **FR-M-001** — Dashboard initial load ≤3s; data tick ≤1s; all 116 buildings visible (map + status colors + KPI cards + alert panel).
- [ ] **FR-M-002** — Building detail page loads ≤1s for any of 116; hour/week/month chart toggle; inverter gauge; latest 50 settlements; household breakdown.
- [ ] **FR-M-003** — Search/filter by date range + building + settlement type; ≤2s on 100k rows; CSV export ≤5s.
- [ ] **FR-M-004** — Anomaly detection (kWh < 30% of avg, inverter eff < 90%, settle delay > 1h) within 1 min of trigger; alert channel reach ≤5 min; false positive < 5%.
- [ ] **FR-M-005** — Generation timeseries chart with multi-building compare + avg-deviation overlay + zoom/pan; 1-week query ≤1s, 1-year ≤5s.
- [ ] **FR-M-007** *(promoted from Should-Have to Must-Have in this spec)* — 입주민 포털: Mock-auth login for 2–3 demo residents (e.g., 홍길동); month-selectable subsidy detail with derivation (어느 동, 어느 비율, 얼마); chain tx-ID linkable. Required for §13.1 Step 5 of the demo storyboard.

### Data domain (FR-D, 3 Must-Have)
- [ ] **FR-D-001** — Simulator emits 116 MQTT events/min following solar-pattern normal-distribution + ±10% per-building noise; daily ≈3.6 generating hours.
- [ ] **FR-D-002** — Admin can inject `inverter_fail` / `shadow` / `module_damage` per building; auto-recovery + manual clear; FR-M-004 alert fires.
- [ ] **FR-D-003** — MQTT consumer ingests `site/+/generation`, validates per FR-S-001, persists to TimescaleDB, triggers settlement; ≥100 msg/s, 0% loss, backpressure-aware.

### External-integration domain (FR-X, 2 Must-Have)
- [ ] **FR-X-001** — KPX SMP Mock at `/api/mock/kpx/smp` returns hourly SMP with realistic peak-time variance (≈119원/kWh April 2026 avg ±10원); ≤100ms; 5-min cache.
- [ ] **FR-X-002** — REC Mock supports issue / transfer / burn with REC-id + owner history; 100-record load passes; demo visualizes REC lifecycle.

### Operations domain (FR-O, 3 Must-Have, 1 promoted)
- [ ] **FR-O-001** — Load test 116 → 1,000 → 9,354 buildings: settlement ≤5s, dashboard ≤3s at peak; comparison report generated.
- [ ] **FR-O-002** — Audit PDF generation ≤5s; Korean public-sector form; chain tx-IDs embedded; works for any period × building selection.
- [ ] **FR-O-003** — Admin console enables building CRUD, weight/rate adjustment, anomaly injection, demo control; all actions audit-logged.
- [ ] **FR-O-004** *(promoted from Should-Have to Must-Have in this spec)* — Demo Mode auto-runs the 9-step §13.1 scenario in ≤10 min with pause/resume; full-screen mode.

### Cross-cutting
- [ ] All 23 Must-Have FRs above (22 FRD + FR-M-007 + FR-O-004 promotions) green simultaneously on a fresh `docker compose up` from a clean clone, on a 16 GB demo laptop.
- [ ] CI runs `pnpm typecheck && pnpm test && pnpm build` per package on every commit.
- [ ] Korean UI copy preserved verbatim from prototype (and FRD §13) where it already exists.
- [ ] §13.1 demo storyboard auto-runs end-to-end with a single "▶ 시연 재생" click.
- [ ] **KIE-REMS schema export obtained and reviewed by end of M+2** (R-7 mitigation): real KIE-REMS table schemas for `building`, `resident`, `region`, `inverter` validated against simulator seed shapes; deviations documented; Phase 2 integration cost de-risked. *(Process commitment, not code.)*

## Assumptions Exposed & Resolved

| Assumption | Challenge | Resolution |
|---|---|---|
| FRD scope = project scope | Earlier "internal demo / pitch" framing implied much smaller scope; same project? | **Full FRD scope** confirmed (R1 = A). Earlier framing superseded. |
| Lucia engine + KIE-REMS already exist at TheKIE | FRD references them as products; handoff bundle has only frontend prototype. | **Lucia engine, chain, simulator, mocks, frontend = greenfield.** **KIE-REMS = existing**, will be simulated for M+3. (R2 = D, refined in R4.) |
| Conventional engineering team | R-1 (Fabric ramp) + R-4 (인력) rated 높음 in FRD. | **PM + AI augmentation** is the actual team model. R-1 deflates (agents know Fabric); R-4 deflates on throughput but inflates on coherence/review — must be enforced by the codebase. (R3 = D.) |
| Existing prototype is the codebase starting point | Was assumed in earlier Vite+React+JS conversion plan. | **Prototype is a visual + asset reference**, not a code starting point. New app is built from scratch in TS, copying styling tokens and the layout. |
| Demo Mode (FR-O-004) is "Should Have" | But §13.1 names it as the M+3 Critical Path deliverable. | **Promoted to Must-Have** in this spec, with rationale. (Documented deviation from FRD priority field.) |
| KIE-REMS DB credentials needed in week 1 | Required for FR-S-004 / FR-M-007 if integrated live. | **Simulated.** Building/resident/region/inverter master data is seed JSON in our DB. Live KIE-REMS deferred to Phase 2. (R4 follow-up.) |

## Technical Context

### Existing prototype (handoff bundle) — what to keep, what to discard

| Asset | Action |
|---|---|
| Color tokens, shadows, spacing in HTML `<style>` block | **Keep** — port verbatim into `apps/web/src/index.css`. |
| Pretendard / Geist Mono / Manrope fonts | **Keep** — same `<link>` in `apps/web/index.html`. |
| Card components (`Pill`, `Btn`, `Stat`, `SectionTitle`, `Spark`, `fmt`) | **Re-implement** in TS with strict types; visual parity required. |
| Cards (StatsRow, Generation, Distribution, Buildings, Blockchain, Anomaly, RE100, Resident, LoadTest, Sankey) | **Re-implement** in TS, wired to engine API + WebSocket instead of `window.LUCIA_DATA`. |
| Modals (Building detail, Report, Tamper) | **Re-implement** + wire to real flows. |
| Mock data (`window.LUCIA_DATA`) | **Discard** in app code; values inform DB seeds + simulator distributions. |
| Babel-standalone + CDN React + `window.*` module pattern | **Discard** — replaced by Vite + ES modules. |
| `tweaks-panel.jsx` | **Discard** — design-tool harness, not product code. |
| Layout (1440px shell, 2-column grid, sticky topbar) | **Keep** structurally; expressed with Tailwind-free inline styles or CSS modules per existing pattern. |

### External dependencies

- **Hyperledger Fabric 2.5** (Local Network) — runs in docker-compose: orderer, peer, CouchDB, CA. Chaincode in Go, called from engine over Node SDK.
- **Mosquitto** (MQTT broker) — `site/+/generation` topic; one publisher (simulator), one consumer (engine).
- **PostgreSQL 16 + TimescaleDB** — generation_events as hypertable; settlements, beneficiaries, residents, anomalies, audit_logs as relational.
- **Node 20 LTS** (engine, simulator, web build).
- **Go 1.22** (chaincode only).
- **pnpm 9** (monorepo).

### Risk reassessment (post-decisions)

| ID | Original | Post-decision |
|---|---|---|
| R-1 (Fabric learning curve) | 높음 | **중간** — agents are Fabric-fluent; risk shifts to chaincode-engine integration coherence. |
| R-2 (시연 일정 변경) | 중간 | unchanged |
| R-3 (9,354동 부하 노트북) | 중간 | unchanged — keep AWS/GCP fallback + recorded backup video |
| R-4 (개발 인력 부족) | 높음 | **중간** — AI throughput addresses scale, but coherence/review risk emerges. Mitigated by strict types + ADRs + per-package CLAUDE.md. |
| R-5 (LH 시연 후 검토필요) | 낮음 | unchanged |
| **NEW R-6** — AI agent drift across long runs | — | **중간** — codebase enforces invariants via `tsc`, `eslint`, `vitest`, executable specs; ADRs lock architectural decisions; `packages/contracts` prevents type drift. |
| **NEW R-7** — KIE-REMS simulation diverges from real schema | — | **낮음** for M+3, **중간** for Phase 2 — request real KIE-REMS schema export by M+2 to validate seed shape. |

## Ontology (Key Entities)

### Domain entities (from FRD §11.1, refined)

| Entity | Type | Fields | Relationships |
|---|---|---|---|
| Building | core domain | building_id, region_office, city, address, lat/lng, installed_kw, install_date, status, inverter_count | has many GenerationEvent, has many Beneficiary, has many Anomaly |
| GenerationEvent | core domain (timeseries) | event_id, building_id, ts, kwh, inverter_temp, source | belongs to Building, triggers one Settlement |
| Beneficiary | core domain | beneficiary_id, building_id, category (LH매입임대 / 국민임대 / 에너지소외), household_count, share_ratio, monthly_subsidy | belongs to Building, has many Resident, has many Subsidy |
| Resident | core domain (new explicit) | resident_id, beneficiary_id, masked_name, mock_login_token | belongs to Beneficiary; demo identities = 2~3 mock |
| Settlement | core domain | settlement_id, event_id, smp_revenue, rec_revenue, ppa_revenue, kets_credit, housing_subsidy_total, saas_fee, txn_fee, spc_net, tx_id | belongs to GenerationEvent, has one BlockchainTx, has many Subsidy |
| BlockchainTx | core domain | tx_id, block_height, hash, payload, ts, status | belongs to Settlement |
| Subsidy | core domain | subsidy_id, beneficiary_id, settlement_id, period, amount, status | belongs to Beneficiary, belongs to Settlement |
| Anomaly | supporting | anomaly_id, building_id, type, detected_at, severity, resolved_at | belongs to Building |
| AuditLog | supporting | log_id, action, actor, ts, payload, ip_address | cross-cutting |

### System components (decided in interview)

| Component | Type | Repo path |
|---|---|---|
| Lucia Engine | service | `apps/engine` (Fastify + TS) |
| Fabric Chaincode | service | `chain/` (Go) |
| Web Dashboard | service | `apps/web` (Vite + React + TS) |
| Simulator | service | `apps/simulator` (Node + TS) — 116동 generation + KIE-REMS seed loader + anomaly injection |
| Mock External APIs | service | `apps/engine/src/mock/{kpx,rec,lh,re100,kets}.ts` |
| Shared Contracts | package | `packages/contracts` (TS types) |
| DB Schema | package | `packages/db` (Drizzle) |

### External systems (5 mocked + 1 simulated)

| System | Status | How |
|---|---|---|
| KPX SMP | mocked | `/api/mock/kpx/smp` — FR-X-001 |
| 한국에너지공단 REC | mocked | `/api/mock/rec` — FR-X-002 |
| LH 입주민 회계 | mocked | `/api/mock/lh-accounting` — FR-X-003 |
| RE100 ESG | mocked | `/api/mock/re100` — FR-X-004 |
| 환경부 K-ETS | mocked | `/api/mock/kets` — FR-X-005 |
| **KIE-REMS** | **simulated for M+3** (not integrated) | Building/resident/region seed loader in simulator package; real DB integration deferred to Phase 2 |

## Ontology Convergence

| Round | Entity count (domain) | New | Changed | Stable | Stability |
|---|---|---|---|---|---|
| R1 (scope pin) | 8 (FRD §11.1 inherited) | 8 | 0 | 0 | N/A (first round) |
| R2 (asset map) | 8 + KIE-REMS reframed as external | 0 | 1 (KIE-REMS: integrated → simulated by R4) | 8 | 100% |
| R3 (team model) | 8 (no entity changes from team question) | 0 | 0 | 8 | 100% |
| R4 (stack pin) | 9 (Resident promoted from implicit) | 1 | 0 | 8 | 89% |
| Final | 9 | — | — | — | converged |

System components (engine, chain, simulator, etc.) added at R4 are tracked separately above.

## Demo storyboard (FRD §13.1) — acceptance lens

The 10-minute auto-running demo IS the M+3 acceptance event. Each step maps to FRs that must be working live:

| Step | Time | Demo content | FRs |
|---|---|---|---|
| 1 | 0:00–1:00 | Dashboard main + 116동 map + KPI cards | FR-M-001, FR-M-005, FR-O-004 |
| 2 | 1:00–2:30 | Click ULJN-001 → detail page | FR-M-002 |
| 3 | 2:30–4:00 | Live View: 1 kWh → 28 settlement items | FR-S-001~006, FR-M-008 |
| 4 | 4:00–5:30 | Sankey of revenue distribution | FR-S-004, FR-M-006 |
| 5 | 5:30–6:30 | Resident portal — 홍길동 환원 내역 | FR-M-007, FR-S-005 |
| 6 | 6:30–7:30 | Tamper attempt → rejected | FR-S-007, FR-S-008 |
| 7 | 7:30–8:30 | Inject ULJN-042 inverter fault → alert | FR-D-002, FR-M-004 |
| 8 | 8:30–9:30 | 9,354동 load test playback | FR-O-001 |
| 9 | 9:30–10:00 | Generate audit PDF (≤5s) | FR-O-002, FR-S-009 |

Note Step 5 (Resident portal) is FR-M-007, which is **Should-Have** in the FRD but **required by the demo storyboard**. Either promote to Must (recommended), or simplify the demo step. Spec recommends **promoting FR-M-007 to Must-Have** alongside FR-O-004.

## Implementation phases (proposed for the next planning step)

The 12 weeks naturally decompose into four phases. The next step (ralplan or omc-plan) will refine these:

- **P0 — Scaffolding (Week 1)**: monorepo, Docker Compose skeleton, Postgres+TimescaleDB+Mosquitto+Fabric local network up, `packages/contracts` typed shapes, ADR-0001 stack, per-package CLAUDE.md, CI gates.
- **P1 — Engine + Chain (Weeks 2–5)**: FR-S-001 through FR-S-009, FR-D-003, FR-X-001/002 mocks, basic chaincode, settlement persistence, hash-chain tamper rejection.
- **P2 — Data + Dashboard (Weeks 5–9)**: FR-D-001 simulator, FR-D-002 anomaly injection, FR-M-001 through FR-M-005, FR-M-006 Sankey, FR-M-007 resident portal (Mock auth).
- **P3 — Demo + Ops (Weeks 9–12)**: FR-O-001 load test, FR-O-002 PDF audit, FR-O-003 admin console, FR-O-004 Demo Mode auto-runner, polish, dry-run rehearsals.

## Out-of-spec items the FRD calls out

These are deliberately excluded from this spec but the team should track in the project memory for Phase 2 / Phase 3:

- Real IoT hardware integration, mainnet Fabric, real KPX/한국에너지공단/LH 회계/RE100/K-ETS/KIE-REMS APIs, CBAM, ISMS-P, multi-tenant SaaS, VPP wholesale, Open API licensing.

## Interview transcript

<details>
<summary>Full Q&A (4 rounds)</summary>

### Round 1 — Goal pin
**Q (targeting Goal Clarity, ambiguity 35%):** Does the FRD now authoritatively define the project, or is it a backdrop for an M+3 demo we're shipping faster? (A) Full FRD MVP / (B) Demo-shaped subset with faked engine boundary / (C) Frontend-only with fixtures / (D) Other.
**A:** A — Full FRD MVP, all 22 Must-Haves, 12-week timeline, backend included.
**Score after R1:** Goal 0.85 ↑0.35, Constraints 0.70, Criteria 0.85, Context 0.45 → ambiguity ~25%.

### Round 2 — Existing-asset pin
**Q (targeting Context Clarity, ambiguity 25%):** Beyond the prototype, what already exists at TheKIE? (A) Green-field / (B) Partial assets / (C) Mature platform / (D) Other.
**A:** D — KIE-REMS is an operating solution and we can integrate by reading from its DB. Hyperledger chaincode, MQTT/TimescaleDB pipeline, simulator, and 5 mock APIs all built from zero in 12 weeks.
**Score after R2:** Goal 0.85, Constraints 0.70, Criteria 0.85, Context 0.65 ↑0.20 → ambiguity ~22%.

### Round 3 — Team / capacity pin
**Q (targeting Context Clarity, ambiguity 22%):** What does the build team look like? (A) Strong team with Fabric experience / (B) Standard team, Fabric-green / (C) Small team, all green / (D) Solo + AI augmentation / (E) Other. Plus: backend language preference?
**A:** D — Project Manager + AI augmentation.
**Score after R3:** Goal 0.85, Constraints 0.80 ↑0.10, Criteria 0.85, Context 0.80 ↑0.15 → ambiguity ~17%.

### Round 4 — Stack pin (final)
**Q:** Accept the recommended stack (Vite+React+TS frontend, Node+TS Fastify engine, Go chaincode, pnpm monorepo, Docker Compose, Drizzle on Postgres+TimescaleDB) and KIE-REMS as live DB read in week 1, or override?
**A:** Accept the stack. **Override**: simulate KIE-REMS for now — defer real DB read to Phase 2.
**Score after R4:** Goal 0.90 ↑0.05, Constraints 0.85 ↑0.05, Criteria 0.85, Context 0.85 ↑0.05 → ambiguity 13.2%. **Below threshold; spec crystallized.**

</details>
