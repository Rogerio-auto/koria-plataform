/**
 * core.payment_intents — Payment intents (Stripe / Wise)
 */
import { uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';
import { quotes } from './quotes';

export const paymentProviderEnum = coreSchema.enum('payment_provider', ['stripe', 'wise']);
export const paymentStatusEnum = coreSchema.enum('payment_status', ['pending', 'paid', 'failed', 'canceled']);

export const paymentIntents = coreSchema.table('payment_intents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  quoteId: uuid('quote_id').references(() => quotes.id, { onDelete: 'set null' }),
  provider: paymentProviderEnum('provider').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull().default('0'),
  currency: text('currency').notNull().default('BRL'),
  providerRef: text('provider_ref'),
  payUrl: text('pay_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
