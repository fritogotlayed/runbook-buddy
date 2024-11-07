import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const MAX_INT_32 = 2147483647;

/*
 * NOTE: Not sure if this is a bug with deno, drizzle, or typescript, but when
 * spreading the "crudFields" object into the tables below, the deno compiler or
 * typescript believes these fields do not exist. The "deno compile" and "deno check"
 * commands also fail. As a workaround, we are manually defining the fields in each
 * tables below.
const crudFields: Record<string, unknown> = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by').references(() => users.id),
  deleted: boolean('deleted').default(false),
};
 */

// Tables
export const templates = pgTable('templates', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: text().notNull(),
  notes: text().notNull(),
  isGlobal: boolean('is_global').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by').references(() => users.id),
  deleted: boolean('deleted').default(false),
});

export const templateLineItems = pgTable('template_line_items', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  parentId: uuid('parent_id'),
  templateId: uuid('template_id').references(() => templates.id).notNull(),
  summary: text(),
  notes: text(),
  orderIndex: integer('order_index').notNull().default(MAX_INT_32),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by').references(() => users.id),
  deleted: boolean('deleted').default(false),
}, (t) => {
  return [
    foreignKey(
      {
        columns: [t.parentId],
        foreignColumns: [t.id],
        name: 'fk_template_line_items_parent_id',
      },
    ),
  ];
});

export const instances = pgTable('instances', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  templateId: uuid('template_id').references(() => templates.id).notNull(),
  name: text().notNull(),
  notes: text().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by').references(() => users.id),
  deleted: boolean('deleted').default(false),
});

export const instanceLineItems = pgTable('instance_line_items', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  parentId: uuid('parent_id'),
  instanceId: uuid('instance_id').references(() => instances.id).notNull(),
  completed: boolean().notNull().default(false),
  summary: text(),
  notes: text(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by').references(() => users.id),
  deleted: boolean('deleted').default(false),
}, (t) => {
  return [
    foreignKey(
      {
        columns: [t.parentId],
        foreignColumns: [t.id],
        name: 'fk_instance_line_items_parent_id',
      },
    ),
  ];
});

// NOTE: Deno / typescript has an issue here were self referencing
// causes the language server to not recognize the fields.
export const users = pgTable('users', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  username: text().unique().notNull(),
  password: text().notNull(),
  passwordExpires: timestamp('password_expires').notNull().defaultNow(),
  isLocked: boolean('is_locked').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: uuid('updated_by'),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by'),
  deleted: boolean('deleted').default(false),
});

export const userSettings = pgTable('user_settings', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  key: text(),
  value: text(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by').references(() => users.id),
  deleted: boolean('deleted').default(false),
});

export const endpointStats = pgTable('endpoint_stats', {
  path: text().notNull(),
  method: text().notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => {
  return [
    primaryKey({ columns: [t.path, t.method] }),
  ];
});
