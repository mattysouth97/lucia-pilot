# k6 Load Test Scenarios — Lucia Pilot FR-O-001

## 목적 (Purpose)

FR-O-001 요구사항: 시스템은 9,354개 건물의 동시 발전량 데이터 수집 및 정산을 지원해야 한다.

This directory contains k6 scenario files used to validate that the Lucia settlement
platform meets its non-functional requirements at three building-count tiers.

---

## Scenario Tiers

| Tier   | VUS (buildings) | Duration | Purpose                                                     |
|--------|-----------------|----------|-------------------------------------------------------------|
| dev    | 116             | 2m       | Local development smoke test — matches the LH-Uljin pilot  |
| smoke  | 1,000           | 5m       | CI / pre-prod harness validation — catches regressions      |
| full   | 9,354           | 15m      | FR-O-001 acceptance gate — must pass before wk8 milestone   |

Run via `run-loadtest.sh`:
```bash
bash infra/aws/run-loadtest.sh smoke   # 1,000 buildings
bash infra/aws/run-loadtest.sh full    # 9,354 buildings
```

For local dev runs (116 buildings) with a locally running stack:
```bash
k6-mqtt run -e VUS=116 -e MQTT_BROKER=tcp://localhost:1883 -e API_BASE=http://localhost:3000 \
  infra/aws/k6-scenarios/lucia-load.js
```

---

## Pass Criteria

The FR-O-001 milestone is green only when all three thresholds pass in the **full** run.

| Metric                  | Threshold     | FRD reference                                  |
|-------------------------|---------------|------------------------------------------------|
| `settlement_latency` p95 | <= 5,000 ms  | NFR-1: 정산 처리 지연 5초 이내                  |
| `dashboard_latency` p95  | <= 3,000 ms  | NFR-3: 대시보드 갱신 3초 이내                   |
| `http_req_failed` rate   | < 1%         | NFR-2: 가용성 99.5% (settlement API)           |
| `mqtt_publish_failed` rate | < 1%       | FR-D-003: MQTT 100 msg/s 수신 처리             |

k6 prints a PASS/FAIL summary for each threshold at the end of the run. A green
checkmark next to all four thresholds = FR-O-001 accepted.

---

## How to Read the k6 Output

```
  settlement_latency...: avg=1234ms min=88ms med=1120ms max=4890ms p(90)=3210ms p(95)=3980ms
```

- `p(95)` is the critical value — it must be below the threshold.
- `avg` gives a feel for typical behavior; ignore it for pass/fail decisions.
- `max` spikes above the threshold are acceptable as long as `p(95)` passes.

If `settlement_latency p(95)` fails:
1. Check whether the Lucia engine is under-provisioned (CPU/memory).
2. Check chaincode submission latency — FR-S-007 100 TPS target.
3. Check TimescaleDB write throughput.
4. Check MQTT broker queue depth.

If `dashboard_latency p(95)` fails:
1. Check Redis cache hit rate on settlement result queries.
2. Check Next.js SSR response time for the 대시보드 (dashboard) page.

---

## Scenario File

`lucia-load.js` implements two phases per VU iteration:

1. **MQTT publish** — each VU represents one IoT building gateway publishing a
   generation kWh reading to `site/{building_id}/generation`. Uses xk6-mqtt.
   Payload matches `packages/contracts/fixtures/generation-event.json`.

2. **HTTP poll** — each VU queries `/api/settlements?building_id=...` simulating
   the dashboard's live data refresh. Measures response time against NFR-3.

Settlement latency is measured end-to-end: from MQTT publish timestamp to HTTP
response received. This approximates the real user experience of FR-S-008
(정산 결과 조회).

---

## Environment Variables

| Variable       | Default                   | Description                              |
|----------------|---------------------------|------------------------------------------|
| `VUS`          | `116`                     | Number of virtual buildings              |
| `MQTT_BROKER`  | `tcp://localhost:1883`    | MQTT broker connection string            |
| `API_BASE`     | `http://localhost:3000`   | Lucia engine API base URL                |

---

## FRD Cross-References

| Scenario element       | FRD code   | Requirement                                              |
|------------------------|------------|----------------------------------------------------------|
| MQTT publish rate      | FR-D-003   | 100 msg/s MQTT 수신 처리                                  |
| Settlement latency     | NFR-1      | 정산 처리 지연 <= 5,000 ms (p95)                          |
| Dashboard refresh      | NFR-3      | 대시보드 갱신 <= 3,000 ms (p95)                           |
| 9,354 building tier    | FR-O-001   | 9,354개 건물 동시 수집 및 정산                             |
| Settlement query API   | FR-S-008   | 정산 결과 조회 API                                        |
| Chaincode TPS          | FR-S-007   | 100 TPS 체인코드 트랜잭션                                  |
