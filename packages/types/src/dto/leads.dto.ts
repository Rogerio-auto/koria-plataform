import { LeadType, LeadStatus } from '../enums';

export interface CreateLeadDto {
  type?: LeadType;
  displayName?: string;
  preferredLanguage?: string;
  countryCode?: string;
  vipLevel?: number;
  score?: number;
  contactPoints?: CreateContactPointDto[];
}

export interface UpdateLeadDto {
  type?: LeadType;
  displayName?: string;
  preferredLanguage?: string;
  countryCode?: string;
  vipLevel?: number;
  score?: number;
  status?: LeadStatus;
}

export interface CreateContactPointDto {
  channel: string;
  handle: string;
  isPrimary?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MoveLeadStageDto {
  pipelineId: string;
  stageId: string;
}

export interface LeadsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  pipelineId?: string;
  stageId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePipelineDto {
  name: string;
}

export interface UpdatePipelineDto {
  name?: string;
}

export interface CreateStageDto {
  pipelineId: string;
  name: string;
  code: string;
  position?: number;
  isTerminal?: boolean;
}

export interface UpdateStageDto {
  name?: string;
  code?: string;
  position?: number;
  isTerminal?: boolean;
}

export interface ReorderStagesDto {
  stages: Array<{ id: string; position: number }>;
}
