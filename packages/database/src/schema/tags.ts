/**
 * core.tags + core.lead_tags — Tags for leads
 */
import { uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';

export const tags = coreSchema.table('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  color: text('color'),
});

export const leadTags = coreSchema.table(
  'lead_tags',
  {
    leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.leadId, table.tagId] }),
  })
);
