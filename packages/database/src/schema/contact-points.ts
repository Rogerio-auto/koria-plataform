/**
 * core.contact_points — Lead contact channels (WhatsApp, Instagram, etc.)
 */
import { uuid, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';

export const channelTypeEnum = coreSchema.enum('channel_type', ['whatsapp', 'instagram', 'messenger', 'email']);

export const contactPoints = coreSchema.table('contact_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  channel: channelTypeEnum('channel').notNull(),
  handle: text('handle').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
