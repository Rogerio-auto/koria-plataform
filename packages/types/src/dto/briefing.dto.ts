/**
 * DTO for submitting the briefing form.
 * Maps to core.lead_qualification columns.
 */
export interface SubmitBriefingDto {
  // Identification (required)
  leadId: string;
  tenantId: string;

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

  // Project info
  projectType?: string;
  projectGoal?: string;
  projectDescription?: string;
  deadline?: string;
  budgetRange?: string;

  // References
  referencesUrls?: string[];

  // Other
  howFoundUs?: string;
  additionalNotes?: string;
}

/**
 * Response after successful briefing submission.
 */
export interface BriefingSubmitResponse {
  success: boolean;
  qualificationId: string;
  message: string;
}
