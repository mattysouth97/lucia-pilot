-- Migration 0003: seed_config table
-- Replaces the raw CREATE TABLE IF NOT EXISTS in seed.ts with a proper Drizzle-managed migration.
-- Engine reads: SELECT value FROM seed_config WHERE key = 'kie_rems'

CREATE TABLE IF NOT EXISTS "seed_config" (
  "key"        text PRIMARY KEY,
  "value"      jsonb NOT NULL,
  "updated_at" timestamptz DEFAULT now()
);
