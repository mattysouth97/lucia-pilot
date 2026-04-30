# CLAUDE.md — Lucia Pilot (FRD-2026-001)

## What this repo is

**Lucia Pilot** is a production implementation of the KIE-REMS Lite solar-power
settlement platform for LH (한국토지주택공사) 매입임대주택 햇빛발전소.  The M+3
demo to LH 본사 ESG 경영실 is the critical path milestone.

FRD: `untitled/project/uploads/TheKIE_LH_FRD.docx` (FRD-2026-001 v1.0).

---

## How this plan was produced (3-stage pipeline)

1. **Deep interview** (`/oh-my-claudecode:deep-interview`): Socratic session that
   extracted all functional requirements, constraints, and the demo storyboard
   from the FRD and the prototype.  Output: `.omc/specs/deep-interview-lucia-pilot.md`.

2. **Consensus planning** (`/oh-my-claudecode:ralplan`): Architect + Critic
   iteration cycle (2 rounds, APPROVED on iteration 2) that produced the
   12-week implementation plan with ADR set, risk register, and per-phase
   verification scripts.  Output: `.omc/plans/lucia-pilot-implementation.md`.

3. **Autopilot execution** (`/oh-my-claudecode:autopilot`): Executor agents
   implement tasks in plan order, starting from P0 (week 1 scaffolding).

Before making architectural decisions, read the plan — most trade-offs are
already recorded there with explicit decision drivers.

---

## Monorepo layout

```
apps/
  engine/         — Fastify settlement engine (FR-S-001..009, FR-M-004/008)
  web/            — Vite + React dashboard + 입주민 portal + admin + Demo Mode
  simulator/      — 116-building MQTT publisher + anomaly injector
chain/            — Hyperledger Fabric Go chaincode (Lucia chaincode v1)
packages/
  contracts/      — Shared Zod schemas + TypeScript types (additive-only after wk1)
  db/             — Drizzle ORM schema + migrations + seed (FRD §11.1 entities)
docker/           — docker-compose.yml + service configs (Postgres/Timescale, Mosquitto, Redis, Fabric)
docs/
  adr/            — Architecture Decision Records (ADR-0001 … ADR-0007)
infra/
  aws/            — AWS provisioning scripts (m6i.2xlarge, k6+xk6-mqtt AMI, IAM)
  load/           — k6 load scenarios (FR-O-001: 116 / 1,000 / 9,354 buildings)
.omc/
  plans/          — Consensus implementation plan (READ-ONLY for agents)
  specs/          — Deep-interview specification
untitled/         — Claude Design prototype handoff (REFERENCE ONLY — see below)
```

---

## Package responsibilities

| Package | Primary FR anchors | Per-package CLAUDE.md |
|---|---|---|
| `packages/contracts` | All (shared shapes) | `packages/contracts/CLAUDE.md` |
| `packages/db` | FRD §11.1, §11.3 | `packages/db/CLAUDE.md` |
| `apps/engine` | FR-S-001..009, FR-M-004/008, FR-O-002/003, FR-X-001..005 | `apps/engine/CLAUDE.md` |
| `apps/web` | FR-M-001..007, FR-O-003/004, FR-S-008/009, FR-M-008 | `apps/web/CLAUDE.md` |
| `apps/simulator` | FR-D-001..003 | `apps/simulator/CLAUDE.md` |
| `chain/` | FR-S-007 (hash-chain integrity + tamper rejection) | `chain/CLAUDE.md` |

---

## Tech stack rationale

