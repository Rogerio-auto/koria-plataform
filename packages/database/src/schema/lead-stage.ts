/**
 * core.lead_stage — Current lead position in the funnel
 */
import { uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';
import { pipelines } from './pipelines';
import { stages } from './stages';

export const leadStage = coreSchema.table(
  'lead_stage',
  {
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
    pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
    stageId: uuid('stage_id').notNull().references(() => stages.id),
    enteredAt: timestamp('entered_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.leadId, table.pipelineId] }),
  })
);
