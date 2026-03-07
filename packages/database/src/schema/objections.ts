/**
 * core.objections — Objections detected in lead conversations
 */
import { uuid, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';

export const objections = coreSchema.table('objections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  leadId: uuid('lead_id').notNull().references(() => leads.id),
  conversationId: uuid('conversation_id'),
  category: varchar('category', { length: 100 }).notNull(),
  originalText: text('original_text').notNull(),
  detectedAt: timestamp('detected_at', { withTimezone: true }).notNull().defaultNow(),
  wasOvercome: boolean('was_overcome').notNull().default(false),
  overcomeAt: timestamp('overcome_at', { withTimezone: true }),
  metadata: jsonb('metadata').notNull().default({}),
});
