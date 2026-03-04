/**
 * core.lead_qualification — Detailed lead qualification data (briefing form)
 */
import { uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { coreSchema, tenants } from './tenants';
import { leads } from './leads';

export const leadQualificationStatusEnum = coreSchema.enum('lead_qualification_status', ['pending', 'sent', 'completed']);

export const leadQualification = coreSchema.table('lead_qualification', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  leadId: uuid('lead_id').notNull().unique().references(() => leads.id, { onDelete: 'cascade' }),
  status: leadQualificationStatusEnum('status').notNull().default('pending'),
  formSentAt: timestamp('form_sent_at', { withTimezone: true }),
  formSentCount: integer('form_sent_count').default(0),
  fullName: text('full_name'),
  email: text('email'),
  phoneNumber: text('phone_number'),
  instagramPersonal: text('instagram_personal'),
  instagramCompany: text('instagram_company'),
  linkedinUrl: text('linkedin_url'),
  websiteUrl: text('website_url'),
  companyName: text('company_name'),
  companySize: text('company_size'),
  industry: text('industry'),
  roleInCompany: text('role_in_company'),
  projectType: text('project_type'),
  projectGoal: text('project_goal'),
  projectDescription: text('project_description'),
  deadline: text('deadline'),
  budgetRange: text('budget_range'),
  referencesUrls: text('references_urls').array(),
  howFoundUs: text('how_found_us'),
  additionalNotes: text('additional_notes'),
  formId: text('form_id'),
  formResponseId: text('form_response_id'),
  formUrl: text('form_url'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
