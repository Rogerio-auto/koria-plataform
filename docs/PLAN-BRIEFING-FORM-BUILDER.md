# Planejamento — Form Builder de Briefing (Configurações)

> **Objetivo:** Permitir que a empresa (KorIA) monte e personalize o formulário de briefing pelo Dashboard — escolhendo campos, tipos de entrada, ordem das etapas, validações e textos — sem depender de código.

---

## 1. Visão Geral da Feature

### Situação Atual

O formulário de briefing (`apps/briefing-form`) é **hardcoded** com 5 etapas fixas e ~25 campos:

| Etapa | Campos Fixos |
|-------|-------------|
| 1. Empreendimento + Contato | fullName, email, phoneNumber, propertyName, propertyAddress, propertyUnits, propertyUnitSizes, propertyDifferentials |
| 2. Identidade Visual | brandColors, communicationTone, visualReferences |
| 3. Direção Criativa | targetAudience, mainEmotion, mandatoryElements, elementsToAvoid |
| 4. Info Comercial | priceRange, paymentConditions, launchDate, realtorContact |
| 5. Extras | voiceoverText, musicPreference, legalDisclaimers, additionalNotes |

Os campos estão mapeados diretamente para colunas do banco (`core.lead_qualification`), os steps estão em componentes React fixos, e as validações são Zod schemas estáticos.

### Objetivo Final

A empresa acessa **Dashboard → Configurações → Formulário de Briefing** e pode:

1. **Criar/editar etapas** (steps) — nome, ícone, ordem
2. **Adicionar/remover campos** em cada etapa — arrastar para reordenar
3. **Configurar cada campo:**
   - Label (pt-BR, en, es)
   - Tipo de entrada (text, textarea, email, tel, select, multi-select, chips, color-picker, url-list, date, number, checkbox, radio, file-upload)
   - Placeholder / hint
   - Obrigatório (sim/não)
   - Validação (min/max length, regex, min/max items)
   - Opções (para select, radio, multi-select)
   - Valor default
4. **Preview ao vivo** — ver como o formulário ficará para o cliente
5. **Publicar** — salvar a configuração (versionada)

O formulário de briefing (`briefing-form` app) carrega a configuração via API e renderiza **dinamicamente** — sem código fixo por campo.

---

## 2. Arquitetura Proposta

