import { FastifyInstance } from 'fastify';

// Health check result shape — real connectivity checks land in wk6.
// P0: returns 'ok' stubs so the skeleton server test passes.
interface CheckResult {
  status: 'ok' | 'degraded';
  latencyMs?: number;
  error?: string;
}

interface HealthzResponse {
  status: 'ok' | 'degraded';
  checks: {
    postgres: CheckResult;
    redis: CheckResult;
    mqtt: CheckResult;
    fabric: CheckResult;
  };
}

// Stub checkers — replaced with real probes in wk6.
async function checkPostgres(_opts: { skipExternal?: boolean }): Promise<CheckResult> {
  if (_opts.skipExternal) return { status: 'ok', latencyMs: 0 };
  // TODO wk6: run SELECT 1 against the pool and measure latency
  return { status: 'ok', latencyMs: 0 };
}

async function checkRedis(_opts: { skipExternal?: boolean }): Promise<CheckResult> {
  if (_opts.skipExternal) return { status: 'ok', latencyMs: 0 };
  // TODO wk6: run PING against the ioredis client
  return { status: 'ok', latencyMs: 0 };
}

async function checkMqtt(_opts: { skipExternal?: boolean }): Promise<CheckResult> {
  if (_opts.skipExternal) return { status: 'ok', latencyMs: 0 };
  // TODO wk6: inspect mqtt client connection state
  return { status: 'ok', latencyMs: 0 };
}

async function checkFabric(_opts: { skipExternal?: boolean }): Promise<CheckResult> {
  if (_opts.skipExternal) return { status: 'ok', latencyMs: 0 };
  // TODO wk6: call peer.ping() via fabric-network gateway
  return { status: 'ok', latencyMs: 0 };
}

export interface HealthzPluginOptions {
  skipExternal?: boolean;
}

export async function healthzPlugin(
  app: FastifyInstance,
  opts: HealthzPluginOptions = {},
): Promise<void> {
  app.get('/healthz', async (_req, reply) => {
    const [postgres, redis, mqtt, fabric] = await Promise.all([
      checkPostgres(opts),
      checkRedis(opts),
      checkMqtt(opts),
      checkFabric(opts),
    ]);

    const checks = { postgres, redis, mqtt, fabric };
    const anyDegraded = Object.values(checks).some((c) => c.status === 'degraded');
    const body: HealthzResponse = {
      status: anyDegraded ? 'degraded' : 'ok',
      checks,
    };

    reply.status(anyDegraded ? 503 : 200).send(body);
  });
}
