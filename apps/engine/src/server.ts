import Fastify, { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import websocket from '@fastify/websocket';
import { healthzPlugin } from './observability/healthz.js';
import { metricsPlugin } from './observability/metrics.js';
import { createLogger } from './observability/logger.js';

export interface BuildServerOptions {
  /**
   * When true, external connectivity checks (postgres, redis, mqtt, fabric)
   * are skipped — used by unit/integration tests that run without live services.
   */
  skipExternal?: boolean;
  logLevel?: string;
  nodeEnv?: string;
}

export async function buildServer(opts: BuildServerOptions = {}): Promise<FastifyInstance> {
  const log = createLogger({
    level: opts.logLevel ?? process.env['LOG_LEVEL'] ?? 'info',
    nodeEnv: opts.nodeEnv ?? process.env['NODE_ENV'] ?? 'development',
  });

  const app = Fastify({ logger: log });

  // Core plugins
  await app.register(sensible);
  await app.register(websocket);

  // Observability
  await app.register(healthzPlugin, { skipExternal: opts.skipExternal ?? false });
  await app.register(metricsPlugin);

  // --- REST API skeleton routes ---
  // Each route will gain Zod-validated request/response schemas from @lucia/contracts
  // as wk2-wk5 work lands. Stubs registered here so the router tree is visible.

  app.get('/api/version', async (_req, _reply) => {
    return { version: '0.1.0', service: '@lucia/engine' };
  });

  // FR-S: Settlement & generation endpoints (wk2)
  app.get('/api/buildings', async (_req, _reply) => {
    return { data: [], message: 'stub — wk2' };
  });

  app.get('/api/settlements', async (_req, _reply) => {
    return { data: [], message: 'stub — wk2' };
  });

  // FR-O-003: Admin endpoints (wk3)
  app.get('/api/admin/buildings', async (_req, _reply) => {
    return { data: [], message: 'stub — wk3' };
  });

  // FR-X: Mock external API endpoints (wk3-wk4)
  app.get('/api/mock/kpx/price', async (_req, _reply) => {
    return { data: null, message: 'stub — wk3' };
  });

  app.get('/api/mock/kets/rec', async (_req, _reply) => {
    return { data: null, message: 'stub — wk3' };
  });

  app.get('/api/mock/re100/certificate', async (_req, _reply) => {
    return { data: null, message: 'stub — wk3' };
  });

  app.get('/api/mock/lh-accounting/payment', async (_req, _reply) => {
    return { data: null, message: 'stub — wk4' };
  });

  // TODO(wk3): FR-O-003 admin auth middleware — block /api/admin/* until enforcement lands per ADR-0004 review.

  // FR-M-008: WebSocket transaction stream (wk5)
  // Registered as a websocket route — no handler body yet.
  app.get('/ws/transactions', { websocket: true }, (socket, _req) => {
    socket.on('message', () => {
      // stub — wk5: push TxStreamMessage events
    });
  });

  return app;
}
