/**
 * core.objection_categories — Configurable objection types
 */
import { uuid, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';

export const objectionCategories = coreSchema.table('objection_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  keywords: text('keywords').array(),
  suggestedResponse: text('suggested_response'),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
