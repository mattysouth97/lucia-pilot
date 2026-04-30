import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import * as mqtt from 'mqtt';
import pino from 'pino';
import { GenerationEventInput } from '@lucia/contracts';
import { solarKwhAt } from './solar.js';

// --- Configuration ---
const MQTT_URL = process.env['MQTT_URL'] ?? 'mqtt://localhost:1883';
const BUILDING_COUNT = Math.max(1, parseInt(process.env['BUILDING_COUNT'] ?? '1', 10));
const TICK_INTERVAL_MS = Math.max(1000, parseInt(process.env['TICK_INTERVAL_MS'] ?? '60000', 10));
const LOG_LEVEL = process.env['LOG_LEVEL'] ?? 'info';
const NODE_ENV = process.env['NODE_ENV'] ?? 'development';
const DETERMINISTIC_MODE = process.env['DETERMINISTIC_MODE'] === 'true';

// Installed capacity per building (kW) — P0 uses a fixed value; wk4 loads from @lucia/db.
const INSTALLED_KW_DEFAULT = 26; // ~26 kW typical rooftop per LH building spec

const log = pino({
  level: LOG_LEVEL,
  base: { service: 'simulator', env: NODE_ENV },
  ...(NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      }
    : {}),
});

// Build building IDs: ULJN-001 … ULJN-{N}
function buildingId(n: number): string {
  return `ULJN-${String(n).padStart(3, '0')}`;
}

const buildingIds: string[] = Array.from({ length: BUILDING_COUNT }, (_, i) =>
  buildingId(i + 1),
);

// --- MQTT client ---
const client = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 5000,
  keepalive: 60,
  clean: true,
});

const timers: ReturnType<typeof setInterval>[] = [];

client.on('connect', () => {
  log.info({ mqttUrl: MQTT_URL, buildingCount: BUILDING_COUNT }, 'MQTT connected — starting ticks');

  for (const bid of buildingIds) {
    const timer = setInterval(() => {
      publishTick(bid).catch((err: unknown) => {
        log.error({ err, building_id: bid }, 'Failed to publish generation tick');
      });
    }, TICK_INTERVAL_MS);

    timers.push(timer);
  }
});

client.on('error', (err) => {
  log.error({ err }, 'MQTT error');
});

client.on('reconnect', () => {
  log.warn('MQTT reconnecting…');
});

async function publishTick(building_id: string): Promise<void> {
  const now = new Date();
  const noiseRatio = DETERMINISTIC_MODE ? 0 : 0.1;
  const kwh = solarKwhAt(now, INSTALLED_KW_DEFAULT, noiseRatio);

  const payload: GenerationEventInput = GenerationEventInput.parse({
    building_id,
    ts: now.toISOString(),
    kwh,
    inverter_temp_c: null,
    source: 'simulator',
  });

  const topic = `site/${building_id}/generation`;

  await client.publishAsync(topic, JSON.stringify(payload), { qos: 1 });

  log.debug({ building_id, kwh: kwh.toFixed(4), topic }, 'Published generation tick');
}

// --- Graceful shutdown ---
async function shutdown(): Promise<void> {
  log.info('Simulator shutting down…');

  for (const t of timers) {
    clearInterval(t);
  }
  timers.length = 0;

  await client.endAsync();
  log.info('MQTT disconnected — bye');
  process.exit(0);
}

process.on('SIGTERM', () => {
  shutdown().catch((err: unknown) => {
    log.error({ err }, 'Error during shutdown');
    process.exit(1);
  });
});

process.on('SIGINT', () => {
  shutdown().catch((err: unknown) => {
    log.error({ err }, 'Error during shutdown');
    process.exit(1);
  });
});

log.info({ mqttUrl: MQTT_URL }, 'Simulator process started — awaiting MQTT connection');
