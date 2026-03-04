/**
 * core.products — Products / packages catalog
 */
import { uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';

export const products = coreSchema.table('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  category: text('category'),
  defaultCurrency: text('default_currency').notNull().default('BRL'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
