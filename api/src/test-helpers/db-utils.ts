import { drizzle } from 'npm:drizzle-orm/node-postgres';
import { DrizzleDb } from '../infrastructure/types.ts';

async function createPool() {
  const pg = await import('pg');
  const { Pool } = pg.default;
  const dbInit = {
    host: encodeURIComponent(Deno.env.get('DB_HOST') ?? 'localhost'),
    user: Deno.env.get('DB_USER') ?? 'postgres',
    password: encodeURIComponent(
      Deno.env.get('DB_PASSWORD') ?? 'pwd4postgres!',
    ),
    port: Deno.env.get('DB_PORT') ?? '5432',
    database: encodeURIComponent(Deno.env.get('DB_NAME') ?? 'runbook_buddy'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  // console.log('Creating database for tests...');
  // console.dir(dbInit);
  return [new Pool(dbInit), dbInit];
}

export function generateTestDbName(): string {
  const full = crypto.randomUUID().replace(/-/g, '');
  return `runbook_buddy_test_${full}`;
}

async function runDbMigrations({ name, host, user, password, port }: {
  name: string;
  host: string;
  user: string;
  password: string;
  port: string;
}) {
  const command = new Deno.Command('deno', {
    args: [
      'task',
      'tool:drizzle',
      'migrate',
    ],
    env: {
      DB_NAME: name,
      DB_HOST: host,
      DB_USER: user,
      DB_PASSWORD: password,
      DB_PORT: port,
    },
  });

  const { code, stdout, stderr } = await command.output();
  if (Deno.env.get('DB_LOGGING') === 'true') {
    console.log(new TextDecoder().decode(stdout));
    console.log(new TextDecoder().decode(stderr));
  }
  if (code !== 0) {
    throw new Error(`Failed to run migrations: ${code}`);
  }
}

/**
 * Creates a new database on the existing postgres database server.
 * This is useful for running tests against a clean database.
 *
 * Some environment variables are assumed to be set:
 * - DB_HOST
 * - DB_USER
 * - DB_PASSWORD
 * - DB_PORT
 *
 * @param name - The name of the database to create.
 */
export async function createDatabase(name: string) {
  await dropDatabase(name);

  const [pool, dbInit] = await createPool();
  const client = await pool.connect();
  try {
    await client.query(`CREATE DATABASE ${name}`);
  } finally {
    await client.release();
  }
  await pool.end();

  // Run migrations
  await runDbMigrations({
    name,
    host: dbInit.host,
    user: dbInit.user,
    password: dbInit.password,
    port: dbInit.port,
  });
  return;
}

export async function dropDatabase(name: string) {
  const [pool] = await createPool();
  const client = await pool.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  } finally {
    await client.release();
  }
  await pool.end();
  return;
}

export async function getDrizzleClient(): Promise<DrizzleDb> {
  const [pool] = await createPool();

  // @ts-ignore: deno-ts(2554)
  return drizzle(pool, { logger: Deno.env.get('DB_LOGGING') === 'true' });
}
