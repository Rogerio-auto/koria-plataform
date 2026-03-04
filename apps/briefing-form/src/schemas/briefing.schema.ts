/**
 * Zod validation schema for briefing form.
 * TODO: Align with SubmitBriefingDto in the API.
 */
import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phoneNumber: z.string().optional(),
  instagramPersonal: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export const companyInfoSchema = z.object({
  companyName: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  roleInCompany: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  instagramCompany: z.string().optional(),
});

export const projectInfoSchema = z.object({
  projectType: z.string().min(1, 'Tipo de projeto é obrigatório'),
  projectGoal: z.string().min(1, 'Objetivo é obrigatório'),
  projectDescription: z.string().optional(),
  deadline: z.string().optional(),
  budgetRange: z.string().optional(),
});

export const referencesSchema = z.object({
  referencesUrls: z.array(z.string().url()).optional(),
  howFoundUs: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const briefingFormSchema = personalInfoSchema
  .merge(companyInfoSchema)
  .merge(projectInfoSchema)
  .merge(referencesSchema);

export type BriefingFormData = z.infer<typeof briefingFormSchema>;
