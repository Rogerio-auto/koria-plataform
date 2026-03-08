import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, like } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { leads, leadQualification, workOrders } from '@koria/database';
import { ConfigService } from '@nestjs/config';
import { ClickupService } from '../clickup/clickup.service';
import { SubmitBriefingDto } from './dto/submit-briefing.dto';

const DEMO_TOKEN_PREFIX = 'demo-';

function isDemoToken(token: string): boolean {
  return token.startsWith(DEMO_TOKEN_PREFIX);
}

@Injectable()
export class BriefingService {
  private readonly logger = new Logger(BriefingService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
    private readonly clickupService: ClickupService,
    private readonly config: ConfigService,
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
      alreadySubmitted: isDemoToken(token) ? false : qualification?.status === 'completed',
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

    const raw = {
      tenantId: wo.tenantId,
      leadId: wo.leadId,
      status: 'completed' as const,
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber ?? null,
      instagramPersonal: dto.instagramPersonal ?? null,
      instagramCompany: dto.instagramCompany ?? null,
      linkedinUrl: dto.linkedinUrl ?? null,
      websiteUrl: dto.websiteUrl ?? null,
      companyName: dto.companyName ?? null,
      companySize: dto.companySize ?? null,
      industry: dto.industry ?? null,
      roleInCompany: dto.roleInCompany ?? null,
      propertyName: dto.propertyName,
      propertyAddress: dto.propertyAddress,
      propertyUnits: dto.propertyUnits ?? null,
      propertyUnitSizes: dto.propertyUnitSizes ?? null,
      propertyDifferentials: dto.propertyDifferentials ?? null,
      brandColors: dto.brandColors ?? null,
      communicationTone: dto.communicationTone ?? null,
      visualReferences: dto.visualReferences ?? null,
      targetAudience: dto.targetAudience ?? null,
      mainEmotion: dto.mainEmotion ?? null,
      mandatoryElements: dto.mandatoryElements ?? null,
      elementsToAvoid: dto.elementsToAvoid ?? null,
      priceRange: dto.priceRange ?? null,
      paymentConditions: dto.paymentConditions ?? null,
      launchDate: dto.launchDate ?? null,
      realtorContact: dto.realtorContact ?? null,
      voiceoverText: dto.voiceoverText ?? null,
      musicPreference: dto.musicPreference ?? null,
      legalDisclaimers: dto.legalDisclaimers ?? null,
      projectType: dto.projectType ?? null,
      projectGoal: dto.projectGoal ?? null,
      projectDescription: dto.projectDescription ?? null,
      deadline: dto.deadline ?? null,
      budgetRange: dto.budgetRange ?? null,
      referencesUrls: dto.referencesUrls ?? null,
      howFoundUs: dto.howFoundUs ?? null,
      additionalNotes: dto.additionalNotes ?? null,
      submittedAt: now,
      completedAt: now,
      updatedAt: now,
    };

    const values = raw;

    try {
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
    } catch (error) {
      this.logger.error(`DB error saving briefing for lead ${wo.leadId}: ${error}`);
      throw error;
    }

    // ── Sync to ClickUp (non-blocking) ──────────────────
    if (wo.externalTaskId && this.clickupService.isConfigured()) {
      this.syncToClickUp(wo.externalTaskId, dto).catch((err) => {
        this.logger.error(`ClickUp sync failed: ${err}`);
      });
    }

    return { success: true };
  }

  // ── Demo token management ─────────────────────────────

  async getOrCreateDemoToken(): Promise<{ token: string }> {
    const tenantId = this.config.get<string>('DEFAULT_TENANT_ID');
    if (!tenantId) {
      throw new BadRequestException('DEFAULT_TENANT_ID not configured');
    }

    // Check if a demo work order already exists
    const existing = await this.db
      .select({ uploadToken: workOrders.uploadToken })
      .from(workOrders)
      .where(like(workOrders.uploadToken, `${DEMO_TOKEN_PREFIX}%`))
      .limit(1);

    if (existing[0]?.uploadToken) {
      this.logger.log(`Demo token reused: ${existing[0].uploadToken}`);
      return { token: existing[0].uploadToken };
    }

    // Create demo lead
    const leadResult = await this.db
      .insert(leads)
      .values({
        tenantId,
        type: 'person',
        displayName: 'Cliente Demonstração',
        status: 'active',
      })
      .returning({ id: leads.id });

    const leadId = leadResult[0]!.id;

    // Create demo work order with token (no qualification row needed —
    // getFormConfig handles missing qualification gracefully, and
    // submitBriefing does upsert)
    const token = `${DEMO_TOKEN_PREFIX}${Date.now().toString(36)}`;
    await this.db
      .insert(workOrders)
      .values({
        tenantId,
        leadId,
        status: 'created',
        uploadToken: token,
      });

    this.logger.log(`Demo token created: ${token} (lead: ${leadId})`);
    return { token };
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
