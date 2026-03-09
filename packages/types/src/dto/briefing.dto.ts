/**
 * DTO for submitting the briefing form.
 * Maps to core.lead_qualification columns.
 * Tailored for real-estate video production briefing.
 */
export interface SubmitBriefingDto {
  // Identification (required)
  token: string;

  // Personal info
  fullName: string;
  email: string;
  phoneNumber?: string;

  // Social media
  instagramPersonal?: string;
  instagramCompany?: string;
  linkedinUrl?: string;
  websiteUrl?: string;

  // Company info
  companyName?: string;
  companySize?: string;
  industry?: string;
  roleInCompany?: string;

  // Legacy generic project fields
  projectType?: string;
  projectGoal?: string;
  projectDescription?: string;
  deadline?: string;
  budgetRange?: string;

  // 1. Property / Real-estate info
  propertyName: string;
  propertyAddress: string;
  propertyUnits?: string;
  propertyUnitSizes?: string;
  propertyDifferentials?: string[];

  // 2. Visual identity
  brandColors?: string[];
  logoUrl?: string;
  communicationTone?: string;
  visualReferences?: string[];

  // 3. Creative direction
  targetAudience?: string;
  mainEmotion?: string;
  mandatoryElements?: string[];
  elementsToAvoid?: string[];

  // 4. Commercial info
  priceRange?: string;
  paymentConditions?: string;
  launchDate?: string;
  realtorContact?: string;

  // 5. Extras
  voiceoverText?: string;
  musicPreference?: string;
  legalDisclaimers?: string;

  // References & meta
  referencesUrls?: string[];
  howFoundUs?: string;
  additionalNotes?: string;

  // Dynamic form builder
  formConfigId?: string;
  dynamicFields?: Record<string, unknown>;
}

/**
 * Response after successful briefing submission.
 */
export interface BriefingSubmitResponse {
  success: boolean;
  qualificationId: string;
  message: string;
}

/**
 * Configuration returned when loading a briefing form.
 */
export interface BriefingFormConfig {
  leadId: string;
  tenantId: string;
  leadName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  alreadySubmitted: boolean;
}
