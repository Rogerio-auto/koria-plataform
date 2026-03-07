/**
 * core.assistant_action_logs — Audit trail for assistant actions
 */
import { uuid, varchar, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { analyticsUsers } from './analytics-users';
import { assistantConversations } from './assistant-conversations';

export const assistantActionLogs = coreSchema.table('assistant_action_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').notNull().references(() => analyticsUsers.id),
  conversationId: uuid('conversation_id').references(() => assistantConversations.id),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  actionInput: jsonb('action_input'),
  actionOutput: jsonb('action_output'),
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),
  executedAt: timestamp('executed_at', { withTimezone: true }).notNull().defaultNow(),
});
