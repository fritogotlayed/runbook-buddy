import { createDatabase } from './db-utils.ts';
import { RunbookBuddyApp } from '../presentation/create-app.ts';
import { initializeApp } from '../presentation/initialize-app.ts';

export async function initDbAndApp(testDbName: string, app: RunbookBuddyApp) {
  await createDatabase(testDbName);

  Deno.env.set('DB_HOST', 'localhost');
  Deno.env.set('DB_PORT', '5432');
  Deno.env.set('DB_USER', 'postgres');
  Deno.env.set('DB_PASSWORD', 'pwd4postgres!');
  Deno.env.set('DB_NAME', testDbName);
  Deno.env.set('DB_LOGGING', 'false');
  Deno.env.set('NODE_ENV', 'test');

  await initializeApp(app);
}
