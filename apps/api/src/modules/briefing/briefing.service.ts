import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { leads, leadQualification } from '@koria/database';
import { SubmitBriefingDto } from './dto/submit-briefing.dto';

@Injectable()
export class BriefingService {
  private readonly logger = new Logger(BriefingService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  async getFormConfig(leadId: string) {
    const leadResult = await this.db
      .select({
        id: leads.id,
        tenantId: leads.tenantId,
        displayName: leads.displayName,
        status: leads.status,
      })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    const lead = leadResult[0];
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const qualResult = await this.db
      .select({
        status: leadQualification.status,
        email: leadQualification.email,
        phoneNumber: leadQualification.phoneNumber,
      })
      .from(leadQualification)
      .where(eq(leadQualification.leadId, leadId))
      .limit(1);

    const qualification = qualResult[0];

    return {
      leadId: lead.id,
      tenantId: lead.tenantId,
      leadName: lead.displayName,
      email: qualification?.email ?? null,
      phone: qualification?.phoneNumber ?? null,
      status: qualification?.status ?? 'pending',
      alreadySubmitted: qualification?.status === 'completed',
    };
  }

  async submitBriefing(dto: SubmitBriefingDto) {
    const leadResult = await this.db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.id, dto.leadId))
      .limit(1);

    if (!leadResult[0]) {
      throw new NotFoundException('Lead not found');
    }

    const existing = await this.db
      .select({ id: leadQualification.id })
      .from(leadQualification)
      .where(eq(leadQualification.leadId, dto.leadId))
      .limit(1);

    const now = new Date();

    const values = {
      tenantId: dto.tenantId,
      leadId: dto.leadId,
      status: 'completed' as const,
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      instagramPersonal: dto.instagramPersonal,
      instagramCompany: dto.instagramCompany,
      linkedinUrl: dto.linkedinUrl,
      websiteUrl: dto.websiteUrl,
      companyName: dto.companyName,
      companySize: dto.companySize,
      industry: dto.industry,
      roleInCompany: dto.roleInCompany,
      propertyName: dto.propertyName,
      propertyAddress: dto.propertyAddress,
      propertyUnits: dto.propertyUnits,
      propertyUnitSizes: dto.propertyUnitSizes,
      propertyDifferentials: dto.propertyDifferentials,
      brandColors: dto.brandColors,
      communicationTone: dto.communicationTone,
      visualReferences: dto.visualReferences,
      targetAudience: dto.targetAudience,
      mainEmotion: dto.mainEmotion,
      mandatoryElements: dto.mandatoryElements,
      elementsToAvoid: dto.elementsToAvoid,
      priceRange: dto.priceRange,
      paymentConditions: dto.paymentConditions,
      launchDate: dto.launchDate,
      realtorContact: dto.realtorContact,
      voiceoverText: dto.voiceoverText,
      musicPreference: dto.musicPreference,
      legalDisclaimers: dto.legalDisclaimers,
      projectType: dto.projectType,
      projectGoal: dto.projectGoal,
      projectDescription: dto.projectDescription,
      deadline: dto.deadline,
      budgetRange: dto.budgetRange,
      referencesUrls: dto.referencesUrls,
      howFoundUs: dto.howFoundUs,
      additionalNotes: dto.additionalNotes,
      submittedAt: now,
      completedAt: now,
      updatedAt: now,
    };

    if (existing[0]) {
      await this.db
        .update(leadQualification)
        .set(values)
        .where(eq(leadQualification.leadId, dto.leadId));

      this.logger.log(`Briefing updated for lead ${dto.leadId}`);
    } else {
      await this.db
        .insert(leadQualification)
        .values(values);

      this.logger.log(`Briefing created for lead ${dto.leadId}`);
    }

    return { success: true };
  }

  async uploadLogo(leadId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const leadResult = await this.db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!leadResult[0]) {
      throw new NotFoundException('Lead not found');
    }

    // For now, store as base64 data URI until S3 integration is added
    const base64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;

    this.logger.log(
      `Logo uploaded for lead ${leadId}: ${file.originalname} (${file.size} bytes)`,
    );

    return { url: dataUri };
  }
}
