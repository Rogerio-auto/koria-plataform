/**
 * Zod validation schema for the multi-step real-estate briefing form.
 * Each step has its own schema for per-step validation.
 */
import { z } from 'zod';

// ── Step 1: Property Info ──────────────────────────────
export const propertyInfoSchema = z.object({
  propertyName: z.string().min(2),
  propertyAddress: z.string().min(5),
  propertyUnits: z.string().optional(),
  propertyUnitSizes: z.string().optional(),
  propertyDifferentials: z.array(z.string()).optional(),
});

// ── Step 2: Visual Identity ────────────────────────────
export const visualIdentitySchema = z.object({
  brandColors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).optional(),
  communicationTone: z.string().optional(),
  visualReferences: z.array(z.string().url()).optional(),
});

// ── Step 3: Creative Direction ─────────────────────────
export const creativeDirectionSchema = z.object({
  targetAudience: z.string().min(1),
  mainEmotion: z.string().min(1),
  mandatoryElements: z.array(z.string()).optional(),
  elementsToAvoid: z.array(z.string()).optional(),
});

// ── Step 4: Commercial Info ────────────────────────────
export const commercialInfoSchema = z.object({
  priceRange: z.string().optional(),
  paymentConditions: z.string().optional(),
  launchDate: z.string().optional(),
  realtorContact: z.string().optional(),
});

// ── Step 5: Extras ─────────────────────────────────────
export const extrasSchema = z.object({
  voiceoverText: z.string().optional(),
  musicPreference: z.string().optional(),
  legalDisclaimers: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// ── Contact info (collected in step 1 alongside property) ──
export const contactInfoSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
});

// ── Merged full schema ─────────────────────────────────
export const briefingFormSchema = contactInfoSchema
  .merge(propertyInfoSchema)
  .merge(visualIdentitySchema)
  .merge(creativeDirectionSchema)
  .merge(commercialInfoSchema)
  .merge(extrasSchema);

export type BriefingFormData = z.infer<typeof briefingFormSchema>;

/** Step schemas indexed by step number (0-based). Step 5 is review (no schema). */
export const stepSchemas = [
  contactInfoSchema.merge(propertyInfoSchema),
  visualIdentitySchema,
  creativeDirectionSchema,
  commercialInfoSchema,
  extrasSchema,
] as const;