```
┌─────────────────────────────────────────────────────┐
│                   DASHBOARD                          │
│  Configurações → Formulário de Briefing              │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Form Builder (drag-and-drop steps & fields)    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │ │
│  │  │ Step 1   │ │ Step 2   │ │ Step N   │        │ │
│  │  │ [Field]  │ │ [Field]  │ │ [Field]  │        │ │
│  │  │ [Field]  │ │ [Field]  │ │          │        │ │
│  │  └──────────┘ └──────────┘ └──────────┘        │ │
│  │                                                  │ │
│  │  [Preview]  [Salvar Rascunho]  [Publicar]       │ │
│  └─────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────┘
                         │ API
                         ▼
┌─────────────────────────────────────────────────────┐
│                    API (NestJS)                       │
│  POST /settings/briefing-form   → salvar config      │
│  GET  /settings/briefing-form   → carregar config    │
│  GET  /briefing/:token/schema   → config pro form    │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│               BRIEFING FORM (público)                │
│  Carrega schema via API → renderiza dinamicamente    │
│  ┌──────────────────────────────────┐                │
│  │  DynamicStep                      │                │
│  │   → DynamicField (por field.type)│                │
│  │   → DynamicField                 │                │
│  └──────────────────────────────────┘                │
└─────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Dados (Database)

### 3.1 Nova tabela: `core.briefing_form_configs`

Armazena a configuração do formulário por tenant. Cada publicação gera uma nova versão.

```sql
CREATE TABLE core.briefing_form_configs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES core.tenants(id),
  version       INTEGER NOT NULL DEFAULT 1,
  name          TEXT NOT NULL DEFAULT 'Briefing Padrão',
  is_active     BOOLEAN NOT NULL DEFAULT false,            -- Apenas 1 ativo por tenant
  status        TEXT NOT NULL DEFAULT 'draft',              -- draft | published
  steps         JSONB NOT NULL DEFAULT '[]',               -- Array de steps
  settings      JSONB NOT NULL DEFAULT '{}',               -- Configurações gerais
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at  TIMESTAMPTZ,                               -- Quando foi publicado
  
  UNIQUE(tenant_id, version)
);
```

### 3.2 Estrutura do campo `steps` (JSONB)

```jsonc
[
  {
    "id": "step_contact",
    "label": { "pt-BR": "Dados de Contato", "en": "Contact Info", "es": "Datos de Contacto" },
    "icon": "UserCircle",            // Nome do ícone lucide-react
    "order": 0,
    "fields": [
      {
        "id": "fullName",
        "type": "text",              // Ver tipos suportados abaixo
        "label": { "pt-BR": "Nome completo", "en": "Full name", "es": "Nombre completo" },
        "placeholder": { "pt-BR": "Digite seu nome", "en": "Enter your name", "es": "Ingrese su nombre" },
        "hint": { "pt-BR": "Como no documento", "en": "As in ID", "es": "Como en documento" },
        "required": true,
        "order": 0,
        "validation": {
          "minLength": 2,
          "maxLength": 200
        },
        "defaultValue": null,
        "options": null,             // Usado para select/radio/multi-select
        "gridCols": 1,              // 1 = full width, 2 = half width (grid sm:grid-cols-2)
        "conditionalOn": null,       // { "fieldId": "xxx", "value": "yyy" } — exibir apenas se
        "mapToColumn": "full_name"   // Coluna na lead_qualification (opcional, para campos mapeáveis)
      },
      {
        "id": "email",
        "type": "email",
        "label": { "pt-BR": "E-mail", "en": "Email", "es": "Correo" },
        "required": true,
        "order": 1,
        "gridCols": 1,
        "mapToColumn": "email"
      }
      // ... mais fields
    ]
  },
  {
    "id": "step_property",
    "label": { "pt-BR": "Empreendimento", "en": "Property", "es": "Emprendimiento" },
    "icon": "Building2",
    "order": 1,
    "fields": [ /* ... */ ]
  }
]
```

### 3.3 Tipos de campo suportados

| Tipo (`field.type`) | Componente Gerado | Descrição |
|---------------------|-------------------|-----------|
| `text` | `<input type="text">` | Texto curto (1 linha) |
| `textarea` | `<textarea>` | Texto longo (multilinha) |
| `email` | `<input type="email">` | E-mail com validação |
| `tel` | `<input type="tel">` | Telefone |
| `number` | `<input type="number">` | Numérico |
| `date` | `<input type="date">` | Seletor de data |
| `url` | `<input type="url">` | URL com validação |
| `select` | `<select>` | Dropdown com opções pré-definidas |
| `multi-select` | Checkboxes | Múltipla escolha |
| `radio` | Radio group | Escolha única com cards visuais |
| `chips` | `<ChipInput>` | Tags/chips (Enter para adicionar) |
| `color-picker` | Color input | Seletor de cor hex |
| `url-list` | ChipInput (URLs) | Lista de URLs |
| `file-upload` | Dropzone | Upload de arquivo (logo, referências) |
| `checkbox` | `<input type="checkbox">` | Sim/Não |
| `heading` | `<h3>` | Subtítulo (não é campo de dados) |
| `divider` | `<hr>` | Separador visual |

### 3.4 Campo `settings` (JSONB)

```jsonc
{
  "theme": {
    "primaryColor": "#45B649",       // Override da cor primária
    "logo": null                      // URL do logo (se diferente do padrão)
  },
  "behavior": {
    "showProgressBar": true,
    "allowDraftSave": true,           // Auto-save no localStorage
    "redirectOnComplete": "/briefing/success",
    "successMessage": { "pt-BR": "Briefing enviado com sucesso!", "en": "Briefing submitted!", "es": "¡Briefing enviado!" }
  },
  "integrations": {
    "syncToClickUp": true,            // Enviar comentário ao ClickUp
    "fireWebhook": true,              // Disparar webhook N8N
    "webhookUrl": null                // Override do webhook URL
  }
}
```

### 3.5 Adaptação na tabela `core.lead_qualification`

**Abordagem: não alterar a tabela existente.** Os campos mapeáveis (`mapToColumn`) continuam sendo salvos diretamente nas colunas existentes. Campos customizados sem mapeamento são salvos no campo JSONB `custom_fields`.

```sql
-- Adicionar coluna para campos dinâmicos
ALTER TABLE core.lead_qualification 
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Adicionar referência à versão do formulário usado
ALTER TABLE core.lead_qualification 
  ADD COLUMN IF NOT EXISTS form_config_id UUID REFERENCES core.briefing_form_configs(id);
