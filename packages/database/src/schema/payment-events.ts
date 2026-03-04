/**
 * core.payment_events — Payment webhook events
 */
import { uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema } from './tenants';
import { paymentIntents } from './payment-intents';

export const paymentEvents = coreSchema.table('payment_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  paymentIntentId: uuid('payment_intent_id').notNull().references(() => paymentIntents.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
