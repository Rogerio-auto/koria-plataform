/**
 * core.followup_queue — Scheduled follow-up messages queue
 */
import { uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';
import { conversations } from './conversations';
import { followupRules } from './followup-rules';

export const followupStatusEnum = coreSchema.enum('followup_status', ['scheduled', 'sent', 'canceled', 'failed']);

export const followupQueue = coreSchema.table('followup_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  ruleId: uuid('rule_id').notNull().references(() => followupRules.id, { onDelete: 'cascade' }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  status: followupStatusEnum('status').notNull().default('scheduled'),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
