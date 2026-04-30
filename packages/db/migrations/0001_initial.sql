-- Migration 0001 — initial schema for all FRD §11.1 entities
-- Generated for: @lucia/db (Lucia Pilot, FRD-2026-001 v1.0)
-- DO NOT modify this file. Create a new migration for any schema changes.

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE building_status AS ENUM ('ok', 'warn', 'alert', 'maintenance');
CREATE TYPE generation_source AS ENUM ('simulator', 'real');
CREATE TYPE beneficiary_category AS ENUM ('LH_매입임대', '국민임대', '에너지소외');
CREATE TYPE blockchain_tx_status AS ENUM ('confirmed', 'rejected', 'pending');
CREATE TYPE subsidy_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE anomaly_type AS ENUM ('inverter_fail', 'shadow', 'module_damage', 'low_yield', 'settlement_delay');
CREATE TYPE anomaly_severity AS ENUM ('info', 'warn', 'critical');
CREATE TYPE anomaly_source AS ENUM ('detector', 'admin_injected');
CREATE TYPE audit_action AS ENUM (
  'building.create',
  'building.update',
  'building.delete',
  'policy.update',
  'anomaly.inject',
  'anomaly.clear',
  'demo.start',
  'demo.pause',
  'demo.resume',
  'demo.jump',
  'tamper.attempt',
  'settlement.rollback',
  'mock.reset'
);

-- ─── buildings ────────────────────────────────────────────────────────────────
-- Master data: 116 LH Uljin buildings (ULJN-001..ULJN-116)
-- installed_kw stored as numeric(10,3); won values as numeric(14,2).

CREATE TABLE IF NOT EXISTS buildings (
  building_id    TEXT        PRIMARY KEY,
  region_office  TEXT        NOT NULL,
  city           TEXT        NOT NULL,
  district       TEXT        NOT NULL,
  address        TEXT        NOT NULL,
  lat            REAL        NOT NULL,
  lng            REAL        NOT NULL,
  installed_kw   NUMERIC(10, 3) NOT NULL,
  inverter_count INTEGER     NOT NULL,
  install_date   DATE        NOT NULL,
  status         building_status NOT NULL DEFAULT 'ok'
);

-- ─── generation_events ───────────────────────────────────────────────────────
-- TimescaleDB hypertable (partitioned by ts).
-- NOTE: hypertable creation is in 0002_timescale_hypertable.sql.
-- unique(building_id, ts) enforces per-building idempotency.

