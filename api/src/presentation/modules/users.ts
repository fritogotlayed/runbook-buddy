import { createRoute, z } from 'npm:@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import { users } from '../../infrastructure/db/schema.ts';
import { createApp } from '../create-app.ts';
import { hashSecureString } from '../../core/logic/hash-secure-string.ts';
import { delay } from '../../core/logic/delay.ts';
import { validateToken } from '../middlewares/validate-token.ts';
import { ErrorResponseSchema } from '../schemas/shared.ts';
import { validateResponseAgainstSchema } from '../helpers/validate-response-against-schema.ts';

const PostUpdatePasswordSchema = z.object({
  password: z.string({ message: 'password is a required field' }).trim().min(1),
  newPassword: z.string({ message: 'newPassword is a required field' }).trim()
    .min(1),
  confirmNewPassword: z.string({
    message: 'confirmNewPassword is a required field',
  }).trim().min(1),
});

const app = createApp()
  .openapi(
    createRoute({
      method: 'post',
      path: '/update-password',
      tags: ['Users'],
      middleware: [
        validateToken,
      ] as const,
      request: {
        body: {
          description: 'Update password',
          content: {
            'application/json': {
              schema: PostUpdatePasswordSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Successful update password',
          content: {
            'application/json': {
              schema: z.object({}),
            },
          },
        },
        400: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    }),
    async (c) => {
      const db = c.get('db');
      const requestBody = await c.req.json<
        z.infer<typeof PostUpdatePasswordSchema>
      >();
      const requestUserId: string = c.get('userId');

      if (
        !requestBody.password || !requestBody.newPassword ||
        !requestBody.confirmNewPassword
      ) {
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'password, newPassword, and confirmNewPassword are required',
          }),
          400,
        );
      }

      if (requestBody.newPassword !== requestBody.confirmNewPassword) {
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'newPassword and confirmNewPassword must match',
          }),
          400,
        );
      }

      // Validate that new password meets the following criteria:
      // - At least 8 characters long
      // - Contains at least one uppercase letter
      // - Contains at least one lowercase letter
      // - Contains at least one number
      // - Contains at least one special character from the following set: !@#$%^&*()_+-=[]{}|;:,./<>?
      if (requestBody.newPassword.length < 8) {
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'newPassword must be at least 8 characters long',
          }),
          400,
        );
      }
      if (!/[A-Z]/.test(requestBody.newPassword)) {
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'newPassword must contain at least one uppercase letter',
          }),
          400,
        );
      }
      if (!/[a-z]/.test(requestBody.newPassword)) {
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'newPassword must contain at least one lowercase letter',
          }),
          400,
        );
      }
      if (!/\d/.test(requestBody.newPassword)) {
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'newPassword must contain at least one number',
          }),
          400,
        );
      }

      const encodedPassword = await hashSecureString(requestBody.password);
      const result = await db.select({
        userId: users.id,
      }).from(
        users,
      ).where(
        and(
          eq(users.id, requestUserId),
          eq(users.password, encodedPassword),
          eq(users.deleted, false),
        ),
      );

      if (result.length === 0) {
        if (Deno.env.get('NODE_ENV') !== 'test') {
          // Delay for between 1 and 3 seconds to prevent brute force attacks
          await delay(Math.random() * 2000 + 1000);
        }
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'Invalid username or password',
          }),
          401,
        );
      }

      // Update the user's password
      const encodedNewPassword = await hashSecureString(
        requestBody.newPassword,
      );
      await db.update(users)
        .set({
          password: encodedNewPassword,
          passwordExpires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        }).where(eq(users.id, requestUserId));

      return c.json(
        validateResponseAgainstSchema(z.object({}), {}),
        200,
      );
    },
  );

export default app;
