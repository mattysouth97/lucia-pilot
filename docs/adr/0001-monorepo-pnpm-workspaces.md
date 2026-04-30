# ADR-0001 — Monorepo with pnpm Workspaces

- Status: Accepted (2026-04-30, ralplan consensus iter 1)

## Context

The Lucia Pilot requires coordinated development across three applications (web dashboard, settlement engine, simulator) plus shared infrastructure (typed contracts, DB schema). Without a unified repository strategy, cross-package type drift becomes a primary risk vector — especially in a single-PM + AI-augmentation model where no human peer reviewer catches divergence. A coherence mechanism must be structural, not procedural.

## Decision

pnpm-workspaces monorepo. Top-level directories: `apps/` (web, engine, simulator), `packages/` (contracts, db), `chain/` (Go chaincode), `docker/`, `docs/`, `infra/`, `.omc/`.

## Decision Drivers

- Shared types via single source of truth (`packages/contracts`) — `apps/web`, `apps/engine`, `apps/simulator` all depend on the same compiled shapes
- Single CI pipeline — one `pnpm install` and one `pnpm typecheck` covers all packages
- Atomic cross-package commits — a type change and its consumers land in one commit, eliminating the window where they diverge
- Agent context coherence — AI agents operating on the monorepo see the full dependency graph in one workspace, reducing hallucination risk on import paths
- `packages/contracts` additive-only freeze enforced by CI (`pnpm typecheck`) from end of week 1 onward

## Alternatives Considered

- **Turborepo**: heavier toolchain with caching daemon; no clear benefit at this team size and scale. Adds ops complexity without throughput gain.
- **Polyrepo (4 separate repos)**: defeats the contract-coherence goal entirely. Cross-repo type sync requires explicit publish/version bumps — a real cost and a real drift risk in a 12-week sprint with a single PM. Rejected.
- **Nx**: similar to Turborepo — over-engineered for this scale.

## Consequences

- Requires Node 20 + pnpm 9 on all development and CI machines
- CI runs `pnpm --filter <package> typecheck/test/build` per package; root `pnpm typecheck` covers all
- `packages/contracts` shapes are additive-only after week 1 freeze; breaking changes require an ADR amendment
- Go chaincode lives under `chain/` and is tested via `go test ./...` in the same CI run (see `.github/workflows/ci.yml`)
- All per-package `CLAUDE.md` files must be kept current as package purpose evolves (Coherence Guard 4)

## Follow-ups

- Revisit Turborepo if incremental build times exceed acceptable budget post-M+3 (Phase 2 scope)
- Evaluate `pnpm --filter` dependency graph pruning if workspace grows beyond current 6 packages
