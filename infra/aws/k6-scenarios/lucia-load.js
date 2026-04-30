/**
 * lucia-load.js — k6 load scenario for FR-O-001
 *
 * FR-O-001: 시스템은 9,354개 건물의 동시 발전량 데이터 수집 및 정산을 지원해야 한다.
 *
 * NFR-1: 정산 처리 지연 <= 5,000 ms (p95)
 * NFR-3: 대시보드 갱신 지연 <= 3,000 ms (p95)
 * FR-S-007: 100 TPS 처리 (체인코드 트랜잭션)
 * FR-D-003: MQTT 100 msg/s 수신 처리
 *
 * Run with the xk6-mqtt binary built by Packer:
 *   k6-mqtt run -e VUS=9354 lucia-load.js
 *
 * Scenario tiers:
 *   smoke : VUS=1,000  duration=5m   (harness validation)
 *   full  : VUS=9,354  duration=15m  (FR-O-001 acceptance gate)
 *
 * See infra/aws/k6-scenarios/README.md for pass criteria and interpretation.
 */

import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";

// xk6-mqtt is imported from the custom k6-mqtt binary baked by Packer.
// If running without xk6-mqtt, comment out the mqtt import and the publish block.
import * as mqtt from "k6/x/mqtt";

// ---------------------------------------------------------------------------
// Configuration from environment variables
// ---------------------------------------------------------------------------

// VUS: number of virtual buildings (virtual users).
// Set by run-loadtest.sh via -e VUS=<N>.
const VUS = parseInt(__ENV.VUS || "116", 10);

// MQTT broker endpoint — must be reachable from the EC2 instance.
// Defaults to localhost for local development; override with -e MQTT_BROKER=...
const MQTT_BROKER = __ENV.MQTT_BROKER || "tcp://localhost:1883";

// API base URL for the Lucia engine settlement endpoint.
// Override with -e API_BASE=https://lucia.example.com
const API_BASE = __ENV.API_BASE || "http://localhost:3000";

// k6 options — VUs and duration are typically overridden from the CLI
// by run-loadtest.sh, but defaults here allow standalone local runs.
export const options = {
  vus: VUS,
  duration: "5m",

  thresholds: {
    // NFR-1: settlement latency p95 <= 5,000 ms
    settlement_latency: ["p(95)<5000"],
    // NFR-3: dashboard refresh p95 <= 3,000 ms
    dashboard_latency: ["p(95)<3000"],
    // Overall HTTP error rate must stay below 1%
    http_req_failed: ["rate<0.01"],
  },
};

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------

// Tracks end-to-end settlement latency: MQTT publish -> /api/settlements response.
const settlementLatency = new Trend("settlement_latency", true);

// Tracks dashboard polling latency.
const dashboardLatency = new Trend("dashboard_latency", true);

// Counts total MQTT messages published.
const mqttPublished = new Counter("mqtt_messages_published");

// Tracks MQTT publish failure rate.
const mqttFailRate = new Rate("mqtt_publish_failed");

// ---------------------------------------------------------------------------
// MQTT client setup — one client per VU (virtual building)
// ---------------------------------------------------------------------------

// Each VU opens its own MQTT connection representing one building's IoT gateway.
// Connection lifecycle: connect once in setup, publish in default function,
// disconnect in teardown.

let mqttClient;

export function setup() {
  // setup() runs once before VUs start. Used here for any global init.
  // Individual MQTT clients are created per-VU in the default function
  // because xk6-mqtt clients are not serialisable across VUs.
  console.log(
    `FR-O-001 load test starting: VUS=${VUS}, MQTT_BROKER=${MQTT_BROKER}, API_BASE=${API_BASE}`
  );
}

// ---------------------------------------------------------------------------
// Default function — executed by each VU on each iteration
// ---------------------------------------------------------------------------

export default function () {
  // Building index derived from VU number (1-based).
  const buildingIndex = __VU;
  const buildingId = `building_${String(buildingIndex).padStart(5, "0")}`;

  // -------------------------------------------------------------------------
  // Phase 1: MQTT publish — simulate IoT generation reading
  // FR-D-003: MQTT 100 msg/s; FR-O-001: 9,354 concurrent building feeds
  // -------------------------------------------------------------------------

  // Realistic kWh generation value: 3 MW plant across 116 buildings,
  // scaled proportionally. At full VUS=9,354 this represents the expanded
  // LH portfolio. Values vary ±15% with a sine wave to simulate intraday curve.
  const baseKwh = 3000 / Math.max(VUS, 1);
  const timeOfDayFactor =
    0.85 + 0.15 * Math.sin((Date.now() / 3600000) * Math.PI);
  const generationKwh = parseFloat((baseKwh * timeOfDayFactor).toFixed(3));

  const payload = JSON.stringify({
    building_id: buildingId,
    timestamp: new Date().toISOString(),
    // kWh reading for the current 15-minute interval (FR-S-004)
    generation_kwh: generationKwh,
    // SMP and REC multipliers are sourced from the mock data layer in production;
    // stub values here match packages/contracts/fixtures/generation-event.json
    smp_krw_per_kwh: 85.4,
    rec_multiplier: 1.5,
  });

  const mqttStart = Date.now();
  let publishOk = false;

  try {
    // xk6-mqtt API: mqtt.publish(broker, topic, payload, qos, retain)
    mqtt.publish(
      MQTT_BROKER,
      `site/${buildingId}/generation`,
      payload,
      1, // QoS 1 — at least once delivery
      false
    );
    publishOk = true;
    mqttPublished.add(1);
  } catch (e) {
    console.error(`MQTT publish failed for ${buildingId}: ${e.message}`);
  }

  mqttFailRate.add(!publishOk);

  // -------------------------------------------------------------------------
  // Phase 2: HTTP polling — simulate dashboard settlement query
  // NFR-3: dashboard refresh <= 3,000 ms (p95)
  // FR-S-008: 정산 결과 조회 API
  // -------------------------------------------------------------------------

  const dashStart = Date.now();

  const settlementRes = http.get(
    `${API_BASE}/api/settlements?building_id=${buildingId}`,
    {
      tags: { name: "settlement_query" },
      timeout: "10s",
    }
  );

  dashboardLatency.add(Date.now() - dashStart);

  check(settlementRes, {
    "settlement query status 200": (r) => r.status === 200,
    "settlement response has data": (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.settlements) || body.settlement_id != null;
      } catch {
        return false;
      }
    },
  });

  // -------------------------------------------------------------------------
  // Phase 3: Record end-to-end settlement latency
  // NFR-1: settlement latency <= 5,000 ms (p95)
  // This measures from MQTT publish start to settlement API response received.
  // -------------------------------------------------------------------------

  settlementLatency.add(Date.now() - mqttStart);

  // Brief think time between iterations — simulates real IoT polling cadence.
  // 15-minute intervals in production; compressed here for load amplification.
  sleep(0.1);
}

export function teardown() {
  console.log("FR-O-001 load test complete. Check thresholds in summary above.");
  console.log(
    "Pass criteria: settlement_latency p95 < 5000ms, dashboard_latency p95 < 3000ms"
  );
}
