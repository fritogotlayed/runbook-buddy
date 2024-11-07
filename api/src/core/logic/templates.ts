import { DrizzleDb } from '../../infrastructure/types.ts';
import {
  templateLineItems,
  templates,
} from '../../infrastructure/db/schema.ts';
import { and, eq } from 'drizzle-orm';

export async function getTemplateById({
  db,
  id,
  userId,
}: {
  db: DrizzleDb;
  id?: string;
  userId: string;
}) {
  if (!id) {
    throw new Error('Template ID is required');
  }

  const templateResult = await db.select({
    templateId: templates.id,
    templateName: templates.name,
    templateNotes: templates.notes,
  }).from(templates).where(
    and(
      eq(templates.id, id),
      eq(templates.deleted, false),
      eq(templates.createdBy, userId),
    ),
  );

  if (templateResult.length === 0) {
    return null;
  }

  const templateLineItemsResult = await db.select({
    templateLineItemId: templateLineItems.id,
    templateLineItemSummary: templateLineItems.summary,
    templateLineItemNotes: templateLineItems.notes,
    templateLineItemOrderIndex: templateLineItems.orderIndex,
  }).from(templateLineItems).where(
    and(
      eq(templateLineItems.templateId, id),
      eq(templateLineItems.deleted, false),
    ),
  );

  return { ...templateResult[0], templateLineItems: templateLineItemsResult };
}

export function listTemplates({
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
    templateId: templates.id,
    templateName: templates.name,
    templateNotes: templates.notes,
  }).from(templates);

  if (!options?.all) {
    query.where(
      and(
        eq(templates.createdBy, userId),
        eq(templates.deleted, false),
      ),
    );
  }

  return query;
}

export async function createTemplate({
  db,
  userId,
  template,
}: {
  db: DrizzleDb;
  userId: string;
  template: {
    name: string;
    notes: string;
    isGlobal?: boolean;
  };
}) {
  const result = await db.insert(templates).values({
    ...template,
    isGlobal: template.isGlobal ?? false,
    createdBy: userId,
  }).returning({
    templateId: templates.id,
    templateName: templates.name,
    templateNotes: templates.notes,
    templateIsGlobal: templates.isGlobal,
  });

  return result[0];
}

export async function updateTemplate({
  db,
  userId,
  template,
}: {
  db: DrizzleDb;
  userId: string;
  template: {
    id: string;
    name: string;
    notes: string;
    isGlobal?: boolean;
    lineItems: {
      id?: string | null;
      summary: string;
      notes: string;
      orderIndex: number;
    }[];
  };
}) {
  const existingTemplate = await getTemplateById({
    db,
    id: template.id,
    userId,
  });

  if (!existingTemplate) {
    throw new Error('Template not found');
  }

  await db.transaction(async (transaction) => {
    const { id, lineItems, ...updatePayload } = template;
    // TODO: Update line item ordering
    await transaction.update(templates).set({
      ...updatePayload,
      updatedBy: userId,
      updatedAt: new Date(),
    }).where(
      and(
        eq(templates.id, id),
        eq(templates.createdBy, userId),
      ),
    );

    // Get a list of template line items to be deleted. I.e. ones that exist on the existing template,
    // but not in the request body.
    const lineItemsToRemove = existingTemplate.templateLineItems.filter(
      (lineItem) =>
        !lineItems.some(
          (tli) => tli.id === lineItem.templateLineItemId,
        ),
    );

    for (const lineItem of lineItemsToRemove) {
      await transaction.update(templateLineItems).set({
        deleted: true,
        deletedBy: userId,
        deletedAt: new Date(),
      }).where(
        eq(templateLineItems.id, lineItem.templateLineItemId),
      );
    }

    // Loop through line items and update them
    for (const lineItem of lineItems) {
      if (lineItem.id) {
        await transaction.update(templateLineItems).set({
          summary: lineItem.summary,
          notes: lineItem.notes,
          orderIndex: lineItem.orderIndex,
          updatedBy: userId,
          updatedAt: new Date(),
        }).where(
          eq(templateLineItems.id, lineItem.id),
        );
      } else {
        await transaction.insert(templateLineItems).values({
          templateId: id,
          summary: lineItem.summary,
          notes: lineItem.notes,
          orderIndex: lineItem.orderIndex,
          createdBy: userId,
          createdAt: new Date(),
        });
      }
    }
  });
}

export async function deleteTemplate({
  db,
  userId,
  id,
}: {
  db: DrizzleDb;
  userId: string;
  id: string;
}) {
  const result = await db.transaction(async (tx) => {
    const deletedTemplate = await tx.update(templates).set({
      deleted: true,
      deletedBy: userId,
      deletedAt: new Date(),
    }).where(
      and(
        eq(templates.id, id),
        eq(templates.createdBy, userId),
      ),
    ).returning({
      templateId: templates.id,
      templateName: templates.name,
      templateNotes: templates.notes,
    });

    if (deletedTemplate.length > 0) {
      await tx.update(templateLineItems).set({
        deleted: true,
        deletedBy: userId,
        deletedAt: new Date(),
      }).where(
        eq(templateLineItems.templateId, id),
      );
    }

    return deletedTemplate;
  });
  return result.length > 0 ? result[0] : null;
}
