import { z } from 'zod';
import 'dotenv/config';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  MQTT_URL: z.string().url(),
  FABRIC_PROFILE: z.string().default('./chain/network/profiles/connection-org1.json'),
  AWS_REGION: z.string().default('ap-northeast-2'),
});

function loadConfig() {
  const env = process.env;

  // In test mode, supply safe local defaults so tests don't crash on missing env vars.
  // These values are never used in production or development — NODE_ENV guards them.
  const testDefaults: Partial<NodeJS.ProcessEnv> =
    env['NODE_ENV'] === 'test'
      ? {
          DATABASE_URL: env['DATABASE_URL'] ?? 'postgres://lucia:lucia_pilot@127.0.0.1:5432/lucia_test',
          REDIS_URL:    env['REDIS_URL']    ?? 'redis://127.0.0.1:6379',
          MQTT_URL:     env['MQTT_URL']     ?? 'mqtt://127.0.0.1:1883',
        }
      : {};

  const result = EnvSchema.safeParse({ ...testDefaults, ...env });
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

export type Config = z.infer<typeof EnvSchema>;
export const config: Config = loadConfig();