| Layer | Tech | ADR |
|---|---|---|
| Monorepo | pnpm workspaces | ADR-0001 |
| DB | Postgres + TimescaleDB (hypertable for generation_events) | — |
| ORM | Drizzle ORM + postgres-js | — |
| Broker | Mosquitto MQTT (QoS 1) | ADR-0003 |
| Queue | BullMQ (per-building named queues, concurrency=1) | ADR-0003 |
| Chain | Hyperledger Fabric + LevelDB state DB | ADR-0002 |
| Engine | Fastify + TypeScript + pino | — |
| Frontend | Vite + React 18 + React Router + TanStack Query | ADR-0005 |
| State mgmt | TanStack Query + React Context (no Redux, no Zustand) | ADR-0005 |
| Demo Mode | Declarative storyboard JSON + DemoController state machine | ADR-0006 |
| Load test | k6 + xk6-mqtt on AWS m6i.2xlarge | ADR-0007 |

---

## How to run

```bash
# Install dependencies
pnpm install

# Start all infra services (Postgres, Mosquitto, Redis, Fabric peer, Fabric CA)
docker compose up -d

# Apply DB migrations + seed 116 buildings / 2,839 households
pnpm db:migrate && pnpm db:seed

# Start the engine (development mode)
pnpm --filter engine dev

# Start the web dashboard
pnpm --filter web dev

# Start the simulator (1 building, 1 event/min)
BUILDING_COUNT=1 pnpm --filter simulator start

# Type-check all packages
pnpm typecheck

# Run all tests
pnpm test

# Validate contract fixtures (Coherence Guard 3)
pnpm test:fixtures
```

Makefile targets mirror the above commands.  See `Makefile` at the repo root.

---

## Build workflow (Windows + Korean path)

This repo lives at `C:\Users\Nam\Downloads\정산-handoff` — a path containing
Korean characters.  Rollup 4's native Windows binding (`rollup-win32-x64-msvc`)
calls `__fastfail()` and crashes with `0xC0000409` when run from a non-ASCII
cwd, killing `pnpm build` after vite finishes the JS-only transform pass.
This is a defensive bail inside the native binding, not a memory bug.

The pragmatic workaround is a **build mirror at an ASCII path**.  Editing,
git, planning, and `pnpm install` all run in this Korean-path repo as the
single source of truth.  The web app's build and dev server run from the
ASCII mirror.  A sync script keeps them in step.

```bash
# Sync changes from this repo to the ASCII mirror
./sync-to-build-mirror.sh           # sync only
./sync-to-build-mirror.sh diff      # show what's out of sync (read-only)
./sync-to-build-mirror.sh build     # sync + pnpm --filter web build
./sync-to-build-mirror.sh dev       # sync + start dev server

# Mirror path defaults to C:/Users/Nam/lucia-build; override per machine:
LUCIA_BUILD_MIRROR=/c/path/to/your/mirror ./sync-to-build-mirror.sh build
```

**Rules**:
- Source-of-truth = the Korean-path repo (this directory).  Commits, code
  review, and CI all run here.
- The mirror is generated from this repo via `sync-to-build-mirror.sh`.  Do
  NOT edit the mirror directly — those changes will be overwritten on the
  next sync.
- The script syncs `apps/{web,engine,simulator}/{src,configs,package.json}`,
  `packages/{contracts,db}/{src,fixtures,package.json}`, and root configs.
  Add new paths to the `PATHS` array if you create them.
