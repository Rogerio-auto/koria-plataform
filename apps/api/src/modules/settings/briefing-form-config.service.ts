import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { briefingFormConfigs } from '@koria/database';
import type { StepConfig } from '@koria/types';
import { CreateBriefingFormConfigDto } from './dto/create-briefing-form-config.dto';
import { UpdateBriefingFormConfigDto } from './dto/update-briefing-form-config.dto';

@Injectable()
export class BriefingFormConfigService {
  private readonly logger = new Logger(BriefingFormConfigService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  /** List all configs for tenant, newest first */
  async listByTenant(tenantId: string) {
    return this.db
      .select()
      .from(briefingFormConfigs)
      .where(eq(briefingFormConfigs.tenantId, tenantId))
      .orderBy(desc(briefingFormConfigs.version));
  }

  /** Get single config by id */
  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(briefingFormConfigs)
      .where(eq(briefingFormConfigs.id, id))
      .limit(1);

    if (!rows[0]) throw new NotFoundException('Form config not found');
    return rows[0];
  }

  /** Create a new draft config */
  async create(tenantId: string, dto: CreateBriefingFormConfigDto) {
    // Determine next version number for this tenant
    const latest = await this.db
      .select({ version: briefingFormConfigs.version })
      .from(briefingFormConfigs)
      .where(eq(briefingFormConfigs.tenantId, tenantId))
      .orderBy(desc(briefingFormConfigs.version))
      .limit(1);

    const nextVersion = (latest[0]?.version ?? 0) + 1;

    const result = await this.db
      .insert(briefingFormConfigs)
      .values({
        tenantId,
        version: nextVersion,
        name: dto.name,
        status: 'draft',
        isActive: false,
        steps: dto.steps as unknown as Record<string, unknown>,
        settings: (dto.settings ?? {}) as Record<string, unknown>,
      })
      .returning();

    this.logger.log(`Config created v${nextVersion} for tenant ${tenantId}`);
    return result[0];
  }

  /** Update a config (settings always allowed; name/steps only on drafts) */
  async update(id: string, dto: UpdateBriefingFormConfigDto) {
    const existing = await this.findById(id);
    if (existing.status === 'published' && (dto.name !== undefined || dto.steps !== undefined)) {
      throw new ConflictException('Cannot edit name/steps of a published config. Duplicate it first.');
    }

    const setValues: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.name !== undefined) setValues.name = dto.name;
    if (dto.steps !== undefined) setValues.steps = dto.steps;
    if (dto.settings !== undefined) setValues.settings = dto.settings;

    const result = await this.db
      .update(briefingFormConfigs)
      .set(setValues)
      .where(eq(briefingFormConfigs.id, id))
      .returning();

