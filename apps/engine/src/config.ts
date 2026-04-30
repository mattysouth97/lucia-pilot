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
  const result = EnvSchema.safeParse(process.env);
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
