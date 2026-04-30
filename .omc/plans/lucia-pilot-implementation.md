# Lucia Pilot — Implementation Plan (Consensus, M+0 → M+3)

## Source
- **Spec**: `.omc/specs/deep-interview-lucia-pilot.md`
- **FRD**: `untitled/project/uploads/TheKIE_LH_FRD.docx` (FRD-2026-001 v1.0)
- **Generated**: 2026-04-30
- **Pipeline**: deep-interview → ralplan (consensus) → autopilot
- **Status**: Iteration 1 — Architect + Critic feedback applied (NEEDS_REVISION → revised)

---

## RALPLAN-DR Summary

### Principles (5)
1. **Spec is law** — every task maps to FR-ID(s) with FRD acceptance criteria as the test target.
2. **Coherence over speed** — codebase enforces invariants (strict TS, executable tests, ADRs, per-package CLAUDE.md) since there is no human reviewer.
3. **Demo Critical Path first** — the FRD §13.1 storyboard drives task ordering; anything not on the demo path defers.
4. **Boundaries before features** — `packages/contracts` v1 **freezes as additive-only (no removals or renames)** at end of week 1; features fill in afterward. Additive evolution is permitted; breaking changes require an ADR amendment.
5. **Mocks are real shapes** — every Mock external API matches its FRD output schema exactly so Phase 2 swaps are non-breaking. Frontend fixtures (`packages/contracts/fixtures/`) are validated against engine response shapes via a CI gate (see Coherence Guards).

### Decision Drivers (top 3)
1. **Time-box discipline** — 12 weeks, 23 Must-Have FRs, demo storyboard auto-runs end-to-end on demo day.
2. **AI agent coherence** — types, tests, ADRs as guardrails replacing the absent human reviewer (R-6).
3. **Demo credibility** — every storyboard step works live, not smoke-and-mirrors.

### Viable options considered

**Option A — Sequential phases (P0→P1→P2→P3)**
- Pros: simple, low integration risk, clear week milestones.
- Cons: serializes work that could parallelize; chaincode and dashboard scaffold are independent.
- Verdict: leaves throughput on the table when autopilot is reliable.
- *Note*: **Option A is the explicit fallback if R-6 (AI agent drift) materializes** — if weekly contract-sync gates require excessive human intervention, revert to sequential execution. The single-PM team should not attempt parallel coordination if autopilot can't sustain both tracks.

**Option B — Strict parallel tracks immediately after P0**
- Pros: maximum throughput.
- Cons: high contract-drift risk; requires `packages/contracts` to freeze by end of P0 wk1, which is aggressive without breathing room for early discovery.
- Verdict: feasible but fragile.

**Option C — Parallel tracks with weekly contract-sync gates** *(chosen)*
- P0 wk1: shared scaffolding (monorepo, contracts v1 frozen-additive, db schema, docker-compose skeleton, ADRs, AWS provisioning).
- Wk 2–9: two parallel tracks (Track A backend, Track B frontend) with Friday-EOD `pnpm typecheck` sync; **wk6 mid-track integration smoke** wires demo prototype against real backends to catch semantic drift early.
- P3 wk 10–12: integration, demo automation, load test, polish.
- Pros: ~50–60% throughput gain over sequential when autopilot is reliable; weekly sync prevents drift; matches AI augmentation model.
- Cons: requires disciplined additive-only contract evolution after wk1; throughput gain is contingent on autopilot sustaining both tracks without per-task human intervention. If R-6 materializes, fall back to Option A.
- Verdict: chosen, with R-6 fallback explicit.

### Pre-mortem (3 scenarios)

**S1 — Hyperledger learning curve breach**
Agents thrash on Fabric peer/orderer config in wk2–3, slipping P1 by 2 weeks.
*Mitigation*: P0 includes "fabric-network up + hello-world Go chaincode tx end-to-end" as a hard gate before any business-logic code; `hyperledger/fabric-samples/asset-transfer-basic` used as scaffolding seed; **trigger** = if P0.6 not green by end of day 4 of wk1, switch to ChainStub fallback by day 5 (chaincode interface satisfied by an in-process `ChainStub` that maintains hash-chain semantics; real Fabric in M+4–M+5 with same contract).

**S2 — Type drift between engine and web**
Parallel tracks diverge on `Settlement` / `GenerationEvent` / `Beneficiary` shapes; integration day (wk10) reveals N small bugs.
*Mitigation*: `packages/contracts` v1 frozen-additive end of wk1; weekly Friday EOD `pnpm typecheck` across ALL packages; any breaking change requires ADR amendment + both-track revision. **Plus**: wk6 mid-track integration smoke validates real engine responses match `packages/contracts/fixtures/`, catching semantic divergence 3 weeks before final convergence.

**S3 — Demo-mode automation never gels**
FR-O-004 ends up brittle, demo crashes during dry-run wk11.
*Mitigation*: Demo Mode prototyped in wk5 (Track B) as smoke test (3-step proof), evolved alongside features; storyboard captured in declarative state machine, not imperative scripts; pre-recorded backup video produced wk10 per FRD §13.2.

### Test plan (expanded)

