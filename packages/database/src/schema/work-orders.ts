/**
 * core.work_orders — Production work orders (integrates with ClickUp)
 */
import { uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';
import { quotes } from './quotes';
import { paymentIntents } from './payment-intents';

export const workOrderStatusEnum = coreSchema.enum('work_order_status', [
  'created',
  'in_progress',
  'preview_sent',
  'changes_requested',
  'approved',
  'delivered',
  'canceled',
]);

export const workOrders = coreSchema.table('work_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  quoteId: uuid('quote_id').references(() => quotes.id, { onDelete: 'set null' }),
  paymentIntentId: uuid('payment_intent_id').references(() => paymentIntents.id, { onDelete: 'set null' }),
  status: workOrderStatusEnum('status').notNull().default('created'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  externalTaskId: text('external_task_id'),
  briefing: jsonb('briefing').notNull().default({}),
  uploadToken: text('upload_token').unique(),
  formConfigId: uuid('form_config_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
