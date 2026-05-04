// packages/db — barrel export
// Re-exports all schema tables/enums and provides a typed Drizzle client factory.
// Import this from @lucia/db (or @lucia/db/schema for schema-only access).

export * from './schema/index.js';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

/**
 * Creates a typed Drizzle client bound to the given Postgres connection string.
 *
 * Usage:
 *   import { createDb } from '@lucia/db';
 *   const db = createDb(process.env.DATABASE_URL);
 *
 * The returned client is fully typed via the schema imported from ./schema/index.js.
 * Call `sql.end()` on the underlying postgres-js client when the process exits
 * (hold a reference to `sql` if you need graceful shutdown).
 */
export function createDb(connectionString: string) {
  const sql = postgres(connectionString, {
    // TimescaleDB / PG defaults — keep idle connections bounded
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  });

  return drizzle(sql, { schema });
}

export type DbClient = ReturnType<typeof createDb>;
