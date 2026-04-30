# packages/db — CLAUDE.md

## Purpose

This package owns the Drizzle ORM schema, migrations, and seed script for
all FRD §11.1 entities in the Lucia Pilot monorepo.  It is the single source
of truth for the relational/TimescaleDB layer that backs the settlement engine
(`apps/engine`) and is imported by the web BFF layer.

FRD reference: FRD-2026-001 §11.1 (Entity definitions) and §11.3 (Seed data
targets).  See also ADR-0001 (monorepo layout) and the consensus plan at
`.omc/plans/lucia-pilot-implementation.md` (task P0.4).

---

## Schema overview

Tables live in `src/schema/` — one file per entity.  The barrel `src/schema/index.ts`
re-exports everything for Drizzle Kit and for consumers.

| File | Table | Notes |
|---|---|---|
| `buildings.ts` | `buildings` | 116 LH 매입임대주택 동 |
| `beneficiaries.ts` | `beneficiaries` | 2,839 household groups (3 categories) |
| `residents.ts` | `residents` | Mock portal identities (NFR-4 masked) |
| `generation-events.ts` | `generation_events` | TimescaleDB hypertable — see below |
| `settlements.ts` | `settlements` | 9 cash-flow fields in JSONB `cash_flow` |
| `anomalies.ts` | `anomalies` | FR-M-004 anomaly log |
| `blockchain-txs.ts` | `blockchain_txs` | Chain confirmations (tx_id, block_height) |
| `subsidies.ts` | `subsidies` | FR-S-004 per-building subsidy records |
| `audit-logs.ts` | `audit_logs` | NFR-6 admin-action immutable log |

---

## Conventions

- **Column names**: snake_case (matches Drizzle defaults and Postgres conventions).
- **Primary keys**: `text` PK for business-key entities (`buildings`, `beneficiaries`,
  `residents`); `uuid` with `defaultRandom()` for event/settlement/audit rows.
- **Timestamps**: always `timestamp with time zone` (pass `{ withTimezone: true }` to
  Drizzle's `timestamp()` helper).  Store and query in UTC; display in KST (UTC+9) at
  the UI layer.
- **Monetary values**: `numeric` with explicit `precision` and `scale` — never `float`
  or `real`.  Settlement cash-flow fields are JSONB and typed via `SettlementCashFlow`
  from `@lucia/contracts`.
- **Enums**: `pgEnum()` per column; names mirror the Zod enum in `@lucia/contracts`.
  Zod is NOT used inside this package (schema-side only).

---

## TimescaleDB hypertable

`generation_events` is declared as a regular table in `generation-events.ts` but must
be converted to a hypertable after the initial migration:

```sql
SELECT create_hypertable('generation_events', 'ts', if_not_exists => TRUE);
```

This is idempotent and is included in the migration applied by `pnpm db:migrate`.
Compression policies (chunk interval 1 day, compress after 7 days) are applied in
P3 wk11 per the plan.

---

## How to run migrations

```bash
# Requires DATABASE_URL pointing at a running Postgres + TimescaleDB instance.
export DATABASE_URL=postgres://lucia:password@localhost:5432/lucia_pilot

# Generate a new migration from schema changes:
pnpm --filter @lucia/db generate

# Apply all pending migrations:
pnpm --filter @lucia/db migrate
```

Drizzle Kit config: `drizzle.config.ts` at the package root.
Migration output directory: `migrations/`.

---

## How to run the seed

```bash
export DATABASE_URL=postgres://lucia:password@localhost:5432/lucia_pilot
pnpm --filter @lucia/db seed
```

The seed script (`src/seed.ts`) is idempotent — every INSERT uses
`ON CONFLICT DO NOTHING`.  Re-running is safe and will log `inserted: 0` for
rows that already exist.

Seed targets (FRD §11.3):
- 116 buildings (`ULJN-001` to `ULJN-116`), 25.86 kW each, across 10 Uljin districts.
- ULJN-042 status `alert`; ULJN-058 status `warn`; all others `ok`.
- 2,839 beneficiary rows: 1,643 LH 매입임대, 280 국민임대, 916 에너지소외.
  Share ratios from `SHARE_RATIO_PINNED` in `@lucia/contracts/domain/beneficiary`.
- 3 mock residents with masked names (홍*동, 김*수, 이*경) and UUID tokens.
- 4 RE100 companies logged for FR-X-004 reference.
- KIE-REMS sim master (regions + inverter master) stored in `seed_config` table.

---

## ON CONFLICT DO NOTHING rule

Every seed INSERT must include `.onConflictDoNothing()` (Drizzle ORM) or the raw
SQL equivalent `ON CONFLICT DO NOTHING`.  Never use `ON CONFLICT DO UPDATE` in seed
scripts — that would silently overwrite production data if seed is accidentally re-run
against a live database.

---

## createDb helper

`src/index.ts` exports a `createDb(connectionString)` factory that returns a typed
Drizzle client using the `postgres-js` driver.  Import it as:

```typescript
import { createDb } from '@lucia/db';
const db = createDb(process.env.DATABASE_URL!);
```

The underlying `postgres` client is bounded to max 10 connections with a 30 s idle
timeout.  Call `sql.end()` during graceful shutdown if you need explicit teardown.

---

## Links

- ADR-0001: monorepo layout — `docs/adr/ADR-0001-monorepo-pnpm-workspaces.md`
- Plan P0.4: `packages/db` Drizzle schema + seed — `.omc/plans/lucia-pilot-implementation.md`
- FRD §11.1 entity definitions — `untitled/project/uploads/TheKIE_LH_FRD.docx`
