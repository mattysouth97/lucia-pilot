# ADR-0004 — Mock External API Shapes

**Status**: Accepted
**Date**: 2026-04-30
**Source**: `.omc/plans/lucia-pilot-implementation.md` § ADR-0004

## Context

The Lucia settlement engine integrates with five external systems prescribed by FRD-2026-001: KPX (SMP price feed), REC registry, LH 회계 system, RE100 ESG registry, and K-ETS (emissions trading). None of these APIs are available during the pilot phase. Phase 2 will connect to real endpoints using the same integration contracts.

The critical constraint is that **Phase 2 swap-in must be non-breaking** — both on the engine's calling code and on the shared `packages/contracts` types that the frontend also consumes. This means the mock implementations must match FRD-prescribed input/output schemas exactly, not approximate them.

A secondary constraint is **demo determinism**: REC certificate state and other stateful mocks must be resettable to a known baseline before each demo run (FR-O-004 storyboard reliability).

**FR anchors**: FR-X-001 (KPX SMP), FR-X-002 (REC), FR-X-003 (LH 회계), FR-X-004 (RE100 ESG), FR-X-005 (K-ETS); response budget FR-X-001: 100ms.

## Decision

Each Mock API lives at `apps/engine/src/mock/<name>.ts` with a Fastify route prefix `/api/mock/<name>/*`. Each module exports a typed contract in `packages/contracts/external/<name>.ts` matching the FRD-prescribed input/output schema exactly. Stateful mocks (e.g., REC certificate issuance/transfer/burn state machine) use an in-memory `Map<string, ...>` with admin reset endpoints (`POST /api/mock/<name>/reset`) to support demo determinism.

The five mocks and their week-5 tasks:
- **KPX SMP** (A5.1): hourly price pattern, 119원 ±10원, 5-minute cache, 100ms response budget
- **REC registry** (A5.2): issue/transfer/burn state machine; `Map<string, ...>`; admin reset
- **LH 회계** (A5.3): per FRD-prescribed accounting schema
- **RE100 ESG** (A5.3): per FRD-prescribed ESG reporting schema
- **K-ETS** (A5.3): per FRD-prescribed emissions trading schema

FR-X-003/004/005 are FRD "Should-Have" but are implemented in wk5 alongside FR-X-001/002 because they are cheap in-memory routes that round out the demo experience and the Phase 2 contract surface. **Effective promotion to Must in this plan.**

## Decision Drivers

- Phase 2 swap to real APIs must be non-breaking — same `packages/contracts/external/<name>.ts` contract, new route handler implementation only
- FR-X-001: 100ms response budget (in-process mock trivially satisfies this)
- Demo determinism — admin reset endpoints allow storyboard to start from a clean state (FR-O-004)
- `packages/contracts` additive-only freeze: mock contracts are part of the frozen surface after wk5

## Alternatives Considered

- **Five separate microservices (one per external API)**: ops cost not justified for pilot; harder to keep contracts synchronized with `packages/contracts`; adds docker-compose complexity. Rejected.
- **msw (Mock Service Worker) on the frontend only**: does not help engine-side code paths, which must also exercise the integration contracts. Rejected.
- **Hand-crafted fixture files without typed contracts**: breaks the Phase 2 swap guarantee — if the mock shape drifts from the FRD schema, the swap will require engine changes. Rejected.

## Why Chosen

Same monorepo, same contract file, swap-ready. Phase 2 only changes the route handler implementation behind the same `/api/mock/<name>/*` prefix (or replaces it with a real adapter at a different prefix). The `packages/contracts/external/<name>.ts` types remain unchanged. CI enforces stability of these contracts after wk5 via `pnpm typecheck`.

## Consequences

- Engine (`apps/engine`) gains approximately 25 additional Fastify routes across the five mock modules.
- CI must enforce stability of `packages/contracts/external/<name>.ts` after wk5: no breaking changes without an ADR amendment.
- Admin reset endpoints (`POST /api/mock/<name>/reset`) are admin-auth gated and used by the DemoController storyboard (ADR-0006).
- `pnpm test:fixtures` CI gate validates that `packages/contracts/fixtures/` shapes match engine response serialization, catching any mock-vs-contract drift before integration day.

## Follow-ups

- Phase 2: replace each `apps/engine/src/mock/<name>.ts` handler with a real adapter using the same `packages/contracts/external/<name>.ts` contract. No engine calling code changes required.
- CI stability gate on `packages/contracts/external/` shapes after wk5 (Coherence Guard 2).
