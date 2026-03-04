/**
 * core.messages — Messages sent/received
 */
import { uuid, text, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';
import { conversations } from './conversations';
import { channelTypeEnum } from './contact-points';

export const messageDirectionEnum = coreSchema.enum('message_direction', ['in', 'out']);
export const messageTypeEnum = coreSchema.enum('message_type', ['text', 'template', 'media']);
export const templateCategoryEnum = coreSchema.enum('template_category', ['marketing', 'utility', 'auth']);

export const messages = coreSchema.table('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  direction: messageDirectionEnum('direction').notNull(),
  channel: channelTypeEnum('channel').notNull(),
  providerMessageId: text('provider_message_id'),
  messageType: messageTypeEnum('message_type').notNull().default('text'),
  templateCategory: templateCategoryEnum('template_category'),
  waConversationId: text('wa_conversation_id'),
  costAmount: numeric('cost_amount', { precision: 12, scale: 4 }),
  costCurrency: text('cost_currency').notNull().default('BRL'),
  content: text('content'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
