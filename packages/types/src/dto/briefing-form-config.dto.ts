// ── Briefing Form Config types ──────────────────────

/** Supported field types for the dynamic form builder */
export type FieldType =
  | 'text' | 'textarea' | 'email' | 'tel' | 'number' | 'date' | 'url'
  | 'select' | 'multi-select' | 'radio' | 'chips'
  | 'color-picker' | 'url-list' | 'file-upload'
  | 'checkbox' | 'heading' | 'divider';

/** Internationalised text (pt-BR mandatory, en/es optional) */
export interface I18nText {
  'pt-BR': string;
  en?: string;
  es?: string;
}

/** Field-level validation rules */
export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
}

/** Option for select / radio / multi-select */
export interface FieldOption {
  value: string;
  label: I18nText;
}

/** Conditional display rule */
export interface FieldCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_empty';
  value?: string;
}

/** Single field definition inside a step */
export interface FieldConfig {
  id: string;
  type: FieldType;
  label: I18nText;
  placeholder?: I18nText;
  hint?: I18nText;
  required: boolean;
  order: number;
  validation?: FieldValidation;
  defaultValue?: unknown;
  options?: FieldOption[];
  gridCols?: 1 | 2;
  conditionalOn?: FieldCondition;
  mapToColumn?: string;
}

/** One step (tab) of the form */
export interface StepConfig {
  id: string;
  label: I18nText;
  icon?: string;
  order: number;
  fields: FieldConfig[];
}

/** Global form settings */
export interface FormSettings {
  theme?: {
    primaryColor?: string;
    logo?: string;
  };
  behavior?: {
    showProgressBar?: boolean;
    allowDraftSave?: boolean;
    redirectOnComplete?: string;
    successMessage?: I18nText;
  };
  integrations?: {
    syncToClickUp?: boolean;
    fireWebhook?: boolean;
    webhookUrl?: string;
    returnChannels?: {
      whatsapp?: string;
      instagram?: string;
      messenger?: string;
      telegram?: string;
    };
  };
}

/** Full form configuration entity */
export interface BriefingFormConfigEntity {
  id: string;
  tenantId: string;
  version: number;
  name: string;
  isActive: boolean;
  status: 'draft' | 'published';
  steps: StepConfig[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

/** Response from GET /briefing/:token/schema */
export interface BriefingFormSchema {
  formConfigId: string;
  version: number;
  steps: StepConfig[];
  settings: FormSettings;
  prefill: Record<string, unknown>;
}

/** DTO — create a new config */
export interface CreateBriefingFormConfigDto {
  name: string;
  steps: StepConfig[];
  settings?: FormSettings;
}

/** DTO — update an existing config */
export interface UpdateBriefingFormConfigDto {
  name?: string;
  steps?: StepConfig[];
  settings?: FormSettings;
}
