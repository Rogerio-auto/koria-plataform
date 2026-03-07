/**
 * core.invite_tokens — Invitation links for user registration
 */
import { uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { analyticsUsers, userRoleEnum } from './analytics-users';

export const inviteTokens = coreSchema.table('invite_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  token: varchar('token', { length: 64 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  role: userRoleEnum('role').notNull().default('viewer'),
  createdBy: uuid('created_by').references(() => analyticsUsers.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  usedBy: uuid('used_by').references(() => analyticsUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
