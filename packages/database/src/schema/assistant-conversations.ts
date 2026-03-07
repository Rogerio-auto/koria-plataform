/**
 * core.assistant_conversations — Chat history for the AI assistant
 */
import { uuid, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { analyticsUsers } from './analytics-users';

export const assistantConversations = coreSchema.table('assistant_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').notNull().references(() => analyticsUsers.id),
  messages: jsonb('messages').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