    this.logger.log(`Config ${id} updated`);
    return result[0];
  }

  /** Publish a config — deactivates others for that tenant */
  async publish(id: string) {
    const config = await this.findById(id);

    // Deactivate all configs for this tenant
    await this.db
      .update(briefingFormConfigs)
      .set({ isActive: false })
      .where(eq(briefingFormConfigs.tenantId, config.tenantId));

    // Activate and publish this one
    const now = new Date();
    const result = await this.db
      .update(briefingFormConfigs)
      .set({
        isActive: true,
        status: 'published',
        publishedAt: now,
        updatedAt: now,
      })
      .where(eq(briefingFormConfigs.id, id))
      .returning();

    this.logger.log(`Config ${id} published for tenant ${config.tenantId}`);
    return result[0];
  }

  /** Delete a draft config */
  async remove(id: string) {
    const config = await this.findById(id);
    if (config.isActive) {
      throw new ConflictException('Cannot delete the active config');
    }

    await this.db
      .delete(briefingFormConfigs)
      .where(eq(briefingFormConfigs.id, id));

    this.logger.log(`Config ${id} deleted`);
    return { deleted: true };
  }

  /** Duplicate a config as a new draft */
  async duplicate(id: string) {
    const source = await this.findById(id);

    return this.create(source.tenantId, {
      name: `${source.name} (cópia)`,
      steps: source.steps as unknown[],
      settings: source.settings as Record<string, unknown>,
    });
  }

  /** Get active config for a tenant (or null) */
  async getActiveForTenant(tenantId: string) {
    const rows = await this.db
      .select()
      .from(briefingFormConfigs)
      .where(
        and(
          eq(briefingFormConfigs.tenantId, tenantId),
          eq(briefingFormConfigs.isActive, true),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  /** Return built-in templates */
  getTemplates(): Array<{ id: string; name: string; description: string; steps: StepConfig[] }> {
    return [IMMOBILIARY_TEMPLATE];
  }
}

// ── Built-in immobiliary template (matches current hardcoded form) ────

const IMMOBILIARY_TEMPLATE: {
  id: string;
  name: string;
  description: string;
  steps: StepConfig[];
} = {
  id: 'tpl_imobiliario',
  name: 'Imobiliário',
  description: 'Template padrão para vídeos de empreendimentos imobiliários (5 etapas, ~25 campos)',
  steps: [
    {
      id: 'step_contact_property',
      label: { 'pt-BR': 'Empreendimento + Contato' },
      icon: 'Building2',
      order: 0,
      fields: [
        { id: 'fullName', type: 'text', label: { 'pt-BR': 'Nome completo' }, placeholder: { 'pt-BR': 'Digite seu nome completo' }, required: true, order: 0, validation: { minLength: 2 }, gridCols: 1, mapToColumn: 'full_name' },
        { id: 'email', type: 'email', label: { 'pt-BR': 'E-mail' }, placeholder: { 'pt-BR': 'seu@email.com' }, required: true, order: 1, gridCols: 1, mapToColumn: 'email' },
        { id: 'phoneNumber', type: 'tel', label: { 'pt-BR': 'Telefone' }, placeholder: { 'pt-BR': '(99) 99999-9999' }, required: false, order: 2, gridCols: 1, mapToColumn: 'phone_number' },
        { id: 'propertyName', type: 'text', label: { 'pt-BR': 'Nome do empreendimento' }, placeholder: { 'pt-BR': 'Ex: Residencial Horizonte' }, required: true, order: 3, validation: { minLength: 2 }, gridCols: 1, mapToColumn: 'property_name' },
        { id: 'propertyAddress', type: 'text', label: { 'pt-BR': 'Endereço' }, placeholder: { 'pt-BR': 'Rua, número, bairro, cidade' }, required: true, order: 4, validation: { minLength: 5 }, gridCols: 1, mapToColumn: 'property_address' },
        { id: 'propertyUnits', type: 'text', label: { 'pt-BR': 'Tipos de unidade' }, placeholder: { 'pt-BR': 'Studio, 1 quarto, 2 quartos…' }, required: false, order: 5, gridCols: 1, mapToColumn: 'property_units' },
        { id: 'propertyUnitSizes', type: 'text', label: { 'pt-BR': 'Metragens' }, placeholder: { 'pt-BR': '35m², 50m², 70m²…' }, required: false, order: 6, gridCols: 1, mapToColumn: 'property_unit_sizes' },
        { id: 'propertyDifferentials', type: 'chips', label: { 'pt-BR': 'Diferenciais' }, placeholder: { 'pt-BR': 'Digite e pressione Enter' }, required: false, order: 7, gridCols: 1, mapToColumn: 'property_differentials' },
      ],
    },
    {
      id: 'step_visual_identity',
      label: { 'pt-BR': 'Identidade Visual' },
      icon: 'Palette',
      order: 1,
      fields: [
        { id: 'brandColors', type: 'color-picker', label: { 'pt-BR': 'Cores da marca' }, required: false, order: 0, gridCols: 1, mapToColumn: 'brand_colors' },
        { id: 'communicationTone', type: 'select', label: { 'pt-BR': 'Tom de comunicação' }, required: false, order: 1, gridCols: 1, mapToColumn: 'communication_tone', options: [
          { value: 'formal', label: { 'pt-BR': 'Formal' } },
          { value: 'informal', label: { 'pt-BR': 'Informal' } },
          { value: 'luxurious', label: { 'pt-BR': 'Luxuoso' } },
          { value: 'technical', label: { 'pt-BR': 'Técnico' } },
          { value: 'friendly', label: { 'pt-BR': 'Amigável' } },
        ] },
        { id: 'visualReferences', type: 'url-list', label: { 'pt-BR': 'Referências visuais (URLs)' }, placeholder: { 'pt-BR': 'Cole um link e pressione Enter' }, required: false, order: 2, gridCols: 1, mapToColumn: 'visual_references' },
      ],
    },
    {
      id: 'step_creative_direction',
      label: { 'pt-BR': 'Direção Criativa' },
      icon: 'Lightbulb',
      order: 2,
      fields: [
        { id: 'targetAudience', type: 'radio', label: { 'pt-BR': 'Público-alvo principal' }, required: false, order: 0, gridCols: 1, mapToColumn: 'target_audience', options: [
          { value: 'young_professionals', label: { 'pt-BR': 'Jovens profissionais' } },
          { value: 'families', label: { 'pt-BR': 'Famílias' } },
          { value: 'investors', label: { 'pt-BR': 'Investidores' } },
          { value: 'luxury', label: { 'pt-BR': 'Alto padrão' } },
          { value: 'other', label: { 'pt-BR': 'Outro' } },
        ] },
        { id: 'mainEmotion', type: 'radio', label: { 'pt-BR': 'Emoção principal a transmitir' }, required: false, order: 1, gridCols: 1, mapToColumn: 'main_emotion', options: [
          { value: 'security', label: { 'pt-BR': 'Segurança' } },
          { value: 'exclusivity', label: { 'pt-BR': 'Exclusividade' } },
          { value: 'modernity', label: { 'pt-BR': 'Modernidade' } },
          { value: 'comfort', label: { 'pt-BR': 'Conforto' } },
          { value: 'freedom', label: { 'pt-BR': 'Liberdade' } },
        ] },
        { id: 'mandatoryElements', type: 'chips', label: { 'pt-BR': 'Elementos obrigatórios' }, placeholder: { 'pt-BR': 'Ex: piscina, academia, varanda…' }, required: false, order: 2, gridCols: 1, mapToColumn: 'mandatory_elements' },
        { id: 'elementsToAvoid', type: 'chips', label: { 'pt-BR': 'Elementos a evitar' }, placeholder: { 'pt-BR': 'Ex: imagens de stock, tons escuros…' }, required: false, order: 3, gridCols: 1, mapToColumn: 'elements_to_avoid' },
      ],
    },
    {
      id: 'step_commercial',
      label: { 'pt-BR': 'Informações Comerciais' },
      icon: 'DollarSign',
      order: 3,
      fields: [
        { id: 'priceRange', type: 'text', label: { 'pt-BR': 'Faixa de preço' }, placeholder: { 'pt-BR': 'Ex: R$ 300.000 a R$ 500.000' }, required: false, order: 0, gridCols: 1, mapToColumn: 'price_range' },
        { id: 'paymentConditions', type: 'textarea', label: { 'pt-BR': 'Condições de pagamento' }, placeholder: { 'pt-BR': 'Descreva as condições' }, required: false, order: 1, gridCols: 1, mapToColumn: 'payment_conditions' },
        { id: 'launchDate', type: 'date', label: { 'pt-BR': 'Data de lançamento' }, required: false, order: 2, gridCols: 1, mapToColumn: 'launch_date' },
        { id: 'realtorContact', type: 'text', label: { 'pt-BR': 'Contato do corretor' }, placeholder: { 'pt-BR': 'Nome e telefone' }, required: false, order: 3, gridCols: 1, mapToColumn: 'realtor_contact' },
      ],
    },
    {
      id: 'step_extras',
      label: { 'pt-BR': 'Extras' },
      icon: 'Plus',
      order: 4,
      fields: [
        { id: 'voiceoverText', type: 'textarea', label: { 'pt-BR': 'Texto para locução' }, placeholder: { 'pt-BR': 'Se já tiver um texto pronto…' }, required: false, order: 0, gridCols: 1, mapToColumn: 'voiceover_text' },
        { id: 'musicPreference', type: 'text', label: { 'pt-BR': 'Preferência musical' }, placeholder: { 'pt-BR': 'Estilo ou referências' }, required: false, order: 1, gridCols: 1, mapToColumn: 'music_preference' },
        { id: 'legalDisclaimers', type: 'textarea', label: { 'pt-BR': 'Avisos legais' }, placeholder: { 'pt-BR': 'Textos obrigatórios, disclaimers…' }, required: false, order: 2, gridCols: 1, mapToColumn: 'legal_disclaimers' },
        { id: 'additionalNotes', type: 'textarea', label: { 'pt-BR': 'Observações adicionais' }, placeholder: { 'pt-BR': 'Algo mais que devemos saber?' }, required: false, order: 3, gridCols: 1, mapToColumn: 'additional_notes' },
      ],
    },
  ],
};
