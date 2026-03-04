/**
 * core.work_order_assets — Files/assets attached to a work order
 */
import { uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema } from './tenants';
import { workOrders } from './work-orders';

export const workOrderAssets = coreSchema.table('work_order_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  workOrderId: uuid('work_order_id').notNull().references(() => workOrders.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  url: text('url').notNull(),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
