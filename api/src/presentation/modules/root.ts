import { createRoute, z } from 'npm:@hono/zod-openapi';
import { createApp } from '../create-app.ts';
import { generateJwt } from '../helpers/generate-jwt.ts';
import { validateToken } from '../middlewares/validate-token.ts';
import { authenticateUser, createUser } from '../../core/logic/users.ts';
import { CreateRecordError } from '../../core/errors/create-record-error.ts';
import { UserExistsError } from '../../core/errors/user-exists-error.ts';
import { validateResponseAgainstSchema } from '../helpers/validate-response-against-schema.ts';
import { ErrorResponseSchema } from '../schemas/shared.ts';

const PostAuthSchema = z.object({
  username: z.string({ message: 'username is a required field' }).trim().min(1),
  password: z.string({ message: 'password is a required field' }).trim().min(1),
});

const PostRegisterSchema = z.object({
  username: z.string({ message: 'username is a required field' }).trim().min(1),
  password: z.string({ message: 'password is a required field' }).trim().min(1),
});

const AuthSuccessResponseSchema = z.object({
  token: z.string(),
});

const RegisterSuccessResponseSchema = z.object({
  userId: z.string(),
});

// TODO: Move logic out to logic modules
const app = createApp()
  .openapi(
    createRoute({
      method: 'post',
      path: '/auth',
      tags: ['Registration & Authentication'],
      request: {
        body: {
          description: 'User credentials',
          content: {
            'application/json': {
              schema: PostAuthSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Successful authentication',
          content: {
            'application/json': {
              schema: AuthSuccessResponseSchema,
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
      const requestBody = await c.req.json<z.infer<typeof PostAuthSchema>>();

      const userData = await authenticateUser({
        db,
        username: requestBody.username,
        password: requestBody.password,
      });

      if (!userData) {
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'Invalid username or password',
          }),
          401,
        );
      }

      // User should be prompted to change their password seven days before it expires
      const passwordNoticeStart = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      );
      const shouldUpdatePassword =
        userData.passwordExpires < passwordNoticeStart;

      const token = await generateJwt({
        userId: userData.userId,
        payloadData: { shouldUpdatePassword },
      });

      return c.json(
        validateResponseAgainstSchema(AuthSuccessResponseSchema, { token }),
        200,
      );
    },
  )
  .openapi(
    createRoute({
      method: 'get',
      path: '/refresh-token',
      tags: ['Registration & Authentication'],
      middleware: [
        validateToken,
      ] as const,
      request: {
        headers: z.object({
          Authorization: z.string().regex(
            /^Bearer\s.+$/,
            'Authorization header must be in bearer format',
          ),
        }),
      },
      responses: {
        200: {
          description: 'Successful authentication',
          content: {
            'application/json': {
              schema: AuthSuccessResponseSchema,
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/text': {
              schema: z.string(),
            },
          },
        },
      },
    }),
    async (c) => {
      const oldToken = c.req.header('Authorization')?.split(' ')[1];
      try {
        const token = await generateJwt({ oldToken });
        return c.json(
          validateResponseAgainstSchema(AuthSuccessResponseSchema, { token }),
          200,
        );
      } catch {
        return c.text('Invalid token', 401);
      }
    },
  )
  .openapi(
    createRoute({
      method: 'post',
      path: '/register',
      tags: ['Registration & Authentication'],
      request: {
        body: {
          description: 'User credentials',
          content: {
            'application/json': {
              schema: PostRegisterSchema,
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Successful registration',
          content: {
            'application/json': {
              schema: RegisterSuccessResponseSchema,
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
        z.infer<typeof PostRegisterSchema>
      >();

      try {
        const result = await createUser({
          db,
          username: requestBody.username,
          password: requestBody.password,
        });
        return c.json(
          validateResponseAgainstSchema(RegisterSuccessResponseSchema, {
            userId: result.userId,
          }),
          201,
        );
      } catch (err) {
        if (err instanceof CreateRecordError) {
          return c.json(
            validateResponseAgainstSchema(ErrorResponseSchema, {
              error: 'Invalid username or password',
            }),
            401,
          );
        } else if (err instanceof UserExistsError) {
          return c.json(
            validateResponseAgainstSchema(ErrorResponseSchema, {
              error: 'Username did not pass required criteria',
            }),
            400,
          );
        }
        throw err;
      }
    },
  )
  .get(
    '/',
    (c) => c.redirect('/ui', 301),
  );

export default app;