```

O `custom_fields` armazena:
```jsonc
{
  "campo_customizado_1": "valor",
  "campo_customizado_2": ["tag1", "tag2"],
  "campo_personalizado_xyz": "2026-04-15"
}
```

### 3.6 Link com work_orders

Cada work order pode opcionalmente apontar para uma config específica:

```sql
ALTER TABLE core.work_orders 
  ADD COLUMN IF NOT EXISTS form_config_id UUID REFERENCES core.briefing_form_configs(id);
```

Se não definido, usa a config ativa (`is_active = true`) do tenant.

---

## 4. API Endpoints (NestJS)

### 4.1 Módulo: `settings/briefing-form`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `GET` | `/settings/briefing-form` | Lista todas as configs do tenant | admin/manager |
| `GET` | `/settings/briefing-form/:id` | Detalhe de uma config | admin/manager |
| `POST` | `/settings/briefing-form` | Criar nova config (rascunho) | admin/manager |
| `PUT` | `/settings/briefing-form/:id` | Atualizar config (rascunho) | admin/manager |
| `POST` | `/settings/briefing-form/:id/publish` | Publicar config (ativa) | admin |
| `DELETE` | `/settings/briefing-form/:id` | Excluir rascunho | admin |
| `POST` | `/settings/briefing-form/:id/duplicate` | Duplicar config | admin/manager |
| `GET` | `/settings/briefing-form/templates` | Templates pré-prontos | admin/manager |

### 4.2 Endpoint público (briefing-form app)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/briefing/:token/schema` | Retorna a config ativa para o formulário renderizar |

Retorna:
```jsonc
{
  "formConfigId": "uuid",
  "version": 3,
  "steps": [ /* array completo de steps + fields */ ],
  "settings": { /* tema, comportamento */ },
  "prefill": {
    "fullName": "Nome do Lead",
    "email": "lead@email.com"
  }
}
```

### 4.3 Adaptação do submit

O `POST /briefing/submit` passa a:
1. Receber `formConfigId` no payload
2. Mapear campos com `mapToColumn` para as colunas existentes
3. Salvar campos sem mapeamento em `custom_fields` JSONB
4. Validar server-side usando a config (required, minLength, etc.)

---

## 5. Dashboard — Página de Configurações

### 5.1 Nova seção na SettingsPage

