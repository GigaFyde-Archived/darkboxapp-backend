import {ConnectionConfig} from 'pg';
import {StorageConfig} from '../class/storage';

export interface Config {
  port: number;
  keyLength: number;
  database: ConnectionConfig;
  security: {key: string};
  storage: StorageConfig;
  sentry: {
    enabled: boolean;
    options?: {
      dsn: string;
      tracesSampleRate: number;
    };
  };
}

export function loadEnvironment(): Config {
  return {
    port: 3000,
    keyLength: parseInt(process.env.KEY_LENGTH as string) ?? 12,
    database: {
      host: 'database',
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      user: 'postgres',
    },
    security: {
      key: process.env.KEY as string,
    },
    storage: {
      type: process.env.STORAGE_TYPE as 'file' | 's3',
      path: process.env.STORAGE_PATH as string,
    },
    sentry: {
      enabled: process.env.USE_SENTRY === 'true' ? true : false,
      options:
        process.env.USE_SENTRY === 'false'
          ? undefined
          : {
              dsn: process.env.SENTRY_DSN as string,
              tracesSampleRate: parseInt(process.env.SENTRY_RATE as string),
            },
    },
  };
}
