// import { showRoutes } from 'npm:hono/dev';
import { useDrizzlePostgres } from './middlewares/use-drizzle-postgres.ts';
import { seedDatabase } from '../infrastructure/seed-database.ts';
import { useEndpointStats } from './middlewares/use-endpoint-stats.ts';
import { RunbookBuddyApp } from './create-app.ts';
import templates from './modules/templates.ts';
import instances from './modules/instances.ts';
import users from './modules/users.ts';
import root from './modules/root.ts';
import { swaggerUI } from 'npm:@hono/swagger-ui';

export function initializeApp(app: RunbookBuddyApp): Promise<void> {
  return new Promise<void>((resolve) => {
    const [isTestEnv, isDevelopmentEnv] = [
      Deno.env.get('NODE_ENV') === 'test',
      Deno.env.get('NODE_ENV') === 'development',
    ];
    if (!isTestEnv) {
      const timeFrom = (start: number) => {
        const diff = Date.now() - start;
        return diff < 1000 ? `${diff}ms` : `${Math.round(diff / 1000)}s`;
      };

      app.use(async (c, next) => {
        const start = Date.now();
        await next();
        console.log(
          `[${c.req.method}] ${c.res.status} ${timeFrom(start)} ${c.req.url}`,
        );
      });
    }

    // Setup dependencies
    app.use(useDrizzlePostgres({
      seedDatabase: async (db) => {
        await seedDatabase(db);
        resolve();
      },
    }));

    // Setup global middlewares
    app.use(useEndpointStats);

    // Register all routes
    app.route('/', root);
    app.route('/templates', templates);
    app.route('/instances', instances);
    app.route('/users', users);

    if (isTestEnv) {
      import('npm:hono/dev')
        .then((m) => {
          // NOTE: Figure out how to resolve this warning / error
          // @ts-ignore: deno-ts(2339)
          m.showRoutes(app, { verbose: false });
        });
    }

    if (isDevelopmentEnv) {
      app.get(
        '/ui',
        swaggerUI({
          url: '/doc',
        }),
      );

      app.doc('/doc', {
        info: {
          title: 'Runbook Buddy API',
          description: 'API for Runbook Buddy',
          version: '0.0.1',
        },
        openapi: '3.1.0',
      });
    }

    app.onError((err, c) => {
      console.error(err);
      return c.text('Error', 500);
    });
  });
}