**Rota:** `/settings/briefing-form` (subrota de settings)

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│  Configurações > Formulário de Briefing               │
│                                                        │
│  ┌─────────────────┐  ┌──────────────────────────────┐│
│  │ Lista de Forms   │  │  Editor do Form Selecionado  ││
│  │                  │  │                              ││
│  │ • Briefing v3 ✅ │  │  [Step Tabs: 1  2  3  4  +] ││
│  │ • Rascunho v4    │  │                              ││
│  │                  │  │  ┌───────────────────────┐   ││
│  │ [+ Novo Form]    │  │  │ Field Card (drag)     │   ││
│  │ [📋 Templates]   │  │  │  Label: Nome completo │   ││
│  │                  │  │  │  Type: text  Required ✓│   ││
│  │                  │  │  │  [Editar] [Excluir]   │   ││
│  │                  │  │  └───────────────────────┘   ││
│  │                  │  │  ┌───────────────────────┐   ││
│  │                  │  │  │ Field Card (drag)     │   ││
│  │                  │  │  │  Label: E-mail        │   ││
│  │                  │  │  │  Type: email  Required✓│   ││
│  │                  │  │  └───────────────────────┘   ││
│  │                  │  │                              ││
│  │                  │  │  [+ Adicionar Campo]         ││
│  │                  │  │                              ││
│  │                  │  │  ┌──────────────────────────┐││
│  │                  │  │  │ Preview (ao vivo)        │││
│  │                  │  │  └──────────────────────────┘││
│  │                  │  │                              ││
│  │                  │  │  [Salvar] [Publicar]         ││
│  └─────────────────┘  └──────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### 5.2 Componentes do Form Builder (Dashboard)

| Componente | Descrição |
|-----------|-----------|
| `BriefingFormBuilder` | Container principal — carrega config, gerencia state |
| `StepManager` | Tabs de steps com reordenação (drag) e add/remove |
| `FieldList` | Lista de campos do step ativo, drag-and-drop para reordenar |
| `FieldCard` | Card de cada campo — mostra label, tipo, ícone, badge required |
| `FieldEditor` | Modal/panel para editar campo — label (i18n), tipo, validação, opções |
| `FieldTypePicker` | Grid de tipos disponíveis para adicionar novo campo |
| `FormPreviewPanel` | Renderiza preview do formulário em tempo real (iframe ou inline) |
| `FormSettingsPanel` | Configura tema, comportamento, integrações |
| `FormVersionList` | Lista lateral com versões + status (rascunho/publicado) |
| `TemplatesPicker` | Modal com templates pré-prontos (imobiliário, evento, product launch) |

### 5.3 Interações

| Ação | Comportamento |
|------|--------------|
| Arrastar step | Reordena as etapas |
| Arrastar campo | Reordena campos dentro do step |
| Clicar "+" no step | Abre modal com tipos de campo para escolher |
| Clicar campo | Abre FieldEditor lateral com todas as configurações |
| Clicar "Preview" | Alterna para visualização do formulário renderizado |
| Clicar "Salvar" | Salva como rascunho (PUT) |
| Clicar "Publicar" | Salva + ativa (POST publish) — desativa versões anteriores |
| Clicar "Duplicar" | Cria cópia da config para editar |

---

## 6. Briefing Form — Renderização Dinâmica

### 6.1 Refatoração do `briefing-form` app

O app atualmente renderiza steps fixos (`PropertyInfoStep`, `VisualIdentityStep`, etc.). A refatoração substitui por:

```
BriefingForm (orquestrador)
  └─ DynamicStep (por step da config)
       └─ DynamicField (por field do step)
            └─ Componente específico por field.type
```

### 6.2 Componente `DynamicField`

```tsx
function DynamicField({ field, form }: { field: FieldConfig; form: UseFormReturn }) {
  switch (field.type) {
    case 'text':      return <TextInput field={field} />;
    case 'textarea':  return <TextareaInput field={field} />;
    case 'email':     return <EmailInput field={field} />;
    case 'tel':       return <TelInput field={field} />;
    case 'select':    return <SelectInput field={field} />;
    case 'radio':     return <RadioInput field={field} />;
    case 'chips':     return <ChipInput field={field} />;
    case 'color-picker': return <ColorPickerInput field={field} />;
    // ... etc
  }
}
```

### 6.3 Validação Dinâmica

O Zod schema é gerado em runtime a partir da config:

