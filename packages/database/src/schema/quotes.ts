/**
 * core.quotes — Quotations / proposals
 */
import { uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';
import { conversations } from './conversations';

export const quoteStatusEnum = coreSchema.enum('quote_status', ['draft', 'sent', 'accepted', 'rejected', 'expired']);

export const quotes = coreSchema.table('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  status: quoteStatusEnum('status').notNull().default('draft'),
  currency: text('currency').notNull().default('BRL'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
