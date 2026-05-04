/**
 * MQTT client wrapper for the Lucia simulator (ADR-0003).
 *
 * Provides:
 *   connect()                    — returns a connected MqttWrapper
 *   wrapper.publishGeneration()  — site/{building_id}/generation, QoS 1
 *   wrapper.subscribeAnomalyInjection() — site/+/anomaly/admin, QoS 1
 *
 * Reconnects with exponential backoff (1 s → 2 s → 4 s … capped at 60 s).
 * All payloads are typed via @lucia/contracts.
 */

import type { GenerationEventInput } from '@lucia/contracts';
import * as mqttLib from 'mqtt';
import type { MqttClient } from 'mqtt';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Payload published by admin to trigger anomaly injection (FR-D-002). */
export interface AnomalyInjectionPayload {
  building_id: string;
  type: 'inverter_fail' | 'shadow' | 'module_damage' | 'low_yield' | 'settlement_delay';
  duration_ms: number;
}

export type AnomalyHandler = (
  building_id: string,
  payload: AnomalyInjectionPayload,
) => void;

// ---------------------------------------------------------------------------
// Backoff helper
// ---------------------------------------------------------------------------

function computeBackoffMs(attempt: number, capMs = 60_000): number {
  return Math.min(1_000 * 2 ** attempt, capMs);
}

// ---------------------------------------------------------------------------
// MqttWrapper
// ---------------------------------------------------------------------------

export class MqttWrapper {
  private readonly client: MqttClient;
  private anomalyHandler: AnomalyHandler | null = null;

  constructor(client: MqttClient) {
    this.client = client;

    // Route incoming messages to the anomaly handler.
    this.client.on('message', (topic: string, message: Buffer) => {
      if (!this.anomalyHandler) return;

      // topic shape: site/{building_id}/anomaly/admin
      const parts = topic.split('/');
      if (parts.length !== 4 || parts[0] !== 'site' || parts[2] !== 'anomaly' || parts[3] !== 'admin') {
        return;
      }
      const building_id = parts[1];
      if (!building_id) return;

      let payload: AnomalyInjectionPayload;
      try {
        payload = JSON.parse(message.toString()) as AnomalyInjectionPayload;
      } catch {
        return; // malformed — silently drop
      }

      this.anomalyHandler(building_id, payload);
    });
  }

  /**
   * Publishes a generation event to `site/{building_id}/generation` at QoS 1.
   * FR-D-001: 1 event/min per building, ±10% noise (applied upstream in solar.ts).
   */
  async publishGeneration(
    building_id: string,
    payload: GenerationEventInput,
  ): Promise<void> {
    const topic = `site/${building_id}/generation`;
    await this.client.publishAsync(topic, JSON.stringify(payload), { qos: 1 });
  }

  /**
   * Subscribes to admin anomaly-injection commands (FR-D-002).
   * Topic: `site/+/anomaly/admin`
   */
  async subscribeAnomalyInjection(handler: AnomalyHandler): Promise<void> {
    this.anomalyHandler = handler;
    await this.client.subscribeAsync('site/+/anomaly/admin', { qos: 1 });
  }

  /** Cleanly disconnects the MQTT client. */
  async end(): Promise<void> {
    await this.client.endAsync();
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Connects to the MQTT broker at `url` and returns a ready MqttWrapper.
 * Reconnects with exponential backoff; each reconnect attempt is logged to stderr.
 *
 * @param url  Broker URL, e.g. `mqtt://localhost:1883`
 */
export function connect(url: string): Promise<MqttWrapper> {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    let settled = false;

    const client = mqttLib.connect(url, {
      // Disable built-in reconnectPeriod — we manage backoff ourselves.
      reconnectPeriod: 0,
      keepalive: 60,
      clean: true,
    });

    client.on('connect', () => {
      attempt = 0;
      if (!settled) {
        settled = true;
        resolve(new MqttWrapper(client));
      }
    });

    client.on('error', (err: Error) => {
      if (!settled) {
        settled = true;
        reject(err);
        return;
      }
      process.stderr.write(`[mqtt] error: ${err.message}\n`);
    });

    client.on('close', () => {
      if (settled) {
        const backoffMs = computeBackoffMs(attempt);
        process.stderr.write(
          `[mqtt] disconnected — reconnecting in ${backoffMs}ms (attempt ${attempt + 1})\n`,
        );
        attempt += 1;
        setTimeout(() => {
          client.reconnect();
        }, backoffMs);
      }
    });
  });
}