- The mirror needs its own `pnpm install` run when `package.json`s change
  (the script doesn't auto-run install — too slow to be in the hot path).

When the dual-tree drifts (the mirror has files this repo doesn't, or vice
versa), `./sync-to-build-mirror.sh diff` reports the gap.  Source wins on
conflict; the mirror is regenerated.

This workaround is Windows-+-Korean-path-specific.  On macOS/Linux or with
an ASCII repo path, build directly: `pnpm --filter web build`.

---

## Coherence Guards — 5 rules every code change must satisfy

These are non-negotiable.  Every PR that violates one must be revised before merge.

1. **Tests pass**: tests in the changed package pass (`pnpm --filter <pkg> test`).

2. **Contracts are additive-only**: `packages/contracts` shape changes are
   additive (no removals or renames) after week 1 freeze.  Breaking changes
   require an ADR amendment and coordinated revision of all consumers.

3. **Fixtures validate**: `pnpm test:fixtures` must pass — every fixture in
   `packages/contracts/fixtures/` validates against its matching Zod schema.
   Fixtures are generated from schemas, not hand-authored.

4. **CLAUDE.md stays current**: update the package's `CLAUDE.md` if its purpose
   or conventions change.

5. **Commit references FR-ID**: commit message includes the FR-ID it satisfies,
   e.g. `feat(engine): FR-S-004 가상공유거래 split`.  This is enforced automatically
   by the `commit-msg` CI job in `.github/workflows/ci.yml` on every PR (chore/Merge/Revert commits are exempt).

---

## Critical FR references (promoted-Must list)

These FRs are on the M+3 demo critical path.  Read the FRD section before
implementing any of them.

| FR-ID | One-line summary | Demo step |
|---|---|---|
| FR-O-004 | Demo Mode — declarative storyboard, pause/resume, 9 steps | Step 0 (controller) |
| FR-S-004 | 가상공유거래 3-way split (LH 64.2% / 국민임대 10.9% / 에너지소외 35.8%) within 41% reservation | Step 2 |
| FR-S-008 | Tamper-attempt rejection — admin mutates chain data; chaincode rejects on hash mismatch; UI shows full-screen alert | Step 5 |
| FR-M-006 | Sankey energy-flow diagram (SPC → grid → buildings → households) | Step 4 |
| FR-M-007 | 입주민 portal — mock token auth, month picker, subsidy derivation, chain tx_id link | Step 6 |
| FR-M-008 | Live Tx Stream — WebSocket `/ws/transactions`, last-50 circular buffer, reconnect backoff | Step 3 |
| FR-O-001 | Load test — 116 / 1,000 / 9,354 buildings on AWS m6i.2xlarge; results embedded in demo | Step 8 |

See `.omc/plans/lucia-pilot-implementation.md` §"Spec deviations" for why
FR-O-004, FR-M-007, FR-M-008 were promoted from Should/Nice to Must.

---

## Hard gates — do NOT bypass

- Do NOT begin Track A or Track B feature work until **P0 acceptance gate** passes.
  Gate command: `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm test:fixtures && docker compose up -d && curl -fsS localhost:3000/healthz && pnpm chain:hello`.

- Do NOT begin B7.1 (full Demo Mode automation) until **wk6 cross-track integration
  smoke** (tasks A6.6 / B6.0) is green.

- Do NOT declare M+3 done without **FR-O-001 load test results from AWS**.
  A pre-recorded video is supplementary, not a primary FR-O-001 satisfier.

- If Hyperledger Fabric (P0.6) is not green by EOD day 4 of week 1, invoke the
  **ChainStub fallback** by day 5 (see ADR-0002 and risk R-1 in the plan).

---

## About untitled/ — historical reference only

`untitled/` contains the Claude Design prototype handoff that started this
project.  It is a low-tech single-HTML-page prototype with CDN React and
Babel-transpiled JSX files — **not** the production app.

**The new app lives in `apps/`.  Do not copy prototype internal structure unless
it happens to fit.**

The prototype remains valuable as a pixel-reference and copy-source:
- Color tokens, spacing, and Korean copy: `untitled/project/Lucia 정산 플랫폼.html`
  and its `src/*.jsx` files.
- `untitled/project/src/data.jsx` (`window.LUCIA_DATA`) is the source of mock
  numbers used in FRD §11.3 seed data targets — the seed script at
  `packages/db/src/seed.ts` implements those targets in production schema.
- `untitled/project/src/tweaks-panel.jsx` is design-tool scaffolding — drop it
  entirely; it has no place in the real app.

The previous root CLAUDE.md (prototype-focused) described this repo as a
"handoff bundle" with no build, no tests, no package.json.  That description
was accurate at handoff time but is no longer authoritative.  The monorepo
described in this file is the authoritative project.