```ts
function buildStepSchema(fields: FieldConfig[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    let schema = getBaseSchema(field.type); // z.string(), z.array(), etc.
    if (field.validation?.minLength) schema = schema.min(field.validation.minLength);
    if (field.validation?.maxLength) schema = schema.max(field.validation.maxLength);
    if (!field.required) schema = schema.optional();
    shape[field.id] = schema;
  }
  return z.object(shape);
}
```

### 6.4 Retrocompatibilidade

- O endpoint `GET /briefing/:token` continua funcionando
- Se **não** houver `briefing_form_configs` ativa, renderiza o formulário legado (hardcoded)
- Quando a empresa publica uma config, o formulário usa a versão dinâmica
- Migração gradual — sem breaking change

---

## 7. Templates Pré-Prontos

Oferecer templates iniciais que a empresa pode usar como ponto de partida:

| Template | Steps | Campos |
|----------|-------|--------|
| **Imobiliário (padrão atual)** | Contato + Empreendimento → Identidade Visual → Direção Criativa → Info Comercial → Extras | Os mesmos ~25 campos existentes |
| **Evento / Institucional** | Contato → Sobre o Evento → Identidade Visual → Logística → Extras | Data, local, público esperado, palestrantes |
| **Product Launch** | Contato → Sobre o Produto → Público-alvo → Materiais → Prazo | Features, diferenciais, concorrentes |
| **Genérico** | Contato → Detalhes do Projeto → Referências → Extras | Campos mínimos |

---

## 8. Fases de Implementação

### Fase 1 — Database + API (Fundação)
**Estimativa de complexidade: Média**

- [ ] Criar schema Drizzle `briefing_form_configs`
- [ ] Adicionar coluna `custom_fields` JSONB em `lead_qualification`
- [ ] Adicionar coluna `form_config_id` em `lead_qualification` e `work_orders`
- [ ] Criar módulo NestJS `settings/briefing-form` (CRUD + publish)
- [ ] Criar endpoint público `GET /briefing/:token/schema`
- [ ] Adaptar `POST /briefing/submit` para config dinâmica
- [ ] Seed com template "Imobiliário" (config atual hardcoded)
- [ ] Testes da API

### Fase 2 — Dashboard Form Builder (UI)
**Estimativa de complexidade: Alta**

- [ ] Criar rota `/settings/briefing-form` no dashboard
- [ ] Componente `FormVersionList` (sidebar com configs)
- [ ] Componente `StepManager` (tabs + add/remove/reorder steps)
- [ ] Componente `FieldList` (campos do step com drag-and-drop)
- [ ] Componente `FieldCard` (display do campo com ações)
- [ ] Componente `FieldEditor` (modal de edição completo)
- [ ] Componente `FieldTypePicker` (grid de tipos para adicionar)
- [ ] Componente `FormSettingsPanel` (tema, comportamento, integrações)
- [ ] Integração com API (React Query hooks)
- [ ] Ação de publicar + feedback visual

### Fase 3 — Renderização Dinâmica (Briefing Form)
**Estimativa de complexidade: Alta**

- [ ] Componente `DynamicStep` (renderiza fields da config)
- [ ] Componente `DynamicField` (switch por type)
- [ ] Input components para cada tipo (16 tipos)
- [ ] Gerador de Zod schema em runtime
- [ ] Fallback para formulário legado (sem config)
- [ ] Suporte a i18n dinâmico (labels da config)
- [ ] Suporte a campos condicionais (`conditionalOn`)
- [ ] Testes com múltiplas configs

### Fase 4 — Preview + Templates + Polish
**Estimativa de complexidade: Média**

- [ ] Preview ao vivo no dashboard (iframe ou inline)
- [ ] Templates pré-prontos (4 templates)
- [ ] Duplicar config
- [ ] Versionamento visual (histórico)
- [ ] Drag-and-drop entre steps (mover campo de um step para outro)
- [ ] Export/import de config (JSON)

