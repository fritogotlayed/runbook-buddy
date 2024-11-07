import { Context, Next } from 'npm:hono';
import { drizzle } from 'npm:drizzle-orm/node-postgres';
import pg from 'pg';
import { DrizzleDb } from '../../infrastructure/types.ts';

const { Pool } = pg;

function isTruthyEnvVar(key: string): boolean {
  const value = Deno.env.get(key);
  // return true if the value is the case-insensitive string 'true', 't', or '1'
  return value?.toLowerCase() === 'true' || value === 't' || value === '1';
}

export function useDrizzlePostgres({
  seedDatabase,
}: {
  seedDatabase?: (db: DrizzleDb) => Promise<void>;
} = {}) {
  const pool = new Pool(
    {
      user: Deno.env.get('DB_USER'),
      host: Deno.env.get('DB_HOST'),
      database: Deno.env.get('DB_NAME'),
      password: Deno.env.get('DB_PASSWORD'),
      port: Deno.env.get('DB_PORT'),
    },
  );

  // TODO: Pipe logger to another framework like bunyan or pino. https://orm.drizzle.team/docs/goodies#logging
  // @ts-ignore: deno-ts(2554)
  const db = drizzle(pool, { logger: isTruthyEnvVar('DB_LOGGING') });

  seedDatabase && seedDatabase(db);

  return (async (c: Context, next: Next) => {
    // NOTE: This method is run on every request, so it's important to keep it fast.

    if (!db) {
      console.log('db is undefined');
      return c.body('Internal Server Error', 500);
    }

    c.set('db', db);
    await next();
  });
}
