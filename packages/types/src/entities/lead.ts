import { LeadType, LeadStatus, ChannelType, LeadQualificationStatus } from '../enums';

/** core.leads */
export interface Lead {
  id: string;
  tenantId: string;
  type: LeadType;
  displayName: string | null;
  preferredLanguage: string | null;
  countryCode: string | null;
  vipLevel: number;
  score: number;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

/** core.contact_points */
export interface ContactPoint {
  id: string;
  tenantId: string;
  leadId: string;
  channel: ChannelType;
  handle: string;
  isPrimary: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/** core.lead_qualification */
export interface LeadQualification {
  id: string;
  tenantId: string;
  leadId: string;
  status: LeadQualificationStatus;
  formSentAt: string | null;
  formSentCount: number;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  instagramPersonal: string | null;
  instagramCompany: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  companyName: string | null;
  companySize: string | null;
  industry: string | null;
  roleInCompany: string | null;
  projectType: string | null;
  projectGoal: string | null;
  projectDescription: string | null;
  deadline: string | null;
  budgetRange: string | null;
  referencesUrls: string[] | null;
  howFoundUs: string | null;
  additionalNotes: string | null;
  formId: string | null;
  formResponseId: string | null;
  formUrl: string | null;
  submittedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

/** core.lead_stage (joined view) */
export interface LeadStage {
  tenantId: string;
  leadId: string;
  pipelineId: string;
  stageId: string;
  enteredAt: string;
  updatedAt: string;
}

/** core.tags */
export interface Tag {
  id: string;
  tenantId: string;
  name: string;
  color: string | null;
}
