/**
 * core.stages — Funnel stages within a pipeline
 */
import { uuid, text, integer, boolean } from 'drizzle-orm/pg-core';
import { coreSchema } from './tenants';
import { pipelines } from './pipelines';

export const stages = coreSchema.table('stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  position: integer('position').notNull().default(0),
  isTerminal: boolean('is_terminal').notNull().default(false),
});