CREATE TABLE IF NOT EXISTS generation_events (
  event_id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id     TEXT        NOT NULL REFERENCES buildings(building_id) ON DELETE RESTRICT,
  ts              TIMESTAMPTZ NOT NULL,
  kwh             NUMERIC(10, 3) NOT NULL,
  inverter_temp_c REAL,
  source          generation_source NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS generation_events_building_ts_idx
  ON generation_events (building_id, ts);

-- ─── beneficiaries ───────────────────────────────────────────────────────────
-- 3 categories × 116 buildings = up to 348 rows (one per category per building).
-- share_ratio stored as numeric(6,5); monthly_subsidy_per_household as numeric(14,2).

CREATE TABLE IF NOT EXISTS beneficiaries (
  beneficiary_id                  TEXT        PRIMARY KEY,
  building_id                     TEXT        NOT NULL REFERENCES buildings(building_id) ON DELETE RESTRICT,
  category                        beneficiary_category NOT NULL,
  household_count                 INTEGER     NOT NULL,
  share_ratio                     NUMERIC(6, 5) NOT NULL,
  monthly_subsidy_per_household   NUMERIC(14, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS beneficiaries_building_idx ON beneficiaries (building_id);
CREATE INDEX IF NOT EXISTS beneficiaries_category_idx ON beneficiaries (category);

-- ─── residents ───────────────────────────────────────────────────────────────
-- FR-M-007 demo identities (3 mock rows); PII masked per NFR-4.

CREATE TABLE IF NOT EXISTS residents (
  resident_id       TEXT PRIMARY KEY,
  beneficiary_id    TEXT NOT NULL REFERENCES beneficiaries(beneficiary_id) ON DELETE CASCADE,
  category          beneficiary_category NOT NULL,
  building_id       TEXT NOT NULL REFERENCES buildings(building_id) ON DELETE RESTRICT,
  masked_name       TEXT NOT NULL,
  mock_login_token  TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS residents_token_idx ON residents (mock_login_token);

-- ─── settlements ─────────────────────────────────────────────────────────────
-- Settlement result per generation event.
-- cash_flow stored as JSONB (SettlementCashFlow shape from @lucia/contracts).
-- payload_hash: SHA-256 hex (64 chars); prev_hash nullable for first in chain.
-- tx_id + block_height: null until confirmed on Hyperledger Fabric.

CREATE TABLE IF NOT EXISTS settlements (
  settlement_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID        NOT NULL REFERENCES generation_events(event_id) ON DELETE CASCADE,
  building_id    TEXT        NOT NULL,
  ts             TIMESTAMPTZ NOT NULL,
  kwh            NUMERIC(10, 3) NOT NULL,
  cash_flow      JSONB       NOT NULL,
  payload_hash   TEXT        NOT NULL,
  prev_hash      TEXT,
  tx_id          TEXT,
  block_height   INTEGER
);

CREATE INDEX IF NOT EXISTS settlements_building_ts_idx ON settlements (building_id, ts DESC);
CREATE INDEX IF NOT EXISTS settlements_event_idx ON settlements (event_id);
CREATE INDEX IF NOT EXISTS settlements_tx_idx ON settlements (tx_id) WHERE tx_id IS NOT NULL;

-- ─── blockchain_txs ──────────────────────────────────────────────────────────
-- Mirror of on-chain tx records (Hyperledger Fabric).
-- payload_blob: canonical-JSON text (exact serialization for hash verification).

CREATE TABLE IF NOT EXISTS blockchain_txs (
  tx_id            TEXT PRIMARY KEY,
  block_height     INTEGER     NOT NULL,
  hash             TEXT        NOT NULL,
  prev_hash        TEXT,
  payload_blob     TEXT        NOT NULL,
  ts               TIMESTAMPTZ NOT NULL,
  status           blockchain_tx_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT
);

CREATE INDEX IF NOT EXISTS blockchain_txs_status_idx ON blockchain_txs (status);
CREATE INDEX IF NOT EXISTS blockchain_txs_ts_idx ON blockchain_txs (ts DESC);

-- ─── subsidies ───────────────────────────────────────────────────────────────
-- Housing subsidy disbursement per (beneficiary, period).
-- amount in KRW as numeric(14,2).

CREATE TABLE IF NOT EXISTS subsidies (
  subsidy_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id  TEXT        NOT NULL REFERENCES beneficiaries(beneficiary_id) ON DELETE RESTRICT,
  settlement_id   UUID        NOT NULL REFERENCES settlements(settlement_id) ON DELETE RESTRICT,
  period          TEXT        NOT NULL,
  amount          NUMERIC(14, 2) NOT NULL,
  status          subsidy_status NOT NULL DEFAULT 'pending',
  sent_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS subsidies_beneficiary_period_idx ON subsidies (beneficiary_id, period);
CREATE INDEX IF NOT EXISTS subsidies_settlement_idx ON subsidies (settlement_id);

-- ─── anomalies ───────────────────────────────────────────────────────────────
-- FR-M-004 anomaly detection records.
-- drop_pct: nullable — null for non-yield anomalies (e.g. settlement_delay).

CREATE TABLE IF NOT EXISTS anomalies (
  anomaly_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id  TEXT        NOT NULL REFERENCES buildings(building_id) ON DELETE RESTRICT,
  type         anomaly_type NOT NULL,
  detected_at  TIMESTAMPTZ NOT NULL,
  resolved_at  TIMESTAMPTZ,
  severity     anomaly_severity NOT NULL,
  drop_pct     NUMERIC(7, 2),
  source       anomaly_source NOT NULL
);

CREATE INDEX IF NOT EXISTS anomalies_building_idx ON anomalies (building_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS anomalies_severity_idx ON anomalies (severity) WHERE resolved_at IS NULL;

-- ─── audit_logs ──────────────────────────────────────────────────────────────
-- NFR-6 / FR-O-003 — 5-year retention (§11.2).
-- payload: JSONB; engine validates per-action schema separately.
-- RETENTION: DO NOT purge rows without explicit PM approval. 5-year policy enforced at storage level.

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action      audit_action NOT NULL,
  actor       TEXT        NOT NULL,
  ts          TIMESTAMPTZ NOT NULL,
  payload     JSONB       NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs (action, ts DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs (actor, ts DESC);
CREATE INDEX IF NOT EXISTS audit_logs_ts_idx ON audit_logs (ts DESC);
