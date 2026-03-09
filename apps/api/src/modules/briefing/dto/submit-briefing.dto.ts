import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitBriefingDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  token!: string;

  // ── Contact ──────────────────────────────────────────
  @ApiProperty()
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  // ── Social / Company (optional) ──────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagramPersonal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagramCompany?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companySize?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roleInCompany?: string;

  // ── 1. Property / Real-estate ────────────────────────
  @ApiProperty()
  @IsString()
  @MinLength(2)
  propertyName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  propertyAddress!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertyUnits?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertyUnitSizes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propertyDifferentials?: string[];

  // ── 2. Visual Identity ───────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandColors?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  communicationTone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visualReferences?: string[];

  // ── 3. Creative Direction ────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainEmotion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mandatoryElements?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  elementsToAvoid?: string[];

  // ── 4. Commercial Info ───────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  launchDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  realtorContact?: string;

  // ── 5. Extras ────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voiceoverText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  musicPreference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  legalDisclaimers?: string;

  // ── Legacy / Meta ────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectGoal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referencesUrls?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  howFoundUs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  // ── Dynamic form builder fields ──────────────────────

  /** UUID of the briefing_form_configs row used (dynamic form) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formConfigId?: string;

  /** All field values keyed by field id (dynamic form) */
  @ApiPropertyOptional({ description: 'Dynamic field values keyed by field id' })
  @IsOptional()
  dynamicFields?: Record<string, unknown>;
}
