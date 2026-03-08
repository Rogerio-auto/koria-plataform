/**
 * core.integration_tokens — Persists OAuth tokens for external integrations (ClickUp, etc.)
 */
import { uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema } from './tenants';

export const integrationTokens = coreSchema.table('integration_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: text('provider').notNull().unique(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenType: text('token_type'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
