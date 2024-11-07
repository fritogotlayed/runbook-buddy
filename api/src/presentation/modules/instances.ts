import { createApp } from '../create-app.ts';
import { validateToken } from '../middlewares/validate-token.ts';
import {
  createInstance,
  deleteInstance,
  getInstanceById,
  listInstances,
  updateInstance,
} from '../../core/logic/instances.ts';
import { z } from 'npm:zod';
import { validateResponseAgainstSchema } from '../helpers/validate-response-against-schema.ts';
import { createRoute } from 'npm:@hono/zod-openapi';
import { ErrorResponseSchema } from '../schemas/shared.ts';

const CreateInstanceRequestSchema = z.object({
  templateId: z.string({ message: 'template id is a required field' })
    .uuid().trim().describe(
      'The template id that this instance will be based on',
    ),
  name: z.string().optional().describe(
    'If provided, this will be the name of the instance',
  ),
  notes: z.string().optional().describe(
    'If provided, this will be the notes for the instance',
  ),
});

// TODO: Make this able to support a tree of nested line items
const UpdateInstanceRequestSchema = z.object({
  name: z.string().optional().describe(
    'If provided, this will be the name of the instance',
  ),
  notes: z.string().optional(),
  lineItems: z.array(z.object({
    id: z.string().uuid().describe('Identifier for the line item'),
    notes: z.string().optional(),
    completed: z.boolean().optional(),
  })),
});

const InstanceSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  notes: z.string(),
});

const GetInstanceListItemResponseSchema = z.array(InstanceSummarySchema);

const InstanceDetailSchema = z.intersection(
  InstanceSummarySchema,
  z.object({
    lineItems: z.array(z.object({
      id: z.string(),
      summary: z.string(),
      notes: z.string(),
      orderIndex: z.number(),
      completed: z.boolean(),
    })),
  }),
);

const app = createApp()
  .openapi(
    createRoute({
      method: 'get',
      path: '/',
      tags: ['Instances'],
      middleware: [validateToken] as const,
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
          description: 'List of instance summaries',
          content: {
            'application/json': {
              schema: GetInstanceListItemResponseSchema,
            },
          },
        },
      },
    }),
    async (c) => {
      const db = c.get('db');
      const userId = c.get('userId') as string;
      const queryAll = c.req.query('all') === 'true';
      const result = await listInstances({
        db,
        userId,
        options: { all: queryAll },
      });
      return c.json(
        validateResponseAgainstSchema(
          GetInstanceListItemResponseSchema,
          result,
        ),
        200,
      );
    },
  )
  .openapi(
    createRoute({
      method: 'post',
      path: '/',
      tags: ['Instances'],
      middleware: [validateToken] as const,
      request: {
        headers: z.object({
          Authorization: z.string().regex(
            /^Bearer\s.+$/,
            'Authorization header must be in bearer format',
          ),
        }),
        body: {
          description: 'Instance Response body',
          content: {
            'application/json': {
              schema: CreateInstanceRequestSchema,
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Instance created',
          content: {
            'application/json': {
              schema: InstanceDetailSchema,
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
            'application/text': {
              schema: z.string(),
            },
          },
        },
      },
    }),
    async (c) => {
      const db = c.get('db');
      const requestBody = await c.req.json<
        z.infer<typeof CreateInstanceRequestSchema>
      >();
      const result = await createInstance({
        db,
        userId: c.get('userId') as string,
        createOptions: {
          ...requestBody,
        },
      });

      return c.json(
        validateResponseAgainstSchema(InstanceSummarySchema, result),
        201,
      );
    },
  )
  .openapi(
    createRoute({
      method: 'get',
      path: '/:id',
      tags: ['Instances'],
      middleware: [validateToken] as const,
      request: {
        headers: z.object({
          Authorization: z.string().regex(
            /^Bearer\s.+$/,
            'Authorization header must be in bearer format',
          ),
        }),
        params: z.object({
          id: z.string().uuid(),
        }),
      },
      responses: {
        200: {
          description: 'Instance detail',
          content: {
            'application/json': {
              schema: InstanceDetailSchema,
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
            'application/text': {
              schema: z.string(),
            },
          },
        },
        404: {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    }),
    async (c) => {
      const id = c.req.param('id');
      const userId = c.get('userId') as string;
      const db = c.get('db');

      const t = await getInstanceById({ db, id, userId });
      if (t) {
        return c.json(
          validateResponseAgainstSchema(InstanceDetailSchema, t),
          200,
        );
      }
      return c.json({ error: 'Not Found' }, 404);
    },
  )
  .openapi(
    createRoute({
      method: 'patch',
      path: '/:id',
      tags: ['Instances'],
      middleware: [validateToken] as const,
      request: {
        headers: z.object({
          Authorization: z.string().regex(
            /^Bearer\s.+$/,
            'Authorization header must be in bearer format',
          ),
        }),
        params: z.object({
          id: z.string().uuid(),
        }),
        body: {
          description: 'Full Instance',
          content: {
            'application/json': {
              schema: UpdateInstanceRequestSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Instance updated',
          content: {
            'application/json': {
              schema: InstanceDetailSchema,
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
            'application/text': {
              schema: z.string(),
            },
          },
        },
        404: {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    }),
    async (c) => {
      const id = c.req.param('id');
      const db = c.get('db');
      const userId = c.get('userId') as string;

      const existingInstance = await getInstanceById({ db, id, userId });
      if (!existingInstance) {
        return c.json({ error: 'Not Found' }, 404);
      }

      const requestBody = await c.req.json<
        z.infer<typeof UpdateInstanceRequestSchema>
      >();

      const result = await updateInstance({
        db,
        userId,
        instance: {
          id,
          name: requestBody.name,
          notes: requestBody.notes,
          lineItems: requestBody.lineItems.map((li) => ({
            id: li.id,
            notes: li.notes,
            completed: li.completed,
          })),
        },
      });

      if (result) {
        return c.json(
          validateResponseAgainstSchema(InstanceDetailSchema, result),
        );
      }
      return c.json({ error: 'Not Found' }, 400);
    },
  )
  .openapi(
    createRoute({
      method: 'delete',
      path: '/:id',
      tags: ['Instances'],
      middleware: [validateToken] as const,
      request: {
        headers: z.object({
          Authorization: z.string().regex(
            /^Bearer\s.+$/,
            'Authorization header must be in bearer format',
          ),
        }),
        params: z.object({
          id: z.string().uuid(),
        }),
      },
      responses: {
        200: {
          description: 'Instance deleted',
          content: {
            'application/json': {
              schema: InstanceSummarySchema,
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
        404: {
          description: 'Not Found',
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
      const id = c.req.param('id');
      const userId = c.get('userId') as string;
      const result = await deleteInstance({ db, id, userId });
      if (!result) {
        return c.json({ error: 'Not Found' }, 404);
      }
      return c.json(
        validateResponseAgainstSchema(InstanceSummarySchema, result),
        200,
      );
    },
  );

export default app;
