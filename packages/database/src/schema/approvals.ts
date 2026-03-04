/**
 * core.approvals — Preview approvals for work orders
 */
import { uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema } from './tenants';
import { workOrders } from './work-orders';

export const approvals = coreSchema.table('approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  workOrderId: uuid('work_order_id').notNull().references(() => workOrders.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
