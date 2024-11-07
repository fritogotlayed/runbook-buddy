import { afterAll, beforeAll, describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import {
  dropDatabase,
  generateTestDbName,
  getDrizzleClient,
} from '../../test-helpers/db-utils.ts';
import { DrizzleDb } from '../../infrastructure/types.ts';
import {
  templateLineItems,
  templates,
  users,
} from '../../infrastructure/db/schema.ts';
import { and, eq, ne } from 'drizzle-orm';
import { initDbAndApp } from '../../test-helpers/init-db-and-app.ts';
import { createApp } from '../create-app.ts';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../test-helpers/constants.ts';

const TEST_TEMPLATE_NAME = 'Test Template';
const TEST_TEMPLATE_DESCRIPTION = 'Test Template Description';
const TEST_TEMPLATE_LINE_ITEM_SUMMARY = 'Test Template Line Item';
const TEST_TEMPLATE_LINE_ITEM_NOTES = 'Test Template Line Item Description';

describe('templates', () => {
  const testDbName = generateTestDbName();
  const app = createApp();
  let drizzleClient: DrizzleDb;
  let authToken: string;
  let testUserId: string;
  let testTemplateId: string;
  let testTemplateLineItemId: string;

  beforeAll(async () => {
    await initDbAndApp(testDbName, app);

    const authResponse = await app.request('http://localhost:8000/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      }),
    });
    authToken = (await authResponse.json()).token;

    drizzleClient = await getDrizzleClient();
    const adminId = (await drizzleClient.select({
      id: users.id,
    }).from(users).where(eq(users.username, 'admin')))[0].id;
    testUserId = adminId;

    const template = (await drizzleClient.insert(templates).values({
      name: TEST_TEMPLATE_NAME,
      notes: TEST_TEMPLATE_DESCRIPTION,
      createdBy: adminId,
    }).returning({
      id: templates.id,
    }))[0];

    testTemplateId = template.id;

    const templateLineItem =
      (await drizzleClient.insert(templateLineItems).values({
        summary: TEST_TEMPLATE_LINE_ITEM_SUMMARY,
        notes: TEST_TEMPLATE_LINE_ITEM_NOTES,
        orderIndex: 0,
        templateId: template.id,
        createdBy: adminId,
      }).returning({
        id: templateLineItems.id,
      }))[0];

    testTemplateLineItemId = templateLineItem.id;
  });

  afterAll(async () => {
    Deno.env.set('DB_NAME', 'postgres');
    await dropDatabase(testDbName);
  });

  describe('GET /templates', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/templates', {
        method: 'GET',
      });
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return a 200 and template list when given valid credentials', async () => {
      const response = await app.request('http://localhost:8000/templates', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([expect.objectContaining({
        templateId: testTemplateId,
        templateName: 'Test Template',
        templateNotes: 'Test Template Description',
      })]);
    });
  });

  describe('POST /templates', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        }),
      });
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return a 201, template, and store properly when given valid credentials', async () => {
      let newTemplateId = '-1';
      try {
        const response = await app.request('http://localhost:8000/templates', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateName: 'Test Template 2',
            templateNotes: 'Test Template Description 2',
          }),
        });
        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body).toHaveProperty('templateId');
        newTemplateId = body.templateId;
        expect(body).toEqual(expect.objectContaining({
          templateId: expect.any(String),
          templateName: 'Test Template 2',
          templateNotes: 'Test Template Description 2',
        }));

        const dbTemplate = (await drizzleClient.select().from(templates).where(
          eq(templates.id, newTemplateId),
        ))[0];
        expect(dbTemplate).toEqual(expect.objectContaining({
          id: newTemplateId,
          name: 'Test Template 2',
          notes: 'Test Template Description 2',
          createdBy: testUserId,
          deleted: false,
        }));
      } finally {
        // Cleanup the template so we don't pollute other tests
        if (newTemplateId !== '-1') {
          await drizzleClient.delete(templates).where(
            eq(templates.id, newTemplateId),
          );
        }
      }
    });
  });

  describe('GET /templates/:id', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/templates', {
        method: 'GET',
      });
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return a 200 and template when given valid credentials', async () => {
      const response = await app.request(
        `http://localhost:8000/templates/${testTemplateId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(expect.objectContaining({
        templateId: testTemplateId,
        templateName: TEST_TEMPLATE_NAME,
        templateNotes: TEST_TEMPLATE_DESCRIPTION,
        // NOTE: Couldn't get expect.arrayContaining to work here
        templateLineItems: [
          expect.objectContaining({
            templateLineItemId: testTemplateLineItemId,
            templateLineItemSummary: TEST_TEMPLATE_LINE_ITEM_SUMMARY,
            templateLineItemNotes: TEST_TEMPLATE_LINE_ITEM_NOTES,
            templateLineItemOrderIndex: 0,
          }),
        ],
      }));
    });

    it('should return a 400 with error payload when given an invalid template id', async () => {
      const response = await app.request(
        `http://localhost:8000/templates/12345`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({
        error: {
          issues: [
            {
              code: 'invalid_string',
              message: 'Invalid uuid',
              path: ['id'],
              validation: 'uuid',
            },
          ],
          name: 'ZodError',
        },
        success: false,
      });
    });

    it('should return a 404 when given a unknown template id', async () => {
      const response = await app.request(
        `http://localhost:8000/templates/${crypto.randomUUID()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: 'Not Found' });
    });
  });

  describe('PUT /templates/:id', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateNotes: 'Test Template Description 2',
        }),
      });
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return a 200 and template when given valid credentials', async () => {
      try {
        const response = await app.request(
          `http://localhost:8000/templates/${testTemplateId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              templateName: TEST_TEMPLATE_NAME,
              templateNotes: `${TEST_TEMPLATE_DESCRIPTION} 2`,
              templateLineItems: [
                {
                  templateLineItemId: testTemplateLineItemId,
                  templateLineItemSummary: TEST_TEMPLATE_LINE_ITEM_SUMMARY,
                  templateLineItemNotes: TEST_TEMPLATE_LINE_ITEM_NOTES,
                  templateLineItemOrderIndex: 0,
                },
              ],
            }),
          },
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toEqual(expect.objectContaining({
          templateId: testTemplateId,
          templateName: 'Test Template',
          templateNotes: 'Test Template Description 2',
        }));

        const dbTemplate = (await drizzleClient.select().from(templates).where(
          eq(templates.id, testTemplateId),
        ))[0];
        expect(dbTemplate).toEqual(expect.objectContaining({
          id: testTemplateId,
          name: 'Test Template',
          notes: 'Test Template Description 2',
          createdBy: testUserId,
          deleted: false,
        }));
      } finally {
        // Cleanup the template so we don't pollute other tests
        await drizzleClient.update(templates).set({
          notes: 'Test Template Description',
        }).where(eq(templates.id, testTemplateId));
      }
    });

    it('should return a 200 and template when adding and removing items in the body', async () => {
      let addedLineItemId: string | undefined;
      try {
        const response = await app.request(
          `http://localhost:8000/templates/${testTemplateId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              templateName: TEST_TEMPLATE_NAME,
              templateNotes: TEST_TEMPLATE_DESCRIPTION,
              templateLineItems: [
                {
                  templateLineItemSummary:
                    `${TEST_TEMPLATE_LINE_ITEM_SUMMARY} 2`,
                  templateLineItemNotes: `${TEST_TEMPLATE_LINE_ITEM_NOTES} 2`,
                  templateLineItemOrderIndex: 0,
                },
              ],
            }),
          },
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toEqual(expect.objectContaining({
          templateId: testTemplateId,
          templateName: TEST_TEMPLATE_NAME,
          templateNotes: TEST_TEMPLATE_DESCRIPTION,
        }));

        const dbTemplate = (await drizzleClient.select().from(templates).where(
          eq(templates.id, testTemplateId),
        ))[0];
        expect(dbTemplate).toEqual(expect.objectContaining({
          id: testTemplateId,
          name: 'Test Template',
          notes: 'Test Template Description',
          createdBy: testUserId,
          deleted: false,
        }));

        const deletedLineItem =
          (await drizzleClient.select().from(templateLineItems).where(
            eq(templateLineItems.id, testTemplateLineItemId),
          ))[0];
        expect(deletedLineItem).toEqual(expect.objectContaining({
          id: testTemplateLineItemId,
          summary: TEST_TEMPLATE_LINE_ITEM_SUMMARY,
          notes: TEST_TEMPLATE_LINE_ITEM_NOTES,
          orderIndex: 0,
          deleted: true,
        }));

        const addedLineItem = (
          await drizzleClient.select()
            .from(templateLineItems).where(
              and(
                eq(templateLineItems.templateId, testTemplateId),
                ne(templateLineItems.id, testTemplateLineItemId),
              ),
            )
        )[0];
        addedLineItemId = addedLineItem.id;
        expect(addedLineItem).toEqual(expect.objectContaining({
          id: expect.any(String),
          summary: `${TEST_TEMPLATE_LINE_ITEM_SUMMARY} 2`,
          notes: `${TEST_TEMPLATE_LINE_ITEM_NOTES} 2`,
          orderIndex: 0,
          deleted: false,
        }));
      } finally {
        // Cleanup the template so we don't pollute other tests
        await drizzleClient.update(templateLineItems).set({
          deleted: false,
        }).where(eq(templateLineItems.id, testTemplateLineItemId));
        if (addedLineItemId) {
          await drizzleClient.delete(templateLineItems).where(
            eq(templateLineItems.id, addedLineItemId),
          );
        }
      }
    });

    it('should return a 400 with error payload when given an invalid template id', async () => {
      const response = await app.request(
        `http://localhost:8000/templates/12345`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateName: TEST_TEMPLATE_NAME,
            templateNotes: 'Test Template Description 2',
            templateLineItems: [],
          }),
        },
      );
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({
        error: {
          issues: [
            {
              code: 'invalid_string',
              message: 'Invalid uuid',
              path: ['id'],
              validation: 'uuid',
            },
          ],
          name: 'ZodError',
        },
        success: false,
      });
    });

    it('should return a 404 with null when given a unknown template id', async () => {
      const response = await app.request(
        `http://localhost:8000/templates/${crypto.randomUUID()}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateName: TEST_TEMPLATE_NAME,
            templateNotes: `${TEST_TEMPLATE_DESCRIPTION} 2`,
            templateLineItems: [],
          }),
        },
      );
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: 'Not Found' });
    });

    it('should return a 400 when no update-able fields are provided', async () => {
      const response = await app.request(
        `http://localhost:8000/templates/${testTemplateId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            badKey: 'Test Template',
          }),
        },
      );
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({
        error: {
          issues: [
            {
              code: 'invalid_type',
              expected: 'string',
              message: 'template name is a required field',
              path: ['templateName'],
              received: 'undefined',
            },
            {
              code: 'invalid_type',
              expected: 'array',
              message: 'Required',
              path: ['templateLineItems'],
              received: 'undefined',
            },
          ],
          name: 'ZodError',
        },
        success: false,
      });
    });
  });

  describe('DELETE /templates/:id', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        }),
      });
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return a 200 when given valid credentials', async () => {
      try {
        const response = await app.request(
          `http://localhost:8000/templates/${testTemplateId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toEqual(expect.objectContaining({
          templateId: testTemplateId,
          templateName: 'Test Template',
          templateNotes: 'Test Template Description',
        }));
        const dbTemplate = (await drizzleClient.select().from(templates).where(
          eq(templates.id, testTemplateId),
        ))[0];
        expect(dbTemplate).toEqual(expect.objectContaining({
          id: testTemplateId,
          name: 'Test Template',
          notes: 'Test Template Description',
          createdBy: testUserId,
          deleted: true,
        }));
      } finally {
        // Cleanup the template so we don't pollute other tests
        await drizzleClient.update(templates).set({
          deleted: false,
          deletedBy: null,
        }).where(eq(templates.id, testTemplateId));
      }
    });
  });
});