| Layer | Tooling | Coverage focus |
|---|---|---|
| Unit | vitest | settlement math (FR-S-002/003/004/006), SMP/REC mock generators, anomaly classifier, chain-payload builders, per-building queue ordering |
| Integration | vitest + testcontainers | simulator → MQTT → engine → chain → DB end-to-end happy path; tamper-rejection; admin anomaly inject; SaaS-fee cron; admin CRUD audit-log writes |
| E2E | Playwright | the 9-step §13.1 storyboard, scripted; PDF generation; admin operations; resident portal; live tx stream |
| Load | k6 + xk6-mqtt | FR-O-001 116 / 1,000 / 9,354 buildings (AWS m6i.2xlarge); FR-S-007 100 TPS; FR-D-003 100 msg/s |
| Fixture validation | `pnpm test:fixtures` (zod/typebox) | every fixture in `packages/contracts/fixtures/` validates against the matching engine response schema; CI gate |
| Observability | pino structured logs + prometheus-client `/metrics` + `/healthz` | every settlement logs ts + tx_id; service health surfaced |

---

## ADR Set

### ADR-0001 — Monorepo with pnpm workspaces

**Decision**: pnpm-workspaces monorepo. Top-level dirs: `apps/`, `packages/`, `chain/`, `docker/`, `docs/`, `.omc/`.

**Decision drivers**: shared types via single source, single CI, atomic cross-package commits, agent context coherence.

**Alternatives considered**:
- Turborepo: heavier; no clear benefit at this scale.
- Polyrepo (4 separate repos): defeats the contract-coherence goal; cross-repo type sync cost is real.

**Why chosen**: pnpm workspaces is the lightest viable option that supports `packages/contracts` as a hard dependency for `apps/web`, `apps/engine`, `apps/simulator`.

**Consequences**: requires Node 20 + pnpm 9; CI runs `pnpm --filter ... typecheck/test/build`.

**Follow-ups**: revisit Turborepo if build times exceed budget post-M+3.

---

### ADR-0002 — Engine ↔ Chaincode boundary

**Decision**: Engine (Node/TS) submits transactions to Fabric via `fabric-network` SDK to Go chaincode. Chaincode is **dumb persistence + hash-chain integrity** — no business logic. All settlement math runs in engine; chaincode stores immutable result + hash linkage.

