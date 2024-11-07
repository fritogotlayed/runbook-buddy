import { count, eq } from 'npm:drizzle-orm';
import { users } from './db/schema.ts';
import { DrizzleDb } from './types.ts';
import { hashSecureString } from '../core/logic/hash-secure-string.ts';

export async function seedDatabase(db: DrizzleDb) {
  // Check for a admin user
  const adminUserCount = await db.select({ count: count(users.id) }).from(
    users,
  ).where(eq(users.username, 'admin'));

  if (adminUserCount[0].count === 0) {
    await db.insert(users).values({
      username: 'admin',
      password: (await hashSecureString('rbbadmin')),
    });
  }
}
