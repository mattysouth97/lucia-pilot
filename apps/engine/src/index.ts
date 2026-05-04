import 'dotenv/config';

import { config } from './config.js';
import { createLogger } from './observability/logger.js';
import { buildServer } from './server.js';

const log = createLogger({ level: config.LOG_LEVEL, nodeEnv: config.NODE_ENV });

async function main(): Promise<void> {
  const server = await buildServer({
    logLevel: config.LOG_LEVEL,
    nodeEnv: config.NODE_ENV,
  });

  const close = async (): Promise<void> => {
    log.info('Shutting down engine…');
    await server.close();
    process.exit(0);
  };

  process.on('SIGTERM', close);
  process.on('SIGINT', close);

  await server.listen({ port: config.PORT, host: '0.0.0.0' });
  log.info({ port: config.PORT }, 'Lucia engine listening');
}

main().catch((err: unknown) => {
  log.error(err, 'Fatal startup error');
  process.exit(1);
});