**State DB choice**: **LevelDB** (Fabric's default key-value store) for the demo target on the 16 GB laptop. CouchDB is reserved for Phase 2 production where rich ad-hoc queries justify its cost. Chain operations (`Settle`, `Verify`, `History` by `building_id`) are all key-based lookups that LevelDB handles natively. CouchDB on the demo laptop alongside Postgres+TimescaleDB+Redis+Mosquitto+Fabric peer would saturate memory and degrade FR-S-007's 100 TPS / 1.5s avg latency target.

**Decision drivers**: keep Go surface area minimal (stable patterns, small footprint); iterate on engine in TS where AI agents are most fluent; clean separation of concerns; meet 100 TPS within 16 GB demo laptop budget.

**Alternatives considered**:
- Settlement math inside chaincode (Go-native): rejected — chaincode upgrades are expensive in Fabric (lifecycle + endorsement); we want fast iteration on the math.
- HTTP shim over chain (engine talks REST to a sidecar that talks Fabric): rejected — adds a hop with no benefit.
- CouchDB state DB on demo laptop: rejected — memory pressure degrades 100 TPS target.

**Why chosen**: aligns with FRD's "Lucia 정산 엔진 + Hyperledger Fabric 원장" framing — engine computes, chain records. LevelDB satisfies all M+3 query patterns; CouchDB swap-in for Phase 2 is a config change.

**Consequences**:
- Engine must be deterministic for settlement math (audit reproducibility).
- Chain stores `payload_hash` + `payload_blob`; full payload also in Postgres.
- Chain interface is `Settle(payload, prev_hash)` returning `{tx_id, block_height, hash}`; `Verify(tx_id)`; `History(building_id, range)`.
- LevelDB used for demo; CouchDB swap reserved for Phase 2 (config change, no chaincode rewrite).

**Follow-ups**: Phase 2 — evaluate moving validation rules into chaincode for stronger guarantees; swap to CouchDB if rich ad-hoc queries become necessary.

---

### ADR-0003 — MQTT → engine → TimescaleDB ingestion path with per-building FIFO

**Decision**: Mosquitto broker; simulator publishes to `site/{building_id}/generation` with QoS 1; engine subscribes with `site/+/generation`; events validated, INSERTed into `generation_events` hypertable, settlement triggered async via **BullMQ named queues partitioned by `building_id`**. Within a single building's queue, processing is strictly FIFO (concurrency = 1 per partition); across buildings, queues run in parallel (allowing 116-way parallelism). This preserves per-building hash-chain ordering (required by ADR-0002 determinism) while sustaining FR-S-007's 100 TPS aggregate target.

**Decision drivers**: FR-D-003 100 msg/s + 0% loss; FR-S-001 50ms validation; FR-S-007 100 TPS chain throughput WITH determinism per building; FRD §11.2 retention policy; Phase 2 real-IoT ingest path.

**Alternatives considered**:
- Single global FIFO queue (concurrency = 1): preserves global ordering but caps throughput at well below 100 TPS. Rejected.
- Default BullMQ concurrent processing: ~6× faster but breaks per-building hash-chain prev_hash linkage. Rejected.
- Per-building queues via BullMQ Pro Groups: paid feature; not justified for pilot.
- Application-level locking via Redlock: viable but error-prone vs. queue-level partitioning.
- Kafka with partition-by-building-id: overkill at 100 msg/s; ops cost not justified.
- Direct HTTP from simulator: loses pub/sub semantics, doesn't match Phase 2 IoT path.

**Why chosen**: BullMQ named queues keyed by `building_id` is the simplest mechanism that maintains determinism without sacrificing throughput. 116 parallel queues × concurrency 1 each = effective 116 TPS ceiling, comfortably above the 100 TPS target.

**Consequences**:
- Mosquitto + Redis added to docker-compose.
- Idempotency by `event_id` upsert; dead-letter topic for malformed events.
- Per-building queue lifecycle: created on first event, idle-timeout-cleaned. Memory footprint bounded by active building count.
- Test surface: per-building FIFO ordering must be unit-tested (out-of-order publish → in-order chain submission).

**Follow-ups**: TimescaleDB compression policies tuned in P3 wk11. Phase 2 — re-evaluate Kafka partition strategy at 9,354-building scale.

---

### ADR-0004 — Mock external API shapes

**Decision**: Each Mock API (KPX, REC, LH 회계, RE100 ESG, K-ETS) lives at `apps/engine/src/mock/<name>.ts` with a Fastify route prefix `/api/mock/<name>/*`. Each module exports a typed contract in `packages/contracts/external/<name>.ts` matching the FRD-prescribed input/output exactly. State (e.g., REC certificates) is in-memory `Map<string, ...>` with admin reset endpoints for demo determinism.

**Decision drivers**: Phase 2 swap to real APIs must be non-breaking; FR-X-001 100ms response budget; demo determinism.

**Alternatives considered**:
- Five separate microservices: ops cost not justified; harder to keep contracts in sync.
- msw on the frontend only: doesn't help engine-side code paths.

**Why chosen**: same monorepo, same contract file, swap-ready (Phase 2 just changes the route handler implementation).

**Consequences**:
- Engine has ~25 additional routes.
- CI must enforce stability of `external/<name>.ts` after wk5 (no breaking changes without ADR amendment).

**Follow-ups**: Phase 2 — replace with real adapters using the same `external/<name>.ts` contracts.

---

### ADR-0005 — Frontend state management

**Decision**: TanStack Query (formerly react-query) for server state (REST polling + cache invalidation) + native React state for UI; WebSocket via custom hook (`useLuciaStream`) feeding TanStack Query cache invalidation; React Context for rare global state (current resident in portal mode, demo-mode controller). No Redux, no Zustand.

**Decision drivers**: AI-agent legibility (Query is well-known and well-documented); the prototype already proved that local state + props is enough for the dashboard surface.

**Alternatives considered**:
- Zustand global store: premature; one well-typed Query cache replaces it.
- Redux Toolkit: over-ceremony for this scale.
- SWR: TanStack Query has stronger TS DX and richer mutation API.

**Why chosen**: minimum framework overhead, max ecosystem coverage, agents trained on it.

**Consequences**:
- WebSocket integration is custom — must be tested in isolation.
- Each page declares its own `useQuery` keys; shared keys exported from a single `queryKeys.ts` for discoverability.

**Follow-ups**: revisit if SSE preferred over WebSocket for the live transaction stream.

---

### ADR-0006 — Demo Mode automation mechanism

**Decision**: Declarative state machine — JSON storyboard with `steps: [{ id, label, duration_ms, action: { type, payload } }]`. A `DemoController` React component reads the storyboard, sequences actions (route nav, inject anomaly, trigger tamper, scroll-to, play tx stream), and supports pause / resume / jump-to-step. Backend exposes deterministic-mode endpoints so each step produces predictable on-screen output.

**Decision drivers**: FR-O-004 reliability; presenter must pause/resume; demo failure is the M+3 disaster scenario.

**Alternatives considered**:
- Imperative `setTimeout` chain: brittle, untestable.
- Video playback only: doesn't satisfy "live demo" credibility — LH must see live tx flow.
- Cypress/Playwright running inside the demo: heavy; bad UX for a presenter.

**Why chosen**: declarative + state-machine = E2E-testable in Playwright + recoverable mid-demo.

**Consequences**:
- Every demo-relevant action must have a controllable backend endpoint (some admin-only).
- Storyboard JSON is a versioned artifact in `apps/web/src/demo/storyboard.json`.

**Follow-ups**: backup video produced via Playwright recording the same storyboard.

---

### ADR-0007 — Load-test methodology for FR-O-001 (9,354동)

**Decision**: k6 with `xk6-mqtt` extension. Three scenario tiers: (a) MQTT publishers (single k6 process spawning N virtual buildings publishing once per minute) at N=116 / 1,000 / 9,354; (b) HTTP load on engine `/api/settlements` queries; (c) Lighthouse scoring of frontend dashboard at each scale. **AWS account, IAM role, and m6i.2xlarge AMI provisioning are part of P0 (week 1)**, not deferred to wk8 — FR-O-001 is Must-Have and cannot be satisfied by a pre-recorded video. Backup video is supplementary, not a primary satisfier.

**Decision drivers**: FR-O-001 + NFR-1 + NFR-3; FR-O-001 is Must-Have, requiring real load-test execution; demo-day fallback is the pre-recorded video per FRD §13.2 ONLY for the demo presentation, not for FR acceptance.

**Alternatives considered**:
- Artillery: less mature MQTT support.
- Custom Node load script: reinvents the wheel; poorer reporting.
- Defer AWS provisioning to wk8: rejected — Korean enterprise procurement lead times can exceed 1 week; failing to provision by wk8 leaves no buffer.
- Recorded video as Must-Have satisfier: rejected — Must-Have requires the system to actually demonstrate the property, not record a past demonstration.

**Why chosen**: k6 has native MQTT extension; one tool, one report; CI-runnable. P0 provisioning eliminates wk8 timing risk.

**Consequences**:
- AWS account + IAM + billing alarm provisioned in P0.13.
- Smoke load test on AWS in wk8 (validates pipeline before wk11 full run).
- Load test report is part of demo deliverable (embedded in demo Step 8).
- Recorded video produced wk10 as demo-day fallback for the presentation, not as FR-O-001 acceptance.

**Follow-ups**: Phase 2 — load tests against real Fabric production network.

---

## Phase-by-phase task list

> **Acceptance gating rule**: every task references the FR-ID(s) it satisfies. A task is not "done" until its referenced FR's FRD acceptance criterion passes its automated test.

### P0 — Scaffolding (Week 1) — HARD GATE

**Goal**: empty-but-complete monorepo bootable via `docker compose up`, all infra services green, `packages/contracts` v1 frozen-additive, ADRs committed, CI green, AWS provisioned. **No feature work begins until this gate passes.**

| # | Task | FR anchor | Track | Acceptance |
|---|---|---|---|---|
| P0.1 | `git init` + initial commit; `.gitignore` (node_modules, dist, .omc/state, fabric crypto) | — | All | `git status` clean after commit |
| P0.2 | pnpm workspace skeleton (`apps/web`, `apps/engine`, `apps/simulator`, `chain/`, `packages/contracts`, `packages/db`); root tsconfig strict; eslint shared config | — | All | `pnpm install` succeeds; `pnpm typecheck` green |
| P0.3 | `packages/contracts` v1 — domain shapes (Building, GenerationEvent, Beneficiary, Resident, Settlement, BlockchainTx, Subsidy, Anomaly, AuditLog, **TxStreamMessage** for FR-M-008) + 5 external API shapes; Zod/Typebox schemas alongside types for runtime fixture validation | All FRs | Engine | All types compile, exported, used by skeleton apps; Zod schemas exported |
| P0.4 | `packages/db` Drizzle schema for §11.1 entities; initial migration; seed (116 buildings + 2,839 households + 4 RE100 mocks + KIE-REMS sim seed: regions, inverter master) | §11.3 | DB | `pnpm db:migrate && pnpm db:seed` produces queryable data |
| P0.5 | `docker-compose.yml`: postgres+timescale, mosquitto, redis, fabric-orderer, fabric-peer-org1 (LevelDB state DB per ADR-0002), fabric-ca; healthchecks | NFR-7 | Infra | `docker compose up` healthy in ≤5 min on 16 GB laptop |
| P0.6 | Fabric local-network bootstrap (channel create, chaincode lifecycle install/approve/commit) for hello-world Go chaincode using LevelDB | FR-S-007 prep | Chain | `peer chaincode invoke` returns tx_id; tx visible in ledger |
| P0.7 | Engine skeleton (Fastify) — `/healthz`, `/metrics`, structured logging (pino), env-based config, graceful shutdown | NFR-6 | Engine | `curl /healthz` → 200 |
| P0.8 | Web skeleton (Vite + React + TS + React Router); `index.css` ported from prototype tokens; routes scaffold for `/`, `/buildings/:id`, `/portal/:user_id`, `/admin`; Pretendard fonts | — | Web | `pnpm dev` boots; routes navigate; styles match prototype |
| P0.9 | Simulator skeleton — connects to MQTT, publishes 1 event/min for 1 building, terminates on signal | FR-D-001 prep | Sim | engine receives event |
| P0.10 | CI script (Makefile + GitHub Actions) — `pnpm install && typecheck && lint && test && build && go test ./chain/... && pnpm test:fixtures` | — | DevOps | CI green on initial commit |
| P0.11 | ADR-0001..ADR-0007 to `docs/adr/`; per-package `CLAUDE.md` ≥30 lines each | — | PM | All 7 ADRs present; CLAUDE.md per package |
| P0.12 | Repo-wide `CLAUDE.md` updated to replace the prototype-focused one (now a single source of truth for agents) | — | PM | New CLAUDE.md committed |
| P0.13 | **AWS account + IAM role + billing alarm + m6i.2xlarge launch template + k6 + xk6-mqtt baked AMI**; provisioning script committed to `infra/aws/` | R-3, FR-O-001 prep | Infra | `aws sts get-caller-identity` works; `terraform plan` (or equivalent) clean; AMI ID recorded in ADR-0007 |

**P0 Acceptance Gate (end of week 1)**: `git clone && pnpm install && docker compose up && pnpm dev` produces a navigable web app, all services healthy, hello-world chain tx submitted+confirmed, contracts frozen-additive, AWS access functional. Failure on Fabric (P0.6) by EOD day 4 → invoke chain-stub fallback by day 5 (R-1 trigger).

---

### Track A — Backend (Engine + Chain + Simulator + Mocks) — Weeks 2–9

#### Wk 2 — Settlement math + chain payload
- A2.1 **FR-S-002** SMP revenue calc (`kWh × hourly_SMP`, 2-decimal rounding) + unit tests (1.2 × 119 = 142.8원)
- A2.2 **FR-S-003** REC issuance with weight 1.2 (`kWh ÷ 1000 × 1.2`) + unit tests
- A2.3 **FR-S-004** 가상공유거래 split (LH 64.2% / 국민임대 10.9% / 에너지소외 35.8% within 41% reservation) + unit tests (per-household ±1원)
- A2.4 **FR-S-006** transaction fees (REC 1.5%, PPA 3원/kWh, VPP/K-ETS 2%) + unit tests
- A2.5 ChainPayload builder — typed serializer; deterministic JSON; sha256 hash; payload includes `prev_hash` for hash-chain linkage
- A2.6 Lucia chaincode v1 (Go) — `Settle(payload, prev_hash)`, `Verify(tx_id)`, `History(building_id, range)`; tamper detection via hash chain (LevelDB-backed)

#### Wk 3 — Settlement engine end-to-end
- A3.1 **FR-S-001** event ingest validation + **per-building BullMQ partitioned queues** (per ADR-0003); concurrency=1 per building, parallel across buildings; FIFO unit tests for out-of-order publish → in-order chain submit
- A3.2 **FR-S-007** chain submission via `fabric-network` SDK; retries; circuit breaker
- A3.3 **FR-S-008** tamper attempt rejection — admin endpoint that attempts mutation; chaincode rejects on hash mismatch; alert event published to event bus
- A3.4 **FR-S-009** audit trace query — joins generation_events + settlements + chain_txs; PDF stub
- A3.5 **FR-S-005** SaaS-fee monthly cron — node-cron at 1st 00:00 KST; computes 9,280,000원; chain-records
- A3.6 Integration test: simulator → engine → chain → DB end-to-end (per-building ordering verified)
- A3.7 **FR-M-008** WebSocket endpoint at `/ws/transactions` — broadcasts each settlement and tamper-rejection event to subscribed clients; backpressure-aware (drop oldest); typed via `TxStreamMessage` from `packages/contracts`

#### Wk 4 — MQTT pipeline + simulator core
- A4.1 **FR-D-003** MQTT consumer (QoS 1, idempotent on `event_id`, backpressure → DLQ)
- A4.2 **FR-D-001** simulator with 116-building solar pattern (sunrise→sunset normal distribution + ±10% noise, 1 event/min)
- A4.3 **FR-D-002** admin anomaly injection — `POST /api/admin/anomaly` with type/duration; simulator applies; engine alerts
- A4.4 Smoke load test: 100 msg/s for 5 min; 0% loss; per-building ordering verified

#### Wk 5 — Mock external APIs + admin backend + chain hardening
- A5.1 **FR-X-001** KPX SMP mock — hourly pattern, 119원 ±10원, 5-min cache, 100ms response
- A5.2 **FR-X-002** REC mock — issue/transfer/burn state machine; `Map<string, ...>`; admin reset
- A5.3 **FR-X-003** LH 회계 mock + **FR-X-004** RE100 ESG mock + **FR-X-005** K-ETS mock (FRD Should-Have but cheap; rounds out demo) — promoted to in-plan Must
- A5.4 Chain v2 — block-height tracking, key-based query optimizations (LevelDB)
- A5.5 **R-7 process commitment** — request real KIE-REMS schema export (target end of M+2)
- A5.6 **FR-O-003 backend** — admin REST endpoints: building CRUD (`POST/GET/PUT/DELETE /api/admin/buildings`), weight/rate adjustment (`PUT /api/admin/policies`), demo-control endpoints; every mutation writes AuditLog (NFR-6); unit + integration tests for each mutation; admin-auth required

#### Wk 6 — Anomaly + audit + observability + cross-track integration smoke
- A6.1 Anomaly classifier (FR-M-004 backend) — rules engine (kWh < 30% avg / inverter eff < 90% / settle delay > 1h)
- A6.2 Audit-log writes for every admin action (NFR-6) — wired into A5.6 endpoints
- A6.3 Engine `/metrics` (prometheus-client); pino structured logs
- A6.4 Health checks for postgres, mqtt, redis, fabric peer
- A6.5 PDF report generator (FR-O-002 backend) — react-pdf or puppeteer; Korean public-sector template; chain tx_id citations
- **A6.6 / B6.0 — CROSS-TRACK INTEGRATION SMOKE (half-day, blocks B7.1)**: wire Track B's DemoController prototype (B5.4) against real Track A backends (A3.3 tamper rejection, A4.3 anomaly injection, A6.1 classifier, A3.7 WebSocket tx stream); validate `packages/contracts/fixtures/` shapes match actual engine response serialization via `pnpm test:fixtures`; any drift → typed issue opened + addressed before B7.1 starts. **Trigger** = if more than 5 fixture mismatches surface, halt B7.1 by half a day to remediate.

#### Wk 7 — Performance + audit endpoint hardening
- A7.1 **FR-S-007** 100 TPS verification — k6 + endorsement tuning, LevelDB write tuning
- A7.2 **FR-D-003** 100 msg/s sustained — 30-min run, memory-leak watch
- A7.3 Index audit for `/api/settlements` time-range queries (FR-M-003 100k rows ≤2s)
- A7.4 PDF generation budget verification (FR-S-009 5s; FR-O-002 5s)

#### Wk 8 — AWS load-test smoke + integration prep
- A8.1 AWS m6i.2xlarge (provisioned in P0.13) — k6 cluster boots; smoke test passes at N=1,000
- A8.2 Deterministic-mode admin endpoints exposed (used by ADR-0006 storyboard)

#### Wk 9 — Track A integration window
- A9.1 Cross-track contract review: any drift since wk1 frozen-additive v1; ADR amendments if needed
- A9.2 All 13 FR-S/FR-D/FR-X/FR-M-008 backend Must FRs green on integration tests against real chain + DB

---

### Track B — Frontend (Web) — Weeks 2–9

#### Wk 2 — Foundation
- B2.1 Component library port from prototype (Pill, Btn, Stat, SectionTitle, Spark, fmt) in TS with strict prop types
- B2.2 Layout shell (1440px, sticky topbar, 2-col grid) + theme tokens via CSS custom properties
- B2.3 React Router with route-level code splitting; placeholder pages render with loaders/errors
- B2.4 TanStack Query setup; base API client with typed fetcher; WebSocket hook scaffolding
- B2.5 Mock fixtures package (`packages/contracts/fixtures/`) so frontend can run before engine routes exist; **fixtures generated by reading the matching Zod schema from `packages/contracts` (P0.3)**, not hand-authored, and validated via `pnpm test:fixtures` in CI (Coherence Guard)

#### Wk 3 — Dashboard main
- B3.1 **FR-M-001** main page — StatsRow, GenerationCard, SankeyCard, DistributionCard, BlockchainCard, BuildingsCard, AnomalyCard, RE100Card, ResidentCard, LoadTestCard
- B3.2 Real-time wiring via TanStack Query polling + WebSocket invalidation
- B3.3 Topbar with global search placeholder, status pulse, user avatar
- B3.4 Animations (`pulse-dot`, `flow-in`) + dotted-bg shell

#### Wk 4 — Detail pages
- B4.1 **FR-M-002** building detail `/buildings/:id` — hour/week/month chart toggle, inverter gauge, last 50 settlements, household breakdown
- B4.2 **FR-M-005** multi-building compare timeseries (overlap with M-001/002)
- B4.3 **FR-M-006** Sankey on dashboard + standalone view (demo Step 4)
- B4.4 Modals: BuildingDetail, ReportModal, TamperDemo

#### Wk 5 — Resident portal + admin + Demo Mode prototype
- B5.1 **FR-M-007** `/portal/:user_id` — Mock auth (token in URL), month picker, subsidy detail with derivation, chain tx_id link
- B5.2 **FR-O-003** `/admin` — building CRUD, weight/rate adjustment, anomaly injection, demo control (wired against A5.6 backend endpoints)
- B5.3 **FR-M-003** search/filter UI on settlements + CSV export
- B5.4 **FR-O-004 prototype** — Demo Mode storyboard JSON schema + DemoController v1 (3 of 9 steps wired)

#### Wk 6 — Anomaly + audit UX + Live Tx Stream + integration smoke
- B6.0 **(see A6.6) — joint task**: cross-track smoke wires DemoController against real backends; resolves any fixture drift before B7.1
- B6.1 **FR-M-004** anomaly alert UI — toast + banner + admin queue
- B6.2 **FR-S-008** tamper visualization — full-screen alert when chain rejection occurs (subscribes to A3.7 WebSocket)
- B6.3 **FR-S-009** audit trace UI — timeline view, "Generate PDF" button
- B6.4 **FR-M-008** LiveTxStream card — wired to A3.7 WebSocket `/ws/transactions`; reconnect with exponential backoff; off-screen circular buffer (last 50 tx); animation matches prototype's `card-blockchain.jsx`; demo Step 3 critical

#### Wk 7 — Demo Mode full + WebSocket polish
- B7.1 **FR-O-004** all 9 storyboard steps wired against real backends (no fixtures); pause/resume/jump-to-step working; **gated by A6.6 / B6.0 integration smoke**
- B7.2 First end-to-end demo run (≤7 min target; full 10 min by wk10)
- B7.3 WebSocket reliability — reconnect, backoff, missed-message catch-up

#### Wk 8 — Polish + visual fidelity
- B8.1 Korean copy polish; i18n keys extracted (NFR-8)
- B8.2 Performance: route-level code splitting, react-query stale-time tuning
- B8.3 Visual fidelity audit vs prototype; pixel diffs resolved
- B8.4 a11y pass: keyboard nav, focus rings, contrast (NFR-5)

#### Wk 9 — Track B integration window
- B9.1 Replace any remaining fixtures in app code with real engine endpoints; fixtures retained only for Storybook/test
- B9.2 All FR-M Must FRs (incl. FR-M-006, FR-M-008) green on integration tests against real engine

---

### Weekly contract-sync gate (every Friday EOD, wk2–wk9)
- `pnpm typecheck` across ALL packages must pass — automated via CI on `main` Friday merges
- `pnpm test:fixtures` must pass — fixtures still match engine response schemas
- Any breaking change to `packages/contracts` → ADR amendment + both-track revision plan in writing
- Quick stand-up doc updated; wk goals for next week locked Mon morning

---

### P3 — Demo + Ops (Weeks 10–12)

#### Wk 10 — Integration
- P3.1 Track A + Track B fully wired against real engine (no fixtures in app code)
- P3.2 §13.1 storyboard expanded to all 9 steps; runs end-to-end
- P3.3 Pre-recorded backup video (FRD §13.2) — Playwright records the storyboard (demo-day fallback for presentation only; FR-O-001 acceptance is the live load test, not the video)
- P3.4 Bug bash; visual fidelity final pass

#### Wk 11 — Load test + audit + dry-run
- P3.5 **FR-O-001** load test on AWS m6i.2xlarge — 116 / 1,000 / 9,354 buildings; results captured as Must-Have FR satisfier and embedded in demo step 8
- P3.6 **FR-O-002** audit PDF — Korean public-sector template polished; 5s budget verified
- P3.7 Demo dry-run #1 (full 10 min, recorded for review)
- P3.8 Demo dry-run #2 with timing tuning

#### Wk 12 — Polish + LH demo
- P3.9 Demo dry-run #3 (final); offline-mode rehearsal
- P3.10 Backup laptop preparation (mirror env)
- P3.11 LH 본사 ESG 경영실 시연 — demo day
- P3.12 Post-demo retrospective + Phase 2 backlog freeze

---

## Acceptance gates per phase

| Phase | Gate criteria | Verification command | Failure response |
|---|---|---|---|
| P0 (wk1) | All 13 P0 tasks green; CI green; chain hello-world tx works; AWS access functional | `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm test:fixtures && pnpm build && docker compose up -d && curl localhost:3000/healthz && pnpm chain:hello && aws sts get-caller-identity` | Halt; do not begin tracks. R-1 trigger: invoke ChainStub fallback if Fabric blocks. |
| Track A wk5 | All FR-S Must (001–009) acceptance unit + integration tests passing; FR-M-008 backend live; FR-O-003 admin endpoints live; FR-X mocks live | `pnpm --filter engine test:integration -- --grep "FR-S\|FR-M-008\|FR-O-003\|FR-X"` | Carry incomplete to wk6 with explicit FR list; reprioritize |
| Track B wk5 | FR-M-001/002/005/006 + skeleton M-003/004/007 + admin scaffold + Demo prototype | `pnpm --filter web test:e2e -- --grep "FR-M-001\|FR-M-002\|FR-M-005\|FR-M-006"` | Same — explicit carry list |
| Wk6 cross-track integration smoke (A6.6/B6.0) | DemoController prototype runs against real backends; fixture validation green | `pnpm test:fixtures && pnpm --filter web test:e2e demo-prototype` | If >5 fixture mismatches, halt B7.1; remediate |
| Track convergence (wk9) | All 23 Must FR backend endpoints present; web fully wired against engine | `pnpm test:integration:all && pnpm --filter web test:e2e:full` | Halt P3; resolve gaps |
| P3 wk11 | Load test results green (FR-O-001 acceptance); demo storyboard runs in ≤10 min | `make load-test-aws && pnpm --filter web test:e2e demo-full` | If load test infra fails, hold M+3 and address; demo step 8 falls back to pre-recorded for presentation only |
| P3 wk12 | LH demo executed; no critical failure | manual demo execution | — |

---

## Risk register (updated, with triggers)

| ID | Risk | Severity | Mitigation | Trigger (IF / THEN) |
|---|---|---|---|---|
| R-1 | Hyperledger learning curve | 중간 (down from 높음) | P0 hello-world gate; fabric-samples reference; ChainStub fallback ready in wk1 | IF P0.6 not green by EOD day 4 of wk1, THEN invoke ChainStub fallback by day 5; real Fabric in M+4 |
| R-2 | LH demo schedule slip (M+3 → M+4) | 중간 | Wk12 partly buffer; M+3 + buffer baked in | IF LH formally requests reschedule by M+2, THEN extend P3 by buffer week and add 2 Should-Haves |
| R-3 | 9,354동 load test infra delay | 중간 (down from 중간 — provisioning moved to P0) | AWS m6i.2xlarge provisioned in P0.13; smoke test wk8; backup video wk10 | IF AWS access not functional by EOD wk1, THEN escalate to GCP equivalent; if both fail by EOD wk2, downgrade FR-O-001 to "116 + 1,000 demonstrated, 9,354 simulated locally with degraded numbers" |
| R-4 | 인력 부족 | 중간 (down from 높음) | AI augmentation throughput; coherence enforced by stack | IF PM cannot complete a weekly sync gate within 2 hrs effort, THEN R-6 likely materializing — see R-6 trigger |
| R-5 | Post-demo "검토 필요" response | 낮음 | Unchanged from FRD | IF LH responds without commitment by M+3+2wk, THEN proactively schedule follow-up + share Phase 2 plan |
| R-6 | AI agent drift across long runs | 중간 | Strict TS + tests + ADRs + per-pkg CLAUDE.md + weekly contract-sync | IF >2 weekly gates fail in succession OR fixture validation fails 3 weeks running, THEN fall back to Option A (sequential phases); compress remaining work |
| R-7 | KIE-REMS sim diverges from real schema | 낮음 (M+3) / 중간 (Phase 2) | Process commitment to obtain schema by M+2 | IF schema not received by M+2 + 1 week, THEN escalate to TheKIE leadership; if not received by M+3, proceed with sim shape and document Phase 2 migration risk |
| R-8 | Track A and Track B contract drift | 중간 | `packages/contracts` frozen-additive end of wk1; weekly Friday `pnpm typecheck` + `pnpm test:fixtures` gate; wk6 integration smoke; breaking changes require ADR amendment | IF a Friday gate fails OR wk6 smoke surfaces >5 fixture mismatches, THEN block weekend work; remediate by Mon AM stand-up |
| R-9 | Demo Mode automation brittleness | 중간 | Wk5 prototype; declarative storyboard (ADR-0006); Playwright e2e tests; backup video | IF wk7 first end-to-end run fails 3 times in a row, THEN simplify storyboard (drop a Should-step) and retry; if wk10 dry-run fails, fall back to scripted manual presenter mode |
| **R-10** | BullMQ per-building queue memory growth | 낮음 | Idle-timeout queue cleanup; bounded active-building count; memory-leak watch in wk7 perf hardening | IF wk4 smoke shows active queue count > 200 (memory leak), THEN add explicit queue.close() on EOD MQTT silence per building |

---

## Spec deviations / contradictions surfaced during planning

1. **FR-X-003/004/005** are FRD "Should-Have" but trivial in-memory routes; plan implements them in wk5 alongside FR-X-001/002 since they round out the demo experience and Phase 2 contract surface. **Effective promotion to Must in this plan.**
2. **FR-D-004 historical backfill** (1 year × 116동 ≈ 6천만 row in 30 min) is FRD Should-Have with significant ingestion-tuning cost and limited demo value (the demo shows live data, not 1-year history). Plan **defers entirely** — it's not on the storyboard.
3. **FR-S-010 RE100 PPA + FR-S-011 K-ETS + FR-S-012 Rollback** are Should/Nice — plan does **not budget time**; can be added if any phase finishes early.
4. **FR-M-008 Live Tx Stream** is FRD "Nice-to-Have" but demo storyboard Step 3 ("1 kWh → 28 settlement items") implicitly requires it. **Plan promotes FR-M-008 to demo-critical Must** with explicit tasks A3.7 (backend WebSocket) and B6.4 (LiveTxStream card). Total promoted Must count = FR-O-004 + FR-M-007 + FR-M-008 = 3 promotions; total Must FR count = 24.
5. **NFR-8 i18n keys**: plan extracts keys but does not produce a second locale; tracked for Phase 2.

---

## Hand-off envelope for autopilot

- **Plan path**: `.omc/plans/lucia-pilot-implementation.md`
- **Spec path**: `.omc/specs/deep-interview-lucia-pilot.md`
- **Phase 2 (autopilot Execution) entry point**: P0 (week 1) — 13 tasks; P0.1–P0.4 sequential; P0.5/P0.6/P0.7/P0.8/P0.13 can parallelize once P0.4 done

### Per-phase verification scripts

| Phase | Verification command |
|---|---|
| P0 wk1 (scaffolding) | `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm test:fixtures && pnpm build && docker compose up -d && curl -fsS localhost:3000/healthz && pnpm chain:hello && aws sts get-caller-identity` |
| Track A wk2–wk5 | `pnpm --filter engine test && pnpm --filter engine test:integration -- --grep "FR-S\|FR-D\|FR-X\|FR-O-003" && pnpm --filter chain go test ./...` |
| Track B wk2–wk5 | `pnpm --filter web test && pnpm --filter web test:e2e -- --grep "FR-M\|FR-O-003 admin"` |
| Wk6 integration smoke (A6.6 / B6.0) | `pnpm test:fixtures && pnpm --filter web test:e2e demo-prototype && pnpm --filter engine test:integration -- --grep "tamper\|anomaly\|tx-stream"` |
| Wk7 perf (A7) | `pnpm --filter engine test:perf -- --grep "FR-S-007\|FR-D-003"` (k6 scenarios) |
| Wk8 AWS smoke | `make load-test-aws-smoke` (1,000 buildings, 5 min) |
| Wk9 convergence | `pnpm test:integration:all && pnpm --filter web test:e2e:full` |
| P3 wk11 (load + audit) | `make load-test-aws-full && pnpm --filter web test:e2e demo-full` |
| P3 wk12 (demo) | `pnpm --filter web test:e2e demo-rehearsal` (manual demo execution after) |

### Coherence guards (every code change MUST satisfy)
1. Tests in the changed package pass.
2. `packages/contracts` shape changes are **additive only** (no removals or renames). Breaking changes require an ADR amendment.
3. **`packages/contracts/fixtures/` validates against the matching engine response schema via `pnpm test:fixtures`** (CI-gated). Fixtures are derived from Zod schemas in `packages/contracts`, not hand-authored.
4. Update the package's `CLAUDE.md` if its purpose evolves.
5. Commit message references the FR-ID it satisfies (e.g., `feat(engine): FR-S-004 가상공유거래 split`).

### Hard gates
- Do **NOT** begin Track A or Track B feature work until **P0 acceptance gate** is green.
- Do **NOT** begin B7.1 (full demo automation) until **wk6 cross-track smoke (A6.6/B6.0)** is green.
- Do **NOT** declare M+3 done without **FR-O-001 load test results from AWS** (recorded video alone is insufficient).

---

## Status

- Initial Planner draft: complete
- Architect review (iter 1): NEEDS_REVISION — 7 findings
- Critic verdict (iter 1): ITERATE — 11 amendments required
- All 11 amendments applied in revision 1
- Architect review (iter 2): **STRONG** — 11/11 amendments HELD; 3 minor awareness items (non-blocking)
- Critic verdict (iter 2): **APPROVE** — "Plan is ready for autopilot Phase 2 (Execution) handoff."
- Iteration count: 1 / 5 (consensus reached)
- **Status: APPROVED — ready for autopilot handoff**
