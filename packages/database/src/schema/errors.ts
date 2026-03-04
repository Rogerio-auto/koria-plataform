/**
 * core.errors — System error logs
 */
import { uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';

export const errors = coreSchema.table('errors', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  context: text('context').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  errorMessage: text('error_message').notNull(),
  payload: jsonb('payload').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
