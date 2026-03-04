/**
 * core.events — Event store for audit trail and analytics
 */
import { uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';

export const eventEntityTypeEnum = coreSchema.enum('event_entity_type', [
  'lead',
  'conversation',
  'quote',
  'payment_intent',
  'work_order',
]);

export const events = coreSchema.table('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  entityType: eventEntityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  eventType: text('event_type').notNull(),
  source: text('source').notNull().default('n8n'),
  payload: jsonb('payload').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
