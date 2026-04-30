import pino from 'pino';

export interface LoggerOptions {
  level?: string;
  nodeEnv?: string;
}

export function createLogger(opts: LoggerOptions = {}): pino.Logger {
  const level = opts.level ?? process.env['LOG_LEVEL'] ?? 'info';
  const isDev = (opts.nodeEnv ?? process.env['NODE_ENV']) === 'development';

  return pino({
    level,
    base: {
      service: 'engine',
      env: opts.nodeEnv ?? process.env['NODE_ENV'] ?? 'development',
    },
    ...(isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
  });
}

// Default singleton logger — replaced by buildServer with config-aware instance.
export const logger = createLogger();
