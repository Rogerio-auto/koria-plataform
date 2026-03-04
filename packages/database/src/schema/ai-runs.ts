/**
 * core.ai_runs — AI execution logs (tokens, cost, latency)
 */
import { uuid, text, integer, numeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { conversations } from './conversations';
import { leads } from './leads';

export const aiRuns = coreSchema.table('ai_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  agent: text('agent').notNull(),
  model: text('model'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  costAmount: numeric('cost_amount', { precision: 12, scale: 6 }),
  costCurrency: text('cost_currency').notNull().default('USD'),
  status: text('status').notNull().default('ok'),
  latencyMs: integer('latency_ms'),
  payload: jsonb('payload').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
