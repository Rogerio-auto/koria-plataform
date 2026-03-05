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
import { leads, leadQualification, workOrders } from '@koria/database';
import { SubmitBriefingDto } from './dto/submit-briefing.dto';

@Injectable()
export class BriefingService {
  private readonly logger = new Logger(BriefingService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  /** Resolve uploadToken → workOrder + lead info */
  private async resolveToken(token: string) {
    const result = await this.db
      .select({
        workOrderId: workOrders.id,
        leadId: workOrders.leadId,
        tenantId: workOrders.tenantId,
      })
      .from(workOrders)
      .where(eq(workOrders.uploadToken, token))
      .limit(1);

    const wo = result[0];
    if (!wo) {
      throw new NotFoundException('Token not found or expired');
    }
    return wo;
  }

  async getFormConfig(token: string) {
    const wo = await this.resolveToken(token);

    const leadResult = await this.db
      .select({
        id: leads.id,
        displayName: leads.displayName,
      })
      .from(leads)
      .where(eq(leads.id, wo.leadId))
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
      .where(eq(leadQualification.leadId, wo.leadId))
      .limit(1);

    const qualification = qualResult[0];

    return {
      leadId: lead.id,
      tenantId: wo.tenantId,
      leadName: lead.displayName,
      email: qualification?.email ?? null,
      phone: qualification?.phoneNumber ?? null,
      status: qualification?.status ?? 'pending',
      alreadySubmitted: qualification?.status === 'completed',
    };
  }

  async submitBriefing(dto: SubmitBriefingDto) {
    const wo = await this.resolveToken(dto.token);

    const existing = await this.db
      .select({ id: leadQualification.id })
      .from(leadQualification)
      .where(eq(leadQualification.leadId, wo.leadId))
      .limit(1);

    const now = new Date();

    const values = {
      tenantId: wo.tenantId,
      leadId: wo.leadId,
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
        .where(eq(leadQualification.leadId, wo.leadId));

      this.logger.log(`Briefing updated for lead ${wo.leadId}`);
    } else {
      await this.db
        .insert(leadQualification)
        .values(values);

      this.logger.log(`Briefing created for lead ${wo.leadId}`);
    }

    return { success: true };
  }

  async uploadLogo(token: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate token exists (throws if not found)
    await this.resolveToken(token);

    // For now, store as base64 data URI until S3 integration is added
    const base64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;

    this.logger.log(
      `Logo uploaded via token: ${file.originalname} (${file.size} bytes)`,
    );

    return { url: dataUri };
  }
}