---

## 9. Tipos TypeScript (packages/types)

### Novos types em `packages/types/src/dto/briefing-form-config.dto.ts`

```ts
// Tipos de campo suportados
export type FieldType =
  | 'text' | 'textarea' | 'email' | 'tel' | 'number' | 'date' | 'url'
  | 'select' | 'multi-select' | 'radio' | 'chips'
  | 'color-picker' | 'url-list' | 'file-upload'
  | 'checkbox' | 'heading' | 'divider';

// Texto internacionalizado
export interface I18nText {
  'pt-BR': string;
  en?: string;
  es?: string;
}

// Validação de campo
export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;        // Para number
  max?: number;
  pattern?: string;    // Regex
  minItems?: number;   // Para arrays (chips, multi-select)
  maxItems?: number;
}

// Opção para select/radio/multi-select
export interface FieldOption {
  value: string;
  label: I18nText;
}

// Condição para exibição condicional
export interface FieldCondition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_empty';
  value?: string;
}

// Configuração de um campo
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
  mapToColumn?: string;  // Nome da coluna em lead_qualification
}

// Configuração de uma etapa
export interface StepConfig {
  id: string;
  label: I18nText;
  icon?: string;
  order: number;
  fields: FieldConfig[];
}

// Configurações gerais do formulário
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
  };
}

// Config completa
export interface BriefingFormConfig {
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
  publishedAt?: string;
}

// Response do endpoint público /briefing/:token/schema
export interface BriefingFormSchema {
  formConfigId: string;
  version: number;
  steps: StepConfig[];
  settings: FormSettings;
  prefill: Record<string, unknown>;
}

// DTOs de criação/atualização
export interface CreateBriefingFormConfigDto {
  name: string;
  steps: StepConfig[];
  settings?: FormSettings;
}

export interface UpdateBriefingFormConfigDto {
  name?: string;
  steps?: StepConfig[];
  settings?: FormSettings;
}
```

---

## 10. Colunas mapeáveis (`mapToColumn`)

Campos da config que podem ser mapeados diretamente às colunas existentes de `lead_qualification`:

| Coluna | Tipo Sugerido | Descrição |
|--------|--------------|-----------|
| `full_name` | text | Nome completo |
| `email` | email | E-mail |
| `phone_number` | tel | Telefone |
| `instagram_personal` | text | Instagram pessoal |
| `instagram_company` | text | Instagram empresa |
| `linkedin_url` | url | LinkedIn |
| `website_url` | url | Website |
| `company_name` | text | Nome da empresa |
| `company_size` | select | Porte da empresa |
| `industry` | text | Segmento |
| `role_in_company` | text | Cargo |
| `property_name` | text | Nome do empreendimento |
| `property_address` | text | Endereço |
| `property_units` | text | Unidades |
| `property_unit_sizes` | text | Metragens |
| `property_differentials` | chips | Diferenciais |
| `brand_colors` | color-picker | Cores da marca |
| `communication_tone` | select | Tom de comunicação |
| `visual_references` | url-list | Referências visuais |
| `target_audience` | radio | Público-alvo |
| `main_emotion` | radio | Emoção principal |
| `mandatory_elements` | chips | Elementos obrigatórios |
| `elements_to_avoid` | chips | Elementos a evitar |
| `price_range` | text | Faixa de preço |
| `payment_conditions` | text | Condições de pagamento |
| `launch_date` | date | Data de lançamento |
| `realtor_contact` | text | Contato do corretor |
| `voiceover_text` | textarea | Texto para locução |
| `music_preference` | text | Preferência musical |
| `legal_disclaimers` | textarea | Avisos legais |
| `additional_notes` | textarea | Observações |
| `how_found_us` | select | Como nos encontrou |
| `budget_range` | text | Faixa de orçamento |
| `project_type` | text | Tipo de projeto |
| `project_goal` | textarea | Objetivo |
| `project_description` | textarea | Descrição |
| `deadline` | date | Prazo |

