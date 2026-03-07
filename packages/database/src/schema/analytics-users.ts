/**
 * core.analytics_users — Users of the analytics dashboard
 */
import { uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';

export const userRoleEnum = coreSchema.enum('user_role', [
  'admin',
  'manager',
  'sdr',
  'viewer',
]);

export const userStatusEnum = coreSchema.enum('user_status', [
  'active',
  'inactive',
]);

export const analyticsUsers = coreSchema.table('analytics_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('viewer'),
  status: userStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});
