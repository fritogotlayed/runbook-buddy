import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: [
    './src/infrastructure/db/schema.ts',
    './src/infrastructure/db/relations.ts',
  ],
  out: './src/infrastructure/db/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  migrations: {
    prefix: 'timestamp',
  },
  dbCredentials: {
    host: Deno.env.get('DB_HOST') ?? 'localhost',
    database: Deno.env.get('DB_NAME') ?? 'runbook_buddy',
    password: Deno.env.get('DB_PASSWORD') ?? 'pwd4postgres!',
    port: ~~(Deno.env.get('PORT') ?? 5432),
    user: Deno.env.get('DB_USER') ?? 'postgres',
    ssl: false,
  },
});
