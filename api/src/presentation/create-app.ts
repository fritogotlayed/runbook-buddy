import { OpenAPIHono } from 'npm:@hono/zod-openapi';
import { DrizzleDb } from '../infrastructure/types.ts';

export function createApp() {
  return new OpenAPIHono<{ Variables: Deps }>({ strict: false });
}
export type RunbookBuddyApp = ReturnType<typeof createApp>;
export type Deps = {
  db: DrizzleDb;
  userId?: string;
};
