/**
 * core.conversations — Conversations (synced with Chatwoot)
 */
import { uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';
import { channelTypeEnum } from './contact-points';

export const conversationStateEnum = coreSchema.enum('conversation_state', ['open', 'pending', 'closed']);

export const conversations = coreSchema.table('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  channel: channelTypeEnum('channel').notNull(),
  externalThreadId: text('external_thread_id'),
  state: conversationStateEnum('state').notNull().default('open'),
  assignedTo: text('assigned_to'),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
