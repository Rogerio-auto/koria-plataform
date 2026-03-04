/**
 * core.pipelines — Sales pipelines
 */
import { uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';

export const pipelines = coreSchema.table('pipelines', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
