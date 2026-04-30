import { describe, it, expect, afterAll } from 'vitest';
import { buildServer } from '../src/server.js';

describe('engine server', () => {
  const appPromise = buildServer({ skipExternal: true, logLevel: 'silent', nodeEnv: 'test' });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it('GET /healthz returns 200 with status ok', async () => {
    const app = await appPromise;
    const response = await app.inject({
      method: 'GET',
      url: '/healthz',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ status: string; checks: Record<string, unknown> }>();
    expect(body.status).toBe('ok');
    expect(body.checks).toHaveProperty('postgres');
    expect(body.checks).toHaveProperty('redis');
    expect(body.checks).toHaveProperty('mqtt');
    expect(body.checks).toHaveProperty('fabric');
  });

  it('GET /api/version returns version info', async () => {
    const app = await appPromise;
    const response = await app.inject({
      method: 'GET',
      url: '/api/version',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ version: string; service: string }>();
    expect(body.version).toBeDefined();
    expect(body.service).toBe('@lucia/engine');
  });

  it('GET /metrics returns prometheus text', async () => {
    const app = await appPromise;
    const response = await app.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/plain/);
  });
});
