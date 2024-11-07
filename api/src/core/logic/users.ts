import { DrizzleDb } from '../../infrastructure/types.ts';
import { users } from '../../infrastructure/db/schema.ts';
import { and, eq } from 'drizzle-orm';
import { delay } from './delay.ts';
import { hashSecureString } from './hash-secure-string.ts';
import { UserExistsError } from '../errors/user-exists-error.ts';
import { CreateRecordError } from '../errors/create-record-error.ts';

// TODO: Move delay out to presentation layer

export async function createUser({
  db,
  username,
  password,
}: {
  db: DrizzleDb;
  username: string;
  password: string;
}) {
  const loweredUserName = username.toLowerCase();

  const userExists = (await db.select({
    userId: users.id,
  }).from(users).where(eq(users.username, loweredUserName)).limit(1)).length >
    0;

  if (userExists) {
    if (Deno.env.get('NODE_ENV') !== 'test') {
      // Delay for between 1 and 3 seconds to prevent brute force attacks
      await delay(Math.random() * 2000 + 1000);
    }

    throw new UserExistsError(loweredUserName);
  }

  const encodedPassword = await hashSecureString(password);
  const passwordExpires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const result = await db.insert(users).values({
    username: loweredUserName,
    password: encodedPassword,
    passwordExpires,
  }).returning({
    userId: users.id,
  });

  if (result.length === 0) {
    throw new CreateRecordError(
      'users',
      'Failed while attempting to create new user',
    );
  }

  return result[0];
}

export async function authenticateUser({
  db,
  username,
  password,
}: {
  db: DrizzleDb;
  username: string;
  password: string;
}) {
  const loweredUserName = username.toLowerCase();
  const encodedPassword = await hashSecureString(password);

  const result = await db.select({
    userId: users.id,
    passwordExpires: users.passwordExpires,
  }).from(
    users,
  ).where(
    and(
      eq(users.username, loweredUserName),
      eq(users.password, encodedPassword),
      eq(users.deleted, false),
      eq(users.isLocked, false),
    ),
  );

  if (result.length === 0) {
    if (Deno.env.get('NODE_ENV') !== 'test') {
      // Delay for between 1 and 3 seconds to prevent brute force attacks
      await delay(Math.random() * 2000 + 1000);
    }
    return null;
  }

  return result[0];
}
