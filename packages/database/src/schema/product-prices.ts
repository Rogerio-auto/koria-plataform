/**
 * core.product_prices — Prices per currency for products
 */
import { uuid, text, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema } from './tenants';
import { products } from './products';

export const productPrices = coreSchema.table('product_prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  currency: text('currency').notNull(),
  priceAmount: numeric('price_amount', { precision: 12, scale: 2 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
