import { createApp } from '../create-app.ts';
import { validateToken } from '../middlewares/validate-token.ts';
import {
  createTemplate,
  deleteTemplate,
  getTemplateById,
  listTemplates,
  updateTemplate,
} from '../../core/logic/templates.ts';
import { z } from 'npm:zod';
import { validateResponseAgainstSchema } from '../helpers/validate-response-against-schema.ts';
import { createRoute } from 'npm:@hono/zod-openapi';
import { ErrorResponseSchema } from '../schemas/shared.ts';

const CreateTemplateRequestSchema = z.object({
  templateName: z.string({ message: 'template name is a required field' })
    .trim().min(1),
  templateNotes: z.string().optional().default(''),
  isGlobal: z.boolean({ message: 'password is a required field' }).optional()
    .default(false),
});

// TODO: Make this able to support a tree of nested line items
// const UpdateTemplateRequestSchema = z.intersection(
//   CreateTemplateRequestSchema,
//   z.object({
//     templateLineItems: z.array(z.object({
//       templateLineItemId: z.union([z.string(), z.null(),]).optional()
//         .describe('omitted if creating a new item, null to delete an existing item, or a valid UUID to update an existing item'),
//       templateLineItemSummary: z.string({
//         message: 'template line item summary is a required field',
//       }).trim().min(1),
//       templateLineItemNotes: z.string().optional().default(''),
//       templateLineItemOrderIndex: z.number({
//         message: 'template line item order index is a required field',
//       }).gte(0),
//     })),
//   }),
// );
const UpdateTemplateRequestSchema = CreateTemplateRequestSchema.extend({
  templateLineItems: z.array(z.object({
    templateLineItemId: z.union([z.string(), z.null()]).optional()
      .describe(
        'omitted if creating a new item, null to delete an existing item, or a valid UUID to update an existing item',
      ),
    templateLineItemSummary: z.string({
      message: 'template line item summary is a required field',
    }).trim().min(1),
    templateLineItemNotes: z.string().optional().default(''),
    templateLineItemOrderIndex: z.number({
      message: 'template line item order index is a required field',
    }).gte(0),
  })),
});

const TemplateSummarySchema = z.object({
  templateId: z.string(),
  templateName: z.string(),
  templateNotes: z.string(),
});

const GetTemplateListItemResponseSchema = z.array(TemplateSummarySchema);

const TemplateDetailSchema = z.intersection(
  TemplateSummarySchema,
  z.object({
    templateLineItems: z.array(z.object({
      templateLineItemId: z.string(),
      templateLineItemSummary: z.string(),
      templateLineItemNotes: z.string(),
      templateLineItemOrderIndex: z.number(),
    })),
  }),
);

const app = createApp()
  .openapi(
    createRoute({
      method: 'get',
      path: '/',
      tags: ['Templates'],
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
          description: 'List of template summaries',
          content: {
            'application/json': {
              schema: GetTemplateListItemResponseSchema,
            },
          },
        },
      },
    }),
    async (c) => {
      const db = c.get('db');
      const userId = c.get('userId') as string;
      const queryAll = c.req.query('all') === 'true';
      const result = await listTemplates({
        db,
        userId,
        options: { all: queryAll },
      });
      return c.json(
        validateResponseAgainstSchema(
          GetTemplateListItemResponseSchema,
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
      tags: ['Templates'],
      middleware: [validateToken] as const,
      request: {
        headers: z.object({
          Authorization: z.string().regex(
            /^Bearer\s.+$/,
            'Authorization header must be in bearer format',
          ),
        }),
        body: {
          description: 'Template Response body',
          content: {
            'application/json': {
              schema: CreateTemplateRequestSchema,
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Template created',
          content: {
            'application/json': {
              schema: TemplateDetailSchema,
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
        z.infer<typeof CreateTemplateRequestSchema>
      >();
      const { templateName, templateNotes, isGlobal } = requestBody;

      if (!templateName) {
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'Template name is required',
          }),
          400,
        );
      }
      if (!templateNotes) {
        return c.json(
          validateResponseAgainstSchema(ErrorResponseSchema, {
            error: 'Template notes are required',
          }),
          400,
        );
      }

      const result = await createTemplate({
        db,
        userId: c.get('userId') as string,
        template: {
          name: templateName,
          notes: templateNotes,
          isGlobal: isGlobal,
        },
      });

      return c.json(
        validateResponseAgainstSchema(TemplateSummarySchema, result),
        201,
      );
    },
  )
  .openapi(
    createRoute({
      method: 'get',
      path: '/:id',
      tags: ['Templates'],
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
          description: 'Template detail',
          content: {
            'application/json': {
              schema: TemplateDetailSchema,
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

      const t = await getTemplateById({ db, id, userId });
      if (t) {
        return c.json(
          validateResponseAgainstSchema(TemplateDetailSchema, t),
          200,
        );
      }
      return c.json({ error: 'Not Found' }, 404);
    },
  )
  .openapi(
    createRoute({
      method: 'put',
      path: '/:id',
      tags: ['Templates'],
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
          description: 'Full Template',
          content: {
            'application/json': {
              schema: UpdateTemplateRequestSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Template updated',
          content: {
            'application/json': {
              schema: TemplateDetailSchema,
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

      const existingTemplate = await getTemplateById({ db, id, userId });
      if (!existingTemplate) {
        return c.json({ error: 'Not Found' }, 404);
      }

      const requestBody = await c.req.json<
        z.infer<typeof UpdateTemplateRequestSchema>
      >();

      const { templateName, templateNotes, templateLineItems: lineItems } =
        requestBody;

      if (!templateName) {
        return c.json({ error: 'Template name is required' }, 400);
      }
      if (!templateNotes) {
        return c.json({ error: 'Template notes are required' }, 400);
      }
      if (!lineItems) {
        return c.json({ error: 'Template line items are required' }, 400);
      }

      await updateTemplate({
        db,
        userId,
        template: {
          id,
          name: requestBody.templateName,
          notes: requestBody.templateNotes,
          isGlobal: requestBody.isGlobal,
          lineItems: requestBody.templateLineItems.map((li) => ({
            id: li.templateLineItemId ?? undefined,
            summary: li.templateLineItemSummary,
            notes: li.templateLineItemNotes,
            orderIndex: li.templateLineItemOrderIndex,
          })),
        },
      });

      const t = await getTemplateById({ db, id, userId });
      if (t) {
        return c.json(validateResponseAgainstSchema(TemplateDetailSchema, t));
      }
      return c.json({ error: 'Not Found' }, 400);
    },
  )
  .openapi(
    createRoute({
      method: 'delete',
      path: '/:id',
      tags: ['Templates'],
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
          description: 'Template deleted',
          content: {
            'application/json': {
              schema: TemplateSummarySchema,
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
      const result = await deleteTemplate({ db, id, userId });
      if (!result) {
        return c.json({ error: 'Not Found' }, 404);
      }
      return c.json(
        validateResponseAgainstSchema(TemplateSummarySchema, result),
        200,
      );
    },
  );

export default app;
