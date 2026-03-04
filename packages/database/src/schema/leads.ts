/**
 * core.leads — Leads / Contacts
 */
import { uuid, text, smallint, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';

export const leadTypeEnum = coreSchema.enum('lead_type', ['person', 'company']);
export const leadStatusEnum = coreSchema.enum('lead_status', ['active', 'archived', 'blocked']);

export const leads = coreSchema.table('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  type: leadTypeEnum('type').notNull().default('person'),
  displayName: text('display_name'),
  preferredLanguage: text('preferred_language'),
  countryCode: text('country_code'),
  vipLevel: smallint('vip_level').notNull().default(0),
  score: smallint('score').notNull().default(0),
  status: leadStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
