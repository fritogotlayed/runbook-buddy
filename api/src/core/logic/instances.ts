import { DrizzleDb } from '../../infrastructure/types.ts';
import {
  instanceLineItems,
  instances,
  templateLineItems,
  templates,
} from '../../infrastructure/db/schema.ts';
import { and, eq, or } from 'drizzle-orm';

export async function getInstanceById({
  db,
  id,
  userId,
}: {
  db: DrizzleDb;
  id?: string;
  userId: string;
}) {
  if (!id) {
    throw new Error('Instance ID is required');
  }

  const instanceResult = await db.select({
    id: instances.id,
    name: instances.name,
    notes: instances.notes,
  }).from(instances).where(
    and(
      eq(instances.id, id),
      eq(instances.deleted, false),
      eq(instances.createdBy, userId),
    ),
  );

  if (instanceResult.length === 0) {
    return null;
  }

  const instanceLineItemsResult = await db.select({
    id: instanceLineItems.id,
    summary: instanceLineItems.summary,
    notes: instanceLineItems.notes,
    completed: instanceLineItems.completed,
    orderIndex: instanceLineItems.orderIndex,
  }).from(instanceLineItems).where(
    and(
      eq(instanceLineItems.instanceId, id),
      eq(instanceLineItems.deleted, false),
    ),
  );

  return { ...instanceResult[0], lineItems: instanceLineItemsResult };
}

export function listInstances({
  db,
  userId,
  options,
}: {
  db: DrizzleDb;
  userId: string;
  options?: {
    all?: boolean;
  };
}) {
  const query = db.select({
    id: instances.id,
    name: instances.name,
    notes: instances.notes,
  }).from(instances);

  if (!options?.all) {
    query.where(
      and(
        eq(instances.createdBy, userId),
        eq(instances.deleted, false),
      ),
    );
  }

  return query;
}

export async function createInstance({
  db,
  userId,
  createOptions,
}: {
  db: DrizzleDb;
  userId: string;
  createOptions: {
    templateId: string;
    name?: string;
    notes?: string;
  };
}) {
  const { templateId, name, notes } = createOptions;
  const templateResults = await db.select({
    id: templates.id,
    name: templates.name,
    notes: templates.notes,
  }).from(templates).where(
    and(
      eq(templates.id, templateId),
      eq(templates.deleted, false),
      or(
        eq(templates.createdBy, userId),
        eq(templates.isGlobal, true),
      ),
    ),
  );

  if (templateResults.length === 0) {
    throw new Error('Template not found');
  }

  const result: {
    id: string;
    name: string;
    notes: string;
  } = await db.transaction(
    async (tx) => {
      const instanceResult = await tx.insert(instances).values({
        name: name ?? templateResults[0].name,
        notes: notes ?? templateResults[0].notes,
        templateId,
        createdBy: userId,
      }).returning({
        id: instances.id,
        name: instances.name,
        notes: instances.notes,
      });

      const templateLineItemsResults = await tx.select({
        id: templateLineItems.id,
        summary: templateLineItems.summary,
        notes: templateLineItems.notes,
        orderIndex: templateLineItems.orderIndex,
      }).from(templateLineItems).where(
        and(
          eq(templateLineItems.templateId, templateId),
          eq(templateLineItems.deleted, false),
        ),
      );

      await tx.insert(instanceLineItems).values(
        templateLineItemsResults.map((templateLineItem) => ({
          instanceId: instanceResult[0].id,
          summary: templateLineItem.summary,
          notes: templateLineItem.notes,
          orderIndex: templateLineItem.orderIndex,
          createdBy: userId,
        })),
      );

      return instanceResult[0];
    },
  );

  return getInstanceById({ db, id: result.id, userId });
}

export async function updateInstance({
  db,
  userId,
  instance,
}: {
  db: DrizzleDb;
  userId: string;
  instance: {
    id: string;
    name?: string;
    notes?: string;
    lineItems: {
      id: string;
      // summary: string;
      notes?: string;
      completed?: boolean;
    }[];
  };
}) {
  const existingInstance = await getInstanceById({
    db,
    id: instance.id,
    userId,
  });

  if (!existingInstance) {
    throw new Error('Instance not found');
  }

  await db.transaction(async (transaction) => {
    const { id, lineItems, ...updatePayload } = instance;
    await transaction.update(instances).set({
      ...updatePayload,
      updatedBy: userId,
      updatedAt: new Date(),
    }).where(
      and(
        eq(instances.id, id),
        eq(instances.createdBy, userId),
      ),
    );

    // Loop through line items and update them
    for (const lineItem of lineItems) {
      const { id: lineItemId, ...lineItemUpdate } = lineItem;
      await transaction.update(instanceLineItems).set({
        ...lineItemUpdate,
        updatedBy: userId,
        updatedAt: new Date(),
      }).where(
        eq(instanceLineItems.id, lineItemId),
      );
    }
  });

  return getInstanceById({ db, id: instance.id, userId });
}

export async function deleteInstance({
  db,
  userId,
  id,
}: {
  db: DrizzleDb;
  userId: string;
  id: string;
}) {
  const result = await db.transaction(async (tx) => {
    const deletedInstance = await tx.update(instances).set({
      deleted: true,
      deletedBy: userId,
      deletedAt: new Date(),
    }).where(
      and(
        eq(instances.id, id),
        eq(instances.createdBy, userId),
      ),
    ).returning({
      id: instances.id,
      name: instances.name,
      notes: instances.notes,
    });

    if (deletedInstance.length > 0) {
      tx.update(instanceLineItems).set({
        deleted: true,
        deletedBy: userId,
        deletedAt: new Date(),
      }).where(
        eq(instanceLineItems.instanceId, id),
      );
    }

    return deletedInstance;
  });
  return result.length > 0 ? result[0] : null;
}
