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
  instanceLineItems,
  instances,
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
const TEST_INSTANCE_NAME = 'Test Instance Name';
const TEST_INSTANCE_NOTES = 'Test Instance Notes';
const TEST_INSTANCE_LINE_ITEM_SUMMARY = 'Test Instance Line Item';
const TEST_INSTANCE_LINE_ITEM_NOTES = 'Test Instance Line Item Description';

describe('instances', () => {
  const testDbName = generateTestDbName();
  const app = createApp();
  let drizzleClient: DrizzleDb;
  let authToken: string;
  let testUserId: string;
  let testTemplateId: string;
  let testTemplateLineItemId: string;
  let testInstanceId: string;
  let testInstanceLineItemId: string;

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

    const instance = (await drizzleClient.insert(instances).values({
      name: TEST_INSTANCE_NAME,
      notes: TEST_INSTANCE_NOTES,
      templateId: template.id,
      createdBy: adminId,
    }).returning({
      id: instances.id,
    }))[0];
    testInstanceId = instance.id;

    const instanceLineItem =
      (await drizzleClient.insert(instanceLineItems).values({
        summary: TEST_INSTANCE_LINE_ITEM_SUMMARY,
        notes: TEST_INSTANCE_LINE_ITEM_NOTES,
        orderIndex: 0,
        instanceId: instance.id,
        createdBy: adminId,
      }).returning({
        id: instanceLineItems.id,
      }))[0]
    testInstanceLineItemId = instanceLineItem.id;

  });

  afterAll(async () => {
    Deno.env.set('DB_NAME', 'postgres');
    await dropDatabase(testDbName);
  });

  describe('GET /instances', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/instances', {
        method: 'GET',
      });
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return a 200 and template list when given valid credentials', async () => {
      const response = await app.request('http://localhost:8000/instances', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([expect.objectContaining({
        id: testInstanceId,
        name: TEST_INSTANCE_NAME,
        notes: TEST_INSTANCE_NOTES,
      })]);
    });
  });

  describe('POST /instances', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/instances', {
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
      let newInstanceId = '-1';
      try {
        const response = await app.request('http://localhost:8000/instances', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateId: testTemplateId,
            name: 'Test Template 2',
            notes: 'Test Template Description 2',
          }),
        });
        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body).toHaveProperty('id');
        newInstanceId = body.id;
        expect(body).toEqual(expect.objectContaining({
          id: expect.any(String),
          name: 'Test Template 2',
          notes: 'Test Template Description 2',
        }));

        const dbTemplate = (await drizzleClient.select().from(instances).where(
          eq(instances.id, newInstanceId),
        ))[0];
        expect(dbTemplate).toEqual(expect.objectContaining({
          id: newInstanceId,
          name: 'Test Template 2',
          notes: 'Test Template Description 2',
          createdBy: testUserId,
          deleted: false,
        }));
      } finally {
        // Cleanup the template so we don't pollute other tests
        if (newInstanceId !== '-1') {
          await drizzleClient.delete(templates).where(
            eq(templates.id, newInstanceId),
          );
        }
      }
    });
  });

  describe('GET /instances/:id', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/instances', {
        method: 'GET',
      });
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return a 200 and template when given valid credentials', async () => {
      const response = await app.request(
        `http://localhost:8000/instances/${testInstanceId}`,
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
        id: testInstanceId,
        name: TEST_INSTANCE_NAME,
        notes: TEST_INSTANCE_NOTES,
        // NOTE: Couldn't get expect.arrayContaining to work here
        lineItems: [
          expect.objectContaining({
            id: testInstanceLineItemId,
            summary: TEST_INSTANCE_LINE_ITEM_SUMMARY,
            notes: TEST_INSTANCE_LINE_ITEM_NOTES,
            completed: false,
            orderIndex: 0,
          }),
        ],
      }));
    });

    it('should return a 400 with error payload when given an invalid template id', async () => {
      const response = await app.request(
        `http://localhost:8000/instances/12345`,
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
        `http://localhost:8000/instances/${crypto.randomUUID()}`,
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

  describe('PATCH /instances/:id', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request(`http://localhost:8000/instances/${testInstanceId}`, {
        method: 'PATCH',
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

    it('should return a 200 and instance when given valid credentials', async () => {
      try {
        const response = await app.request(
          `http://localhost:8000/instances/${testInstanceId}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: TEST_INSTANCE_NAME,
              notes: `${TEST_INSTANCE_NOTES} 2`,
              lineItems: [
                {
                  id: testInstanceLineItemId,
                  notes: TEST_INSTANCE_LINE_ITEM_NOTES,
                  completed: true,
                },
              ],
            }),
          },
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toEqual(expect.objectContaining({
          id: testInstanceId,
          name: TEST_INSTANCE_NAME,
          notes: `${TEST_INSTANCE_NOTES} 2`,
        }));

        const dbInstance = (await drizzleClient.select().from(instances).where(
          eq(instances.id, testInstanceId),
        ))[0];
        expect(dbInstance).toEqual(expect.objectContaining({
          id: testInstanceId,
          name: TEST_INSTANCE_NAME,
          notes: `${TEST_INSTANCE_NOTES} 2`,
          createdBy: testUserId,
          deleted: false,
        }));

        const dbLineItem = (await drizzleClient.select().from(instanceLineItems).where(
          eq(instanceLineItems.id, testInstanceLineItemId)
        ))[0];
        expect(dbLineItem).toEqual(expect.objectContaining({
          id: testInstanceLineItemId,
          notes: TEST_INSTANCE_LINE_ITEM_NOTES,
          summary: TEST_INSTANCE_LINE_ITEM_SUMMARY,
          completed: true,
        }));

      } finally {
        // Cleanup the template so we don't pollute other tests
        await drizzleClient.update(instances).set({
          notes: TEST_INSTANCE_NOTES,
        }).where(eq(instances.id, testInstanceId));
        await drizzleClient.update(instanceLineItems).set({
          completed: false,
        }).where(eq(instanceLineItems.id, testInstanceLineItemId));
      }
    });

    it('should return a 400 with error payload when given an invalid instance id', async () => {
      const response = await app.request(
        `http://localhost:8000/instances/12345`,
        {
          method: 'PATCH',
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
        `http://localhost:8000/instances/${crypto.randomUUID()}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: TEST_TEMPLATE_NAME,
            notes: `${TEST_TEMPLATE_DESCRIPTION} 2`,
            lineItems: [],
          }),
        },
      );
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: 'Not Found' });
    });

    it('should return a 400 when no update-able fields are provided', async () => {
      const response = await app.request(
        `http://localhost:8000/instances/${testInstanceId}`,
        {
          method: 'PATCH',
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
              expected: 'array',
              message: 'Required',
              path: ['lineItems'],
              received: 'undefined',
            },
          ],
          name: 'ZodError',
        },
        success: false,
      });
    });
  });

  describe('DELETE /instances/:id', () => {
    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/instances', {
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
          `http://localhost:8000/instances/${testInstanceId}`,
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
          id: testInstanceId,
          name: TEST_INSTANCE_NAME,
          notes: TEST_INSTANCE_NOTES,
        }));
        const dbTemplate = (await drizzleClient.select().from(instances).where(
          eq(instances.id, testInstanceId),
        ))[0];
        expect(dbTemplate).toEqual(expect.objectContaining({
          id: testInstanceId,
          name: TEST_INSTANCE_NAME,
          notes: TEST_INSTANCE_NOTES,
          createdBy: testUserId,
          deleted: true,
        }));
      } finally {
        // Cleanup the template so we don't pollute other tests
        await drizzleClient.update(instances).set({
          deleted: false,
          deletedBy: null,
        }).where(eq(instances.id, testTemplateId));
      }
    });
  });
});
