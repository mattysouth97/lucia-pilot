# ADR-0003 — MQTT → Engine → TimescaleDB Ingestion Path with Per-Building FIFO

**Status**: Accepted
**Date**: 2026-04-30
**Source**: `.omc/plans/lucia-pilot-implementation.md` § ADR-0003

## Context

The settlement pipeline must ingest real-time generation events from 116 buildings (scaling to 9,354 in load tests), validate them within 50ms (FR-S-001), persist them into a TimescaleDB hypertable, and then trigger chain submission in a deterministic per-building order. Two invariants must hold simultaneously:

1. **Per-building FIFO**: chain submission for a given building must be strictly ordered so that `prev_hash` linkage is correct (required by ADR-0002 determinism and FR-S-009 audit reproducibility).
2. **Aggregate throughput**: the system must sustain 100 TPS chain submissions across all buildings (FR-S-007) and 100 msg/s MQTT ingest with 0% loss (FR-D-003).

A naive global FIFO serializes all buildings and caps throughput well below 100 TPS. Fully concurrent processing breaks per-building hash-chain ordering. A partitioned approach is required.

**FR anchors**: FR-D-003, FR-S-001, FR-S-007, FRD §11.2 retention policy.

## Decision

Mosquitto broker; simulator publishes to `site/{building_id}/generation` with QoS 1; engine subscribes with `site/+/generation`; events are validated, INSERTed into the `generation_events` hypertable, and settlement is triggered async via **BullMQ named queues partitioned by `building_id`**.

Within a single building's queue, processing is strictly FIFO (concurrency = 1 per partition). Across buildings, queues run in parallel (allowing 116-way parallelism). This preserves per-building hash-chain ordering while sustaining FR-S-007's 100 TPS aggregate target.

## Decision Drivers

- FR-D-003: 100 msg/s ingest with 0% loss
- FR-S-001: 50ms event validation budget
- FR-S-007: 100 TPS chain throughput with determinism per building
- FRD §11.2: TimescaleDB retention policy for `generation_events` hypertable
- Phase 2 real-IoT ingest path must be non-breaking (same MQTT topic schema)

## Alternatives Considered

- **Single global FIFO queue (concurrency = 1)**: preserves global ordering but caps aggregate throughput well below 100 TPS. Rejected.
- **Default BullMQ concurrent processing (no partition)**: approximately 6x faster but breaks per-building `prev_hash` linkage. Rejected.
- **Per-building queues via BullMQ Pro Groups**: the paid BullMQ Pro feature would solve this natively, but the cost is not justified for a pilot. Rejected.
- **Application-level locking via Redlock**: viable but error-prone compared to queue-level partitioning; adds failure modes around lock expiry. Rejected.
- **Kafka with partition-by-building-id**: Kafka is the natural fit at scale, but ops cost and complexity are not justified at 100 msg/s. Rejected for pilot; noted for Phase 2 at 9,354-building scale.
- **Direct HTTP from simulator to engine**: loses pub/sub semantics and does not match the Phase 2 real-IoT ingest path. Rejected.

## Why Chosen

BullMQ named queues keyed by `building_id` is the simplest mechanism that maintains determinism without sacrificing throughput. 116 parallel queues x concurrency 1 each = effective 116 TPS ceiling, comfortably above the 100 TPS target. Redis (already required for BullMQ) and Mosquitto are both small footprint additions to the docker-compose stack.

## Consequences

- Mosquitto broker and Redis added to `docker/docker-compose.yml`.
- Idempotency enforced by `event_id` upsert on `generation_events`; malformed events are routed to a dead-letter topic (DLQ) for operator review.
- Per-building queue lifecycle: created on first event for a building, cleaned up after idle-timeout. Memory footprint is bounded by active building count (Risk R-10: if active queue count exceeds 200, add explicit `queue.close()` on per-building MQTT silence).
- Test surface: per-building FIFO ordering must be unit-tested — out-of-order publish must produce in-order chain submission. See task A3.1.
- TimescaleDB compression policies are tuned in P3 wk11.
- Smoke load test in wk4 (A4.4): 100 msg/s for 5 minutes, 0% loss, per-building ordering verified.

## Follow-ups

- TimescaleDB compression policies tuned in P3 wk11 (task P3.5 context).
- Phase 2: re-evaluate Kafka partition strategy at 9,354-building scale where BullMQ queue count and Redis memory become limiting factors.
- Wk7 (A7.2): 30-minute sustained 100 msg/s run with memory-leak watch on queue lifecycle.
