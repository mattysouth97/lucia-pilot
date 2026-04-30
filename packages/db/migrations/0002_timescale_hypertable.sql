-- Migration 0002 — TimescaleDB hypertable for generation_events
-- Generated for: @lucia/db (Lucia Pilot, FRD-2026-001 v1.0)
-- DO NOT modify this file. Create a new migration for any changes.
-- Depends on: 0001_initial.sql (generation_events table must exist)

-- Enable the TimescaleDB extension (requires TimescaleDB image — see docker/postgres/Dockerfile)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert generation_events to a TimescaleDB hypertable partitioned by ts (UTC timestamptz).
-- if_not_exists=TRUE makes this migration idempotent.
SELECT create_hypertable(
  'generation_events',
  'ts',
  if_not_exists => TRUE
);

-- ─── Compression policy (DEFERRED to wk11 ops tuning / Phase 2) ──────────────
-- The following compression policy is intentionally NOT applied here.
-- It requires TimescaleDB Community Edition (compression is an enterprise feature
-- in older TSB versions; verify license before enabling).
--
-- To enable in wk11:
--   ALTER TABLE generation_events SET (
--     timescaledb.compress,
--     timescaledb.compress_segmentby = 'building_id',
--     timescaledb.compress_orderby = 'ts DESC'
--   );
--   SELECT add_compression_policy('generation_events', INTERVAL '7 days');
--
-- Retention policy (§11.2 FRD specifies no explicit retention for generation_events;
-- audit_logs are 5 years per NFR-6):
-- If retention is required, add via:
--   SELECT add_retention_policy('generation_events', INTERVAL '3 years');
-- This decision deferred to Phase 2 after confirming LH data governance requirements.
