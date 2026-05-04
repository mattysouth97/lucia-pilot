import type { FastifyInstance } from 'fastify';
import client from 'prom-client';

// Collect default Node.js metrics (GC, memory, event loop lag…)
client.collectDefaultMetrics({ prefix: 'lucia_node_' });

// --- Custom counters (labels added per-use in wk2+) ---

export const settlementsTotal = new client.Counter({
  name: 'lucia_settlements_total',
  help: 'Total number of settlement runs completed',
  labelNames: ['building_id', 'status'] as const,
});

export const chainTxTotal = new client.Counter({
  name: 'lucia_chain_tx_total',
  help: 'Total Hyperledger Fabric transactions submitted',
  labelNames: ['chaincode', 'status'] as const,
});

export const anomaliesTotal = new client.Counter({
  name: 'lucia_anomalies_total',
  help: 'Total anomaly events detected',
  labelNames: ['building_id', 'type'] as const,
});

export const mqttMsgTotal = new client.Counter({
  name: 'lucia_mqtt_msg_total',
  help: 'Total MQTT messages received',
  labelNames: ['topic'] as const,
});

// Fastify plugin — registers GET /metrics
export async function metricsPlugin(app: FastifyInstance): Promise<void> {
  app.get('/metrics', async (_req, reply) => {
    const metrics = await client.register.metrics();
    reply.header('Content-Type', client.register.contentType).send(metrics);
  });
}
