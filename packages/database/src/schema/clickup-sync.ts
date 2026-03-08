/**
 * core.clickup_sync — Maps KorIA pipelines to ClickUp spaces/lists for status sync.
 */
import { uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { pipelines } from './pipelines';

export const clickupSync = coreSchema.table('clickup_sync', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  pipelineId: uuid('pipeline_id').notNull().unique().references(() => pipelines.id, { onDelete: 'cascade' }),
  /** 'space' or 'list' — which ClickUp entity the statuses belong to */
  clickupType: text('clickup_type').notNull().default('space'),
  /** The ClickUp space_id or list_id */
  clickupEntityId: text('clickup_entity_id').notNull(),
  /** Optional: ClickUp team/workspace id for webhook registration */
  clickupTeamId: text('clickup_team_id'),
  /** Webhook id registered in ClickUp (for unsubscribing) */
  clickupWebhookId: text('clickup_webhook_id'),
  /** JSON map of stageId → clickup status name (for status name mismatches) */
  statusMapping: jsonb('status_mapping').notNull().default({}),
  /** Last successful sync timestamp */
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
