# ADR-0002 — Engine ↔ Chaincode Boundary

- Status: Accepted (2026-04-30, ralplan consensus iter 1)

## Context

The FRD frames the system as "Lucia 정산 엔진 + Hyperledger Fabric 원장" — a settlement engine that computes and a blockchain ledger that records. The precise boundary between what runs in the Node/TS engine vs. what runs in the Go chaincode is a foundational decision: it determines iteration velocity (chaincode upgrades in Fabric are expensive), demo-laptop memory budget, and the determinism guarantees required for audit reproducibility (FR-S-009).

The demo environment is a 16 GB laptop simultaneously running Postgres + TimescaleDB, Redis, Mosquitto, and a full Fabric network (orderer + peer). Memory pressure is a real constraint.

## Decision

Engine (Node/TS) submits transactions to Fabric via `fabric-network` SDK to Go chaincode. **Chaincode is dumb persistence + hash-chain integrity — no business logic.** All settlement math runs in the engine; chaincode stores the immutable result plus hash linkage.

**State DB choice**: LevelDB (Fabric's default key-value store) for the demo target on the 16 GB laptop. CouchDB is reserved for Phase 2 production where rich ad-hoc queries justify its cost.

Chain operations (`Settle`, `Verify`, `History` by `building_id`) are all key-based lookups that LevelDB handles natively.

## Decision Drivers

- Chaincode upgrades in Fabric require lifecycle approval + endorsement — expensive to iterate on math changes
- Settlement math iteration must be fast; engine-in-TS is where AI agents are most fluent
- Clean separation of concerns: engine computes, chain records
- FR-S-007: 100 TPS / 1.5s avg latency target must be met within 16 GB demo laptop budget
- CouchDB on demo laptop alongside Postgres + TimescaleDB + Redis + Mosquitto + Fabric peer would saturate memory and degrade the 100 TPS target

## Alternatives Considered

- **Settlement math inside chaincode (Go-native)**: chaincode upgrades are expensive in Fabric (lifecycle + endorsement). Fast iteration on the math formula (FR-S-002/003/004/006) would be impractical. Rejected.
- **HTTP shim over chain (engine talks REST to a sidecar that talks Fabric)**: adds a network hop with no benefit; more failure modes; no latency gain. Rejected.
- **CouchDB state DB on demo laptop**: memory pressure degrades 100 TPS target when co-located with Postgres + TimescaleDB + Redis + Mosquitto + Fabric. Rejected for demo; reserved for Phase 2.

## Consequences

- Engine must be **deterministic** for settlement math — audit reproducibility (FR-S-009) requires that re-running a settlement on the same inputs produces the same result and the same hash
- Chain stores `payload_hash` + `payload_blob`; full payload is also stored in Postgres for fast query (no need to hit chain for reporting)
- Chain interface: `Settle(payload, prev_hash)` returning `{tx_id, block_height, hash}`; `Verify(tx_id)`; `History(building_id, range)`
- Per-building hash-chain ordering is required — see ADR-0003 for how the ingestion path enforces this invariant
- LevelDB used for demo; CouchDB swap-in for Phase 2 is a **config change only, no chaincode rewrite**
- Go surface area is deliberately minimal: stable patterns, small footprint, straightforward test surface

## Follow-ups

- Phase 2: evaluate moving validation rules into chaincode for stronger on-chain guarantees
- Phase 2: swap to CouchDB state DB if rich ad-hoc queries (building cross-joins, time-range scans) become necessary at production scale
- Phase 2: load tests against real Fabric production network (see also ADR-0007)
