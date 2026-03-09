/**
 * core.briefing_form_configs — Dynamic briefing form configurations per tenant.
 * Each publish creates a new version; only one is active per tenant.
 */
import { uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';

export const briefingFormConfigStatusEnum = coreSchema.enum('briefing_form_config_status', [
  'draft',
  'published',
]);

export const briefingFormConfigs = coreSchema.table('briefing_form_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  version: integer('version').notNull().default(1),
  name: text('name').notNull().default('Briefing Padrão'),
  isActive: boolean('is_active').notNull().default(false),
  status: briefingFormConfigStatusEnum('status').notNull().default('draft'),
  steps: jsonb('steps').notNull().default([]),
  settings: jsonb('settings').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
});
