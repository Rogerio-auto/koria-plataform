import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, like, desc, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { leads, leadQualification, workOrders, conversations, contactPoints } from '@koria/database';
import { generateReturnUrl } from '@koria/utils';
import { ConfigService } from '@nestjs/config';
import { ClickupService } from '../clickup/clickup.service';
import { BriefingFormConfigService } from '../settings/briefing-form-config.service';
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
    private readonly formConfigService: BriefingFormConfigService,
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

    // Get primary contact point for channel detection
    const cpResult = await this.db
      .select({ channel: contactPoints.channel })
      .from(contactPoints)
      .where(
        and(
          eq(contactPoints.leadId, wo.leadId),
          eq(contactPoints.isPrimary, true),
        ),
      )
      .limit(1);

    const channel = cpResult[0]?.channel ?? null;

    // Get returnChannels from the active form config
    let returnUrl: string | null = null;
    const activeConfig = await this.formConfigService.getActiveForTenant(wo.tenantId);
    const settings = activeConfig?.settings as Record<string, any> | undefined;
    if (settings?.integrations?.returnChannels && channel) {
      returnUrl = generateReturnUrl(channel, settings.integrations.returnChannels);
    }

    return {
      leadId: lead.id,
      tenantId: wo.tenantId,
      leadName: lead.displayName,
      email: qualification?.email ?? null,
      phone: qualification?.phoneNumber ?? null,
      status: qualification?.status ?? 'pending',
      alreadySubmitted: isDemoToken(token) ? false : qualification?.status === 'completed',
      channel,
      returnUrl,
    };
  }

  /** Returns the dynamic form schema for rendering, or null if no config exists */
  async getFormSchema(token: string) {
    const wo = await this.resolveToken(token);

    // Check if the work order has a specific config, otherwise use tenant's active config
    let config: Awaited<ReturnType<BriefingFormConfigService['getActiveForTenant']>> = null;

    if (wo.externalTaskId) {
      // Check work order's form_config_id column
      const woFull = await this.db
        .select({ formConfigId: workOrders.formConfigId })
        .from(workOrders)
        .where(eq(workOrders.id, wo.workOrderId))
        .limit(1);

      if (woFull[0]?.formConfigId) {
        config = await this.formConfigService.findById(woFull[0].formConfigId);
      }
    }

    if (!config) {
      config = await this.formConfigService.getActiveForTenant(wo.tenantId);
    }

    if (!config) {
      // No dynamic config — client should render legacy form
      return { legacy: true };
    }

    // Prefill with lead data
    const leadResult = await this.db
      .select({ displayName: leads.displayName })
      .from(leads)
      .where(eq(leads.id, wo.leadId))
      .limit(1);

    const qualResult = await this.db
      .select({ email: leadQualification.email, phoneNumber: leadQualification.phoneNumber })
      .from(leadQualification)
      .where(eq(leadQualification.leadId, wo.leadId))
      .limit(1);

    return {
      formConfigId: config.id,
      version: config.version,
      steps: config.steps,
      settings: config.settings,
      prefill: {
        fullName: leadResult[0]?.displayName ?? '',
        email: qualResult[0]?.email ?? '',
        phoneNumber: qualResult[0]?.phoneNumber ?? '',
      },
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

    // Build the values to persist depending on legacy vs dynamic mode
    let values: Record<string, unknown>;

    if (dto.formConfigId && dto.dynamicFields) {
      // ── Dynamic form mode ──────────────────────────────
      values = this.buildDynamicValues(dto, wo, now);
    } else {
      // ── Legacy hardcoded mode ──────────────────────────
      values = this.buildLegacyValues(dto, wo, now);
    }

    try {
      if (existing[0]) {
        await this.db
          .update(leadQualification)
          .set(values as any)
          .where(eq(leadQualification.leadId, wo.leadId));

        this.logger.log(`Briefing updated for lead ${wo.leadId}`);
      } else {
        await this.db
          .insert(leadQualification)
          .values(values as any);

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

    // ── Fire webhook (non-blocking) ─────────────────────
    this.fireWebhookIfConfigured(wo.tenantId, wo.leadId).catch((err) => {
      this.logger.error(`Webhook dispatch failed: ${err}`);
    });

    return { success: true };
  }

  /** Map field values from dynamic config → DB columns + custom_fields JSONB */
  private buildDynamicValues(
    dto: SubmitBriefingDto,
    wo: { tenantId: string; leadId: string },
    now: Date,
  ): Record<string, unknown> {
    const dynamicFields = dto.dynamicFields ?? {};

    // Known column names in lead_qualification (camelCase → DB column mapping)
    const columnMap: Record<string, string> = {
      full_name: 'fullName',
      email: 'email',
      phone_number: 'phoneNumber',
      instagram_personal: 'instagramPersonal',
      instagram_company: 'instagramCompany',
      linkedin_url: 'linkedinUrl',
      website_url: 'websiteUrl',
      company_name: 'companyName',
      company_size: 'companySize',
      industry: 'industry',
      role_in_company: 'roleInCompany',
      property_name: 'propertyName',
      property_address: 'propertyAddress',
      property_units: 'propertyUnits',
      property_unit_sizes: 'propertyUnitSizes',
      property_differentials: 'propertyDifferentials',
      brand_colors: 'brandColors',
      communication_tone: 'communicationTone',
      visual_references: 'visualReferences',
      target_audience: 'targetAudience',
      main_emotion: 'mainEmotion',
      mandatory_elements: 'mandatoryElements',
      elements_to_avoid: 'elementsToAvoid',
      price_range: 'priceRange',
      payment_conditions: 'paymentConditions',
      launch_date: 'launchDate',
      realtor_contact: 'realtorContact',
      voiceover_text: 'voiceoverText',
      music_preference: 'musicPreference',
      legal_disclaimers: 'legalDisclaimers',
      additional_notes: 'additionalNotes',
      how_found_us: 'howFoundUs',
      budget_range: 'budgetRange',
      project_type: 'projectType',
      project_goal: 'projectGoal',
      project_description: 'projectDescription',
      deadline: 'deadline',
    };

    // Reverse map: camelCase property → snake_case column
    const reverseMap: Record<string, string> = {};
    for (const [col, camel] of Object.entries(columnMap)) {
      reverseMap[camel] = col;
    }

    // All valid camelCase column keys
    const validColumns = new Set(Object.values(columnMap));

    const mapped: Record<string, unknown> = {
      tenantId: wo.tenantId,
      leadId: wo.leadId,
      status: 'completed' as const,
      formConfigId: dto.formConfigId,
      submittedAt: now,
      completedAt: now,
      updatedAt: now,
    };
    const customFields: Record<string, unknown> = {};

    for (const [fieldId, value] of Object.entries(dynamicFields)) {
      if (validColumns.has(fieldId)) {
        mapped[fieldId] = value ?? null;
      } else {
        customFields[fieldId] = value;
      }
    }

    mapped.customFields = customFields;
    return mapped;
  }

  /** Build values from the legacy hardcoded DTO fields */
  private buildLegacyValues(
    dto: SubmitBriefingDto,
    wo: { tenantId: string; leadId: string },
    now: Date,
  ): Record<string, unknown> {
    return {
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

  // ── Webhook dispatch ──────────────────────────────

  private async fireWebhookIfConfigured(tenantId: string, leadId: string) {
    const config = await this.formConfigService.getActiveForTenant(tenantId);
    const settings = (config?.settings ?? {}) as Record<string, any>;
    const integrations = settings.integrations ?? {};

    if (!integrations.fireWebhook) return;

    const url = integrations.webhookUrl || this.config.get<string>('N8N_WEBHOOK_URL');
    if (!url) {
      this.logger.warn(`Webhook enabled but no URL configured for tenant ${tenantId}`);
      return;
    }

    // Fetch the most recent conversation for this lead (session_id)
    const convRow = await this.db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.leadId, leadId))
      .orderBy(desc(conversations.createdAt))
      .limit(1);

    const payload = {
      lead_id: leadId,
      tenant_id: tenantId,
      session_id: convRow[0]?.id ?? null,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${await response.text()}`);
    }

    this.logger.log(`Webhook dispatched to ${url} for lead ${leadId}`);
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
