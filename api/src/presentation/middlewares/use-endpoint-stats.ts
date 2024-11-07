import { Context, Next } from 'npm:hono';
import { DrizzleDb } from '../../infrastructure/types.ts';
import { endpointStats } from '../../infrastructure/db/schema.ts';

export async function useEndpointStats(c: Context, next: Next) {
  // We want to ignore middlewares so we match on the method
  const matchedPaths = c.req.matchedRoutes.filter((r) =>
    r.method === c.req.method
  ).map((r) => r.path);
  const updates = matchedPaths.map((path) => {
    const db: DrizzleDb = c.get('db');
    return db.insert(endpointStats).values({
      path,
      method: c.req.method,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: [endpointStats.path, endpointStats.method],
      set: {
        updatedAt: new Date(),
      },
    });
  });

  await Promise.all(updates);

  try {
    return next();
  } catch (e) {
    console.log(e);
    return c.text('Unauthorized', 401);
  }
}
