/**
 * core.quote_items — Line items within a quote
 */
import { uuid, integer, numeric, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema } from './tenants';
import { quotes } from './quotes';
import { products } from './products';

export const quoteItems = coreSchema.table('quote_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  qty: integer('qty').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  metadata: jsonb('metadata').notNull().default({}),
});
