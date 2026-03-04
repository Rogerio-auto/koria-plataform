/**
 * core.followup_rules — Follow-up cadence rules
 */
import { uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { stages } from './stages';
import { channelTypeEnum } from './contact-points';

export const followupRules = coreSchema.table('followup_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  triggerStageId: uuid('trigger_stage_id').notNull().references(() => stages.id),
  delayMinutes: integer('delay_minutes').notNull(),
  channel: channelTypeEnum('channel').notNull(),
  templateName: text('template_name'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