Campos que **não** estão nessa lista são salvos no `custom_fields` JSONB.

---

## 11. Prioridade de Implementação

```
 FASE 1 ──────────────────────────── FASE 2 ──────────────────── FASE 3 ──────── FASE 4
 Database Schema                     Dashboard Builder UI        Dynamic Form     Polish
 API CRUD + Publish                  Step Manager                DynamicStep      Preview
 Seed template imobiliário           Field Editor                DynamicField     Templates
 Endpoint /schema público            Drag-and-drop               Zod runtime      Export
 Submit adaptado                     Publish action              i18n dinâmico    Versioning
 ─────────────────────────────────── ──────────────────────────── ──────────────── ────────
 Fundação (nada funciona sem isso)   UX do admin                 UX do cliente    Nice to have
```

---

## 12. Riscos e Decisões

| Risco/Decisão | Abordagem |
|---------------|-----------|
| **Performance JSONB** | Config é carregada 1x no load do form — não há queries frequentes. OK para JSONB. |
| **Validação server-side** | Obrigatória. Replicar a lógica do Zod schema builder no NestJS (class-validator dinâmico ou validação manual). |
| **Migração de dados** | Formulários já submetidos permanecem inalterados. A coluna `form_config_id` é nullable. |
| **Drag-and-drop lib** | Usar `@dnd-kit/core` + `@dnd-kit/sortable` (já popular, leve, React 18 compatível). |
| **i18n labels** | Cada campo tem label em pt-BR (obrigatório), en e es (opcionais). O form usa o idioma do i18next. |
| **Campo condicional** | Fase 3. O `conditionalOn` é avaliado client-side com `watch()` do react-hook-form. |

---

## 13. Resumo de Arquivos a Criar/Editar

### Novos arquivos

| Caminho | Descrição |
|---------|-----------|
| `packages/database/src/schema/briefing-form-configs.ts` | Schema Drizzle |
| `packages/types/src/dto/briefing-form-config.dto.ts` | Types compartilhados |
| `apps/api/src/modules/settings/` | Módulo NestJS (controller, service, module, DTOs) |
| `apps/dashboard/src/pages/BriefingFormBuilderPage.tsx` | Página do builder |
| `apps/dashboard/src/components/form-builder/` | ~10 componentes do builder |
| `apps/dashboard/src/hooks/use-briefing-form-config.ts` | React Query hooks |
| `apps/briefing-form/src/components/dynamic/` | DynamicStep, DynamicField, inputs |
| `apps/briefing-form/src/utils/build-schema.ts` | Gerador de Zod schema runtime |

### Arquivos editados

| Caminho | Alteração |
|---------|-----------|
| `packages/database/src/schema/index.ts` | Exportar nova tabela |
| `packages/database/src/schema/lead-qualification.ts` | Adicionar `custom_fields`, `form_config_id` |
| `packages/database/src/schema/work-orders.ts` | Adicionar `form_config_id` |
| `packages/types/src/index.ts` | Exportar novos DTOs |
| `apps/api/src/app.module.ts` | Registrar módulo settings |
| `apps/api/src/modules/briefing/briefing.service.ts` | Adaptar submit para config dinâmica |
| `apps/api/src/modules/briefing/briefing.controller.ts` | Endpoint `/briefing/:token/schema` |
| `apps/dashboard/src/App.tsx` | Nova rota `/settings/briefing-form` |
| `apps/dashboard/src/components/layouts/DashboardLayout.tsx` | Link na sidebar |
| `apps/dashboard/src/services/api.ts` | Métodos de API para briefing-form-config |
| `apps/briefing-form/src/components/BriefingForm/BriefingForm.tsx` | Condicional: legado vs dinâmico |
| `apps/briefing-form/src/hooks/use-briefing-form.ts` | Carregar schema da API |
