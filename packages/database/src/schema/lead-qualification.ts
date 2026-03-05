/**
 * core.lead_qualification — Detailed lead qualification data (briefing form)
 * Includes real-estate video production briefing fields.
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

  // ── Personal / Contact ───────────────────────────────
  fullName: text('full_name'),
  email: text('email'),
  phoneNumber: text('phone_number'),
  instagramPersonal: text('instagram_personal'),
  instagramCompany: text('instagram_company'),
  linkedinUrl: text('linkedin_url'),
  websiteUrl: text('website_url'),

  // ── Company ──────────────────────────────────────────
  companyName: text('company_name'),
  companySize: text('company_size'),
  industry: text('industry'),
  roleInCompany: text('role_in_company'),

  // ── Legacy generic project fields ────────────────────
  projectType: text('project_type'),
  projectGoal: text('project_goal'),
  projectDescription: text('project_description'),
  deadline: text('deadline'),
  budgetRange: text('budget_range'),

  // ── 1. Property / Real-estate Info ───────────────────
  propertyName: text('property_name'),
  propertyAddress: text('property_address'),
  propertyUnits: text('property_units'),
  propertyUnitSizes: text('property_unit_sizes'),
  propertyDifferentials: text('property_differentials').array(),

  // ── 2. Visual Identity ───────────────────────────────
  brandColors: text('brand_colors').array(),
  communicationTone: text('communication_tone'),
  visualReferences: text('visual_references').array(),

  // ── 3. Creative Direction ────────────────────────────
  targetAudience: text('target_audience'),
  mainEmotion: text('main_emotion'),
  mandatoryElements: text('mandatory_elements').array(),
  elementsToAvoid: text('elements_to_avoid').array(),

  // ── 4. Commercial Info ───────────────────────────────
  priceRange: text('price_range'),
  paymentConditions: text('payment_conditions'),
  launchDate: text('launch_date'),
  realtorContact: text('realtor_contact'),

  // ── 5. Extras ────────────────────────────────────────
  voiceoverText: text('voiceover_text'),
  musicPreference: text('music_preference'),
  legalDisclaimers: text('legal_disclaimers'),

  // ── References & Meta ────────────────────────────────
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
