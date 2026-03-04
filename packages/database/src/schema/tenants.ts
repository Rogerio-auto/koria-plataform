/**
 * core.tenants — Multi-tenant support (currently 1 tenant: KorIA)
 */
import { pgSchema, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const coreSchema = pgSchema('core');

export const tenants = coreSchema.table('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  timezone: text('timezone').notNull().default('America/Porto_Velho'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
