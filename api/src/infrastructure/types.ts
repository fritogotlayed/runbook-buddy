import { NodePgDatabase } from 'npm:drizzle-orm/node-postgres';

export type DrizzleDb = NodePgDatabase<Record<string, never>> & {
  // deno-lint-ignore no-explicit-any
  $client: any;
};
