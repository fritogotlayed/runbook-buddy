import { relations } from 'drizzle-orm';
import {
  instanceLineItems,
  instances,
  templateLineItems,
  templates,
  users,
  userSettings,
} from './schema.ts';

export const templateRelations = relations(templates, ({ many }) => ({
  lineItems: many(templateLineItems),
}));

export const templateLineItemRelations = relations(
  templateLineItems,
  ({ one }) => ({
    template: one(templates, {
      fields: [templateLineItems.templateId],
      references: [templates.id],
    }),
    parent: one(templateLineItems, {
      fields: [templateLineItems.parentId],
      references: [templateLineItems.id],
    }),
  }),
);

export const instanceRelations = relations(instances, ({ one, many }) => ({
  lineItems: many(instanceLineItems),
  template: one(templates, {
    fields: [instances.templateId],
    references: [templates.id],
  }),
}));

export const instanceLineItemRelations = relations(
  instanceLineItems,
  ({ one }) => ({
    instance: one(instances, {
      fields: [instanceLineItems.instanceId],
      references: [instances.id],
    }),
    parent: one(instanceLineItems, {
      fields: [instanceLineItems.parentId],
      references: [instanceLineItems.id],
    }),
  }),
);

export const userRelations = relations(users, ({ many }) => ({
  settings: many(userSettings),
}));

export const userSettingsRelations = relations(
  userSettings,
  ({ one }) => ({
    user: one(users, {
      fields: [userSettings.userId],
      references: [users.id],
    }),
  }),
);
