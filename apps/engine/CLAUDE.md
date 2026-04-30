# @lucia/engine — Lucia 정산 엔진 + Mock APIs Host

## Purpose

This package is the **central runtime** for the Lucia pilot: it ingests solar generation
events from MQTT, runs settlement calculations (KPX, KETS, RE100, LH-Accounting), commits
results to Hyperledger Fabric via `fabric-network`, and serves the REST + WebSocket API
consumed by the `@lucia/web` dashboard.

It also hosts **mock external APIs** (`/api/mock/*`) so that wk3-wk4 integration tests
can run without live government systems.

## Route Layout

| Prefix            | Purpose                                          | FR ref         | Lands in |
|-------------------|--------------------------------------------------|----------------|----------|
| `/healthz`        | Liveness/readiness probe (postgres+redis+mqtt+fabric) | FR-O-001  | P0 (skeleton) |
| `/metrics`        | Prometheus scrape endpoint                       | FR-O-002       | P0 (skeleton) |
| `/api/version`    | Build version metadata                           | —              | P0 |
| `/api/buildings`  | List / detail 116 buildings                      | FR-S-002       | wk2 |
| `/api/settlements`| Settlement query + trigger                       | FR-S-003       | wk2 |
| `/api/admin/*`    | Admin controls (anomaly inject, config)          | FR-O-003       | wk3 |
| `/api/mock/kpx/*` | KPX SMP price mock                              | FR-X-001       | wk3 |
| `/api/mock/kets/*`| KETS REC mock                                   | FR-X-002       | wk3 |
| `/api/mock/re100/*` | RE100 certificate mock                        | FR-X-003       | wk3 |
| `/api/mock/lh-accounting/*` | LH accounting system mock             | FR-X-004       | wk4 |
| `/ws/transactions`| Real-time TX stream (FR-M-008)                  | FR-M-008       | wk5 |

## Per-Route Ownership

- **FR-S** (Settlement): `/api/buildings`, `/api/settlements` — owned by settlement team.
- **FR-X** (Mock externals): `/api/mock/*` — owned by integration team; shapes defined in
  `@lucia/contracts/external`.
- **FR-O-003** (Admin): `/api/admin/*` — owned by ops team.
- **FR-M-008** (WS stream): `/ws/transactions` — owned by frontend/realtime team.

## Coherence Guardrails

1. **Every new route MUST have a Zod-validated request/response schema** sourced from
   `@lucia/contracts`. Use `app.addSchema` + `$ref` or inline `.parse()` in the handler.
2. **Every new route MUST have at least one vitest test case** in `tests/` (unit) or
   `tests/integration/` (integration requiring live services).
3. No raw `any` types in route handlers — use `z.infer<typeof Schema>` or typed generics.

## BullMQ Queue Architecture (ADR-0003)

- One BullMQ queue **per building**: `queue:settlement:{building_id}`.
- Worker `concurrency=1` per queue to guarantee ordering within a building.
- All workers share a single ioredis connection pool (`REDIS_URL`).
- Queue registration happens in `src/queues/` (wk2). Do not add concurrency > 1
  without updating ADR-0003.

## Hyperledger Fabric / LevelDB Note (ADR-0002)

- Fabric wallet uses a **LevelDB** file wallet at `FABRIC_PROFILE` path.
- The gateway is initialized lazily on first settlement commit (wk5).
- Do NOT import `fabric-network` at module top-level in tests — guard with
  `if (process.env.NODE_ENV !== 'test')` or use the `skipExternal` flag.

## How to Add a New Mock API

1. Add the request/response Zod schema to `packages/contracts/src/external/`.
2. Create `src/routes/mock/{name}.ts` exporting a Fastify plugin.
3. Register the plugin in `src/server.ts` under `/api/mock/{name}`.
4. Add a vitest test in `tests/` that injects the route with `buildServer({ skipExternal: true })`.
5. Update the route table in this file.

## Development

```bash
cp .env.example .env      # fill in local values
pnpm dev                  # tsx watch — hot reloads on save
pnpm test                 # vitest unit suite (no live services)
pnpm test:integration     # requires docker-compose up
pnpm typecheck            # tsc --noEmit
```

## Key Environment Variables

| Variable         | Description                                      |
|------------------|--------------------------------------------------|
| `DATABASE_URL`   | TimescaleDB / PostgreSQL connection string       |
| `REDIS_URL`      | Redis URL for BullMQ queues                      |
| `MQTT_URL`       | MQTT broker for solar generation events          |
| `FABRIC_PROFILE` | Path to Fabric connection profile JSON           |
| `PORT`           | HTTP listen port (default 3000)                  |
| `LOG_LEVEL`      | Pino log level (default info)                    |
| `NODE_ENV`       | `development` enables pino-pretty transport      |
