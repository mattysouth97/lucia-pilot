# apps/simulator — CLAUDE.md

## Purpose

`@lucia/simulator` is the **116-building MQTT publisher + KIE-REMS sim seed
loader + admin anomaly injector** for the Lucia Pilot monorepo.  It emulates
the physical solar-panel telemetry stream (FR-D-001) so the settlement engine
(`apps/engine`) can be exercised without real IoT hardware during M+0 … M+3.

FRD reference: FR-D-001 (generation simulation), FR-D-002 (anomaly injection),
FR-D-003 (100 msg/s sustained throughput).
See also ADR-0003 (MQTT ingestion path).

---

## What the simulator does

1. **Generation publisher** (`src/index.ts`): connects to Mosquitto, spawns one
   `setInterval` per building (default 1 event/min = 60,000 ms), and publishes
   a `GenerationEventInput` payload to `site/{building_id}/generation` at QoS 1.

2. **Solar model** (`src/solar.ts`): realistic generation pattern — Gaussian
   envelope centred at solar noon (12:00 KST, UTC+9), sigma 3 h, zero outside
   06:00–19:00 KST window, configurable ±10% noise (FR-D-001).  In
   `DETERMINISTIC_MODE=true`, noise is zeroed for demo reproducibility.

3. **MQTT client wrapper** (`src/mqtt.ts`): typed `connect()` / `publishGeneration()`
   / `subscribeAnomalyInjection()` API over the `mqtt` npm package; exponential
   backoff reconnect.

4. **Anomaly injection consumer**: subscribes to `site/+/anomaly/admin` (QoS 1)
   and applies the requested anomaly type for the specified duration.  Admin
   commands arrive via the engine's `POST /api/admin/anomaly` endpoint, which
   publishes to this topic (FR-D-002).

---

## MQTT topic shape

| Direction | Topic | QoS | Payload type |
|---|---|---|---|
| Publish | `site/{building_id}/generation` | 1 | `GenerationEventInput` (JSON) |
| Subscribe | `site/{building_id}/anomaly/admin` | 1 | `AnomalyInjectionPayload` (JSON) |

`building_id` format: `ULJN-001` … `ULJN-116`.

Engine subscribes with wildcard `site/+/generation` and `site/+/anomaly/admin`.

---

## Solar model (solar.ts) — FR-D-001

```
output(t) = installedKw × (1/60) h × gaussian(kstHour, 12, 3) × noise
```

where `noise = 1 + uniform(-0.1, 0.1)` when `noiseRatio = 0.1`.

Returns 0 outside 06:00–19:00 KST.  Each tick represents a 1-minute interval
so the unit is kWh per minute.

Set `DETERMINISTIC_MODE=true` to zero noise — used by the Demo Mode controller
(ADR-0006) to produce predictable on-screen values during the LH demo.

---

## Env vars

| Variable | Default | Description |
|---|---|---|
| `MQTT_URL` | `mqtt://localhost:1883` | Mosquitto broker URL |
| `BUILDING_COUNT` | `1` | Number of buildings to simulate (max 116) |
| `TICK_INTERVAL_MS` | `60000` | Interval per building in ms (min 1000) |
| `DETERMINISTIC_MODE` | `false` | Zero noise if `true` |
| `LOG_LEVEL` | `info` | pino log level |
| `NODE_ENV` | `development` | Enables pino-pretty in dev |

---

## mqtt.ts — client wrapper API

```typescript
import { connect, MqttWrapper } from './mqtt.js';

const wrapper: MqttWrapper = await connect('mqtt://localhost:1883');
await wrapper.publishGeneration('ULJN-001', payload);
await wrapper.subscribeAnomalyInjection((building_id, anomalyPayload) => { … });
await wrapper.end();
```

Reconnect strategy: exponential backoff starting at 1 s, doubling each attempt,
capped at 60 s.  The built-in `mqtt` reconnectPeriod is disabled; backoff is
managed in `mqtt.ts` to allow future tuning without touching the broker config.

All payloads are typed via `@lucia/contracts` (`GenerationEventInput`,
`AnomalyInjectionPayload`).

---

## KIE-REMS sim seed loader

In week 4 (task A4.2), the simulator reads per-building installed capacity from
the `seed_config` row (`key = 'kie_rems'`) seeded by `packages/db/src/seed.ts`.
Until then, `INSTALLED_KW_DEFAULT = 26` kW is used as a constant in `index.ts`.

The loader calls `createDb(DATABASE_URL)` from `@lucia/db` on startup and caches
the inverter-master map in memory.  It does **not** poll the DB during operation.

---

## 100 msg/s throughput (FR-D-003)

With 116 buildings at 1 event/min each, the default rate is ~1.93 msg/s.  For
the FR-D-003 100 msg/s acceptance test, set `TICK_INTERVAL_MS=10000` and
`BUILDING_COUNT=116` (or use the k6 load driver from `infra/load/`).

The smoke load test in wk4 (task A4.4) runs 100 msg/s for 5 minutes.

---

## Graceful shutdown

`SIGTERM` / `SIGINT` clears all building intervals, calls `client.endAsync()`,
and exits 0.  Ensure Docker Compose sends SIGTERM (default) — do not use
`SIGKILL` in development as it leaks MQTT sessions.

---

## Links

- ADR-0003: MQTT ingestion path — `docs/adr/ADR-0003-mqtt-ingestion-bullmq.md`
- Plan A4.1–A4.4: MQTT pipeline + simulator core — `.omc/plans/lucia-pilot-implementation.md`
- `@lucia/contracts` domain types — `packages/contracts/src/domain/generation-event.ts`
- FRD FR-D-001..003: `untitled/project/uploads/TheKIE_LH_FRD.docx`
