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
import { ClickupService } from '../clickup/clickup.service';
import { SubmitBriefingDto } from './dto/submit-briefing.dto';

@Injectable()
export class BriefingService {
  private readonly logger = new Logger(BriefingService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
    private readonly clickupService: ClickupService,
  ) {}

  /** Resolve uploadToken → workOrder + lead info */
  private async resolveToken(token: string) {
    const result = await this.db
      .select({
        workOrderId: workOrders.id,
        leadId: workOrders.leadId,
        tenantId: workOrders.tenantId,
        externalTaskId: workOrders.externalTaskId,
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

    // ── Sync to ClickUp (non-blocking) ──────────────────
    if (wo.externalTaskId && this.clickupService.isConfigured()) {
      this.syncToClickUp(wo.externalTaskId, dto).catch((err) => {
        this.logger.error(`ClickUp sync failed: ${err}`);
      });
    }

    return { success: true };
  }

  // ── ClickUp integration ──────────────────────────────

  private async syncToClickUp(taskId: string, dto: SubmitBriefingDto) {
    // A) Post formatted comment
    const markdown = this.formatBriefingComment(dto);
    await this.clickupService.postComment(taskId, markdown);

    // B) Attach JSON with raw data
    const jsonData = this.buildBriefingJson(dto);
    const buffer = Buffer.from(JSON.stringify(jsonData, null, 2), 'utf-8');
    const fileName = `briefing-${new Date().toISOString().slice(0, 10)}.json`;
    await this.clickupService.attachFileToTask(taskId, buffer, fileName, 'application/json');

    this.logger.log(`Briefing synced to ClickUp task ${taskId}`);
  }

  private formatBriefingComment(dto: SubmitBriefingDto): string {
    const line = (label: string, value?: string | null) =>
      value ? `• ${label}: ${value}` : '';
    const list = (label: string, items?: string[] | null) =>
      items?.length ? `• ${label}: ${items.join(', ')}` : '';
    const section = (title: string, lines: string[]) => {
      const filtered = lines.filter(Boolean);
      if (!filtered.length) return '';
      return `\n📋 ${title}\n${filtered.join('\n')}`;
    };

    const parts = [
      `🏗️ BRIEFING — ${dto.propertyName || dto.fullName}`,
      `Enviado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,

      section('Contato', [
        line('Nome', dto.fullName),
        line('Email', dto.email),
        line('Telefone', dto.phoneNumber),
      ]),

      section('Empreendimento', [
        line('Nome', dto.propertyName),
        line('Endereço', dto.propertyAddress),
        line('Unidades', dto.propertyUnits),
        line('Metragens', dto.propertyUnitSizes),
        list('Diferenciais', dto.propertyDifferentials),
      ]),

      section('Identidade Visual', [
        list('Cores da marca', dto.brandColors),
        line('Tom de comunicação', dto.communicationTone),
        list('Referências visuais', dto.visualReferences),
      ]),

      section('Direção Criativa', [
        line('Público-alvo', dto.targetAudience),
        line('Emoção principal', dto.mainEmotion),
        list('Elementos obrigatórios', dto.mandatoryElements),
        list('Elementos a evitar', dto.elementsToAvoid),
      ]),

      section('Informações Comerciais', [
        line('Faixa de preço', dto.priceRange),
        line('Condições de pagamento', dto.paymentConditions),
        line('Data de lançamento', dto.launchDate),
        line('Contato do corretor', dto.realtorContact),
      ]),

      section('Extras', [
        line('Texto para locução', dto.voiceoverText),
        line('Preferência musical', dto.musicPreference),
        line('Avisos legais', dto.legalDisclaimers),
        line('Observações', dto.additionalNotes),
      ]),
    ];

    return parts.filter(Boolean).join('\n');
  }

  private buildBriefingJson(dto: SubmitBriefingDto): Record<string, unknown> {
    const { token, ...data } = dto;
    return {
      _meta: {
        type: 'briefing',
        submittedAt: new Date().toISOString(),
      },
      ...data,
    };
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
