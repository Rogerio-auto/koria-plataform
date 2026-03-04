# KorIA Platform — Documentação do Banco de Dados

## 1. Visão Geral

- **SGBD:** PostgreSQL 15+
- **Schema:** `core`
- **Extensão:** `pgcrypto` (para `gen_random_uuid()`)
- **Multi-tenant:** Sim (atualmente 1 tenant ativo: KorIA)
- **Tenant ID:** `a9081890-d60f-4d91-ab05-c1407302a4c9`

---

## 2. Diagrama ER (Simplificado)

```
┌──────────┐       ┌──────────────┐       ┌──────────────┐
│ tenants  │──┐    │    leads     │──────▶│contact_points│
└──────────┘  │    └──────┬───────┘       └──────────────┘
              │           │
              │    ┌──────▼───────┐       ┌──────────────┐
              │    │ lead_stage   │◀─────▶│   stages     │
              │    └──────────────┘       └──────┬───────┘
              │                                  │
              │                           ┌──────▼───────┐
              │                           │  pipelines   │
              │                           └──────────────┘
              │
              │    ┌──────────────────┐
              ├───▶│lead_qualification│
              │    └──────────────────┘
              │
              │    ┌──────────────┐       ┌──────────────┐
              ├───▶│conversations │──────▶│  messages    │
              │    └──────────────┘       └──────────────┘
              │
              │    ┌──────────────┐       ┌──────────────┐
              ├───▶│   quotes     │──────▶│ quote_items  │
              │    └──────┬───────┘       └──────┬───────┘
              │           │                      │
              │    ┌──────▼───────┐       ┌──────▼───────┐
              ├───▶│payment_intents│      │  products    │
              │    └──────┬───────┘       └──────┬───────┘
              │           │                      │
              │    ┌──────▼───────┐       ┌──────▼───────┐
              │    │payment_events│       │product_prices│
              │    └──────────────┘       └──────────────┘
              │
              │    ┌──────────────┐       ┌──────────────────┐
              ├───▶│ work_orders  │──────▶│work_order_assets │
              │    └──────┬───────┘       └──────────────────┘
              │           │
              │    ┌──────▼───────┐
              │    │  approvals   │
              │    └──────────────┘
              │
              │    ┌──────────────┐       ┌──────────────┐
              ├───▶│    tags      │◀─────▶│  lead_tags   │
              │    └──────────────┘       └──────────────┘
              │
              │    ┌────────────────┐     ┌──────────────┐
              ├───▶│followup_rules │────▶│followup_queue│
              │    └────────────────┘     └──────────────┘
              │
              │    ┌──────────────┐
              ├───▶│   events     │  ← Event Store (auditoria)
              │    └──────────────┘
              │
              │    ┌──────────────┐
              ├───▶│   ai_runs    │  ← Observabilidade IA
              │    └──────────────┘
              │
              │    ┌──────────────┐
              └───▶│   errors     │  ← Log de erros
                   └──────────────┘
```

---

## 3. ENUMs Disponíveis

| Enum | Valores | Uso |
|------|---------|-----|
| `core.lead_type` | `person`, `company` | Tipo do lead |
| `core.channel_type` | `whatsapp`, `instagram`, `messenger`, `email` | Canal de comunicação |
| `core.conversation_state` | `open`, `pending`, `closed` | Estado da conversa |
| `core.lead_status` | `active`, `archived`, `blocked` | Status do lead |
| `core.quote_status` | `draft`, `sent`, `accepted`, `rejected`, `expired` | Status do orçamento |
| `core.payment_provider` | `stripe`, `wise` | Provedor de pagamento |
| `core.payment_status` | `pending`, `paid`, `failed`, `canceled` | Status do pagamento |
| `core.work_order_status` | `created`, `in_progress`, `preview_sent`, `changes_requested`, `approved`, `delivered`, `canceled` | Status da OS |
| `core.followup_status` | `scheduled`, `sent`, `canceled`, `failed` | Status do follow-up |
| `core.message_direction` | `in`, `out` | Direção da mensagem |
| `core.message_type` | `text`, `template`, `media` | Tipo da mensagem |
| `core.template_category` | `marketing`, `utility`, `auth` | Categoria do template WhatsApp |
| `core.event_entity_type` | `lead`, `conversation`, `quote`, `payment_intent`, `work_order` | Tipo da entidade no event store |
| `core.lead_qualification_status` | `pending`, `sent`, `completed` | Status do formulário de qualificação |

---

## 4. Tabelas

### 4.1. `core.tenants` — Tenants (Multi-tenant)

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `name` | text | NOT NULL | — | Nome do tenant |
| `timezone` | text | NOT NULL | `'America/Porto_Velho'` | Fuso horário |
| `created_at` | timestamptz | NOT NULL | `now()` | Data de criação |

---

### 4.2. `core.leads` — Leads / Contatos

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `type` | lead_type | NOT NULL | `'person'` | Tipo (person/company) |
| `display_name` | text | NULL | — | Nome de exibição |
| `preferred_language` | text | NULL | — | Idioma (ex: 'pt-BR') |
| `country_code` | text | NULL | — | País ISO2 (ex: 'BR') |
| `vip_level` | smallint | NOT NULL | `0` | 0=normal, 1=vip, 2=super |
| `score` | smallint | NOT NULL | `0` | Score 0..100 |
| `status` | lead_status | NOT NULL | `'active'` | Status do lead |
| `created_at` | timestamptz | NOT NULL | `now()` | — |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |

**Índices:** `(tenant_id, created_at DESC)`, `(tenant_id, score DESC)`, `(tenant_id, status)`
**Trigger:** `trg_leads_updated_at` → auto-update `updated_at`

---

### 4.3. `core.contact_points` — Pontos de Contato

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `lead_id` | uuid | NOT NULL | — | FK → leads (CASCADE) |
| `channel` | channel_type | NOT NULL | — | Canal (whatsapp, email, etc.) |
| `handle` | text | NOT NULL | — | Identificador (+55..., @user, email) |
| `is_primary` | boolean | NOT NULL | `false` | Se é o contato principal |
| `metadata` | jsonb | NOT NULL | `'{}'` | Dados extras |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

**Unique:** `(tenant_id, channel, handle)` — evita duplicar mesmo handle/canal por tenant

---

### 4.4. `core.lead_qualification` — Dados de Qualificação do Lead

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `lead_id` | uuid | NOT NULL | — | FK → leads (UNIQUE, CASCADE) |
| `status` | lead_qualification_status | NOT NULL | `'pending'` | Status do formulário |
| `form_sent_at` | timestamptz | NULL | — | Quando o form foi enviado |
| `form_sent_count` | integer | NULL | `0` | Quantas vezes foi enviado |
| `full_name` | text | NULL | — | Nome completo |
| `email` | text | NULL | — | Email |
| `phone_number` | text | NULL | — | Telefone |
| `instagram_personal` | text | NULL | — | Instagram pessoal |
| `instagram_company` | text | NULL | — | Instagram empresa |
| `linkedin_url` | text | NULL | — | LinkedIn |
| `website_url` | text | NULL | — | Website |
| `company_name` | text | NULL | — | Nome da empresa |
| `company_size` | text | NULL | — | Tamanho da empresa |
| `industry` | text | NULL | — | Indústria |
| `role_in_company` | text | NULL | — | Cargo |
| `project_type` | text | NULL | — | Tipo do projeto |
| `project_goal` | text | NULL | — | Objetivo do projeto |
| `project_description` | text | NULL | — | Descrição do projeto |
| `deadline` | text | NULL | — | Prazo |
| `budget_range` | text | NULL | — | Faixa de orçamento |
| `references_urls` | text[] | NULL | — | URLs de referência visual |
| `how_found_us` | text | NULL | — | Como nos encontrou |
| `additional_notes` | text | NULL | — | Notas extras |
| `form_id` | text | NULL | — | ID do formulário |
| `form_response_id` | text | NULL | — | ID da resposta |
| `form_url` | text | NULL | — | URL do formulário |
| `submitted_at` | timestamptz | NULL | — | Quando foi enviado pelo cliente |
| `ip_address` | text | NULL | — | IP do cliente |
| `user_agent` | text | NULL | — | User-Agent |
| `created_at` | timestamptz | NOT NULL | `now()` | — |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |
| `completed_at` | timestamptz | NULL | — | Quando foi completado |

**Unique:** `lead_id` — um lead só pode ter uma qualificação
**Triggers:** `trg_lead_qualification_updated` → updated_at; `trg_sync_lead_from_qualification` → sincroniza lead

---

### 4.5. `core.pipelines` — Pipelines de Vendas

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `name` | text | NOT NULL | — | Nome do pipeline |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

**Unique:** `(tenant_id, name)`

---

### 4.6. `core.stages` — Estágios do Funil

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `pipeline_id` | uuid | NOT NULL | — | FK → pipelines (CASCADE) |
| `name` | text | NOT NULL | — | Nome de exibição |
| `code` | text | NOT NULL | — | Código slug (ex: 'new_lead') |
| `position` | integer | NOT NULL | `0` | Ordem no pipeline |
| `is_terminal` | boolean | NOT NULL | `false` | Se é estado final |

**Unique:** `(pipeline_id, code)`

**Stages padrão (default_sales):**

| Nome | Código | Posição | Terminal |
|------|--------|---------|----------|
| New lead | `new_lead` | 10 | Não |
| Qualifying | `qualifying` | 20 | Não |
| Briefing received | `briefing_received` | 30 | Não |
| Proposal sent | `proposal_sent` | 40 | Não |
| Negotiation | `negotiation` | 50 | Não |
| Payment pending | `payment_pending` | 60 | Não |
| Paid | `paid` | 70 | Não |
| Lost | `lost` | 80 | Sim |
| Archived | `archived` | 90 | Sim |

---

### 4.7. `core.lead_stage` — Posição do Lead no Funil

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `lead_id` | uuid | NOT NULL | — | FK → leads (CASCADE) |
| `pipeline_id` | uuid | NOT NULL | — | FK → pipelines (CASCADE) |
| `stage_id` | uuid | NOT NULL | — | FK → stages |
| `entered_at` | timestamptz | NOT NULL | `now()` | Quando entrou no stage |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |

**PK:** `(lead_id, pipeline_id)` — um lead está em um stage por pipeline
**Trigger:** `trg_lead_stage_events` → registra eventos automaticamente no event store

---

### 4.8. `core.tags` — Tags

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `name` | text | NOT NULL | — | Nome da tag |
| `color` | text | NULL | — | Cor (hex) |

**Unique:** `(tenant_id, name)`

---

### 4.9. `core.lead_tags` — Associação Lead ↔ Tag

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `lead_id` | uuid | NOT NULL | — | FK → leads (CASCADE) |
| `tag_id` | uuid | NOT NULL | — | FK → tags (CASCADE) |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

**PK:** `(lead_id, tag_id)`

---

### 4.10. `core.conversations` — Conversas

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `lead_id` | uuid | NOT NULL | — | FK → leads (CASCADE) |
| `channel` | channel_type | NOT NULL | — | Canal da conversa |
| `external_thread_id` | text | NULL | — | ID do Chatwoot |
| `state` | conversation_state | NOT NULL | `'open'` | Estado |
| `assigned_to` | text | NULL | — | Responsável |
| `last_message_at` | timestamptz | NULL | — | Última mensagem |
| `created_at` | timestamptz | NOT NULL | `now()` | — |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |

---

### 4.11. `core.messages` — Mensagens

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `conversation_id` | uuid | NOT NULL | — | FK → conversations (CASCADE) |
| `lead_id` | uuid | NOT NULL | — | FK → leads (CASCADE) |
| `direction` | message_direction | NOT NULL | — | in/out |
| `channel` | channel_type | NOT NULL | — | Canal |
| `provider_message_id` | text | NULL | — | ID do provider |
| `message_type` | message_type | NOT NULL | `'text'` | Tipo |
| `template_category` | template_category | NULL | — | Categoria se template |
| `wa_conversation_id` | text | NULL | — | WhatsApp conversation ID |
| `cost_amount` | numeric(12,4) | NULL | — | Custo da mensagem |
| `cost_currency` | text | NOT NULL | `'BRL'` | Moeda do custo |
| `content` | text | NULL | — | Conteúdo (removível por LGPD) |
| `metadata` | jsonb | NOT NULL | `'{}'` | Dados extras |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

---

### 4.12. `core.products` — Produtos / Pacotes

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `name` | text | NOT NULL | — | Nome do produto |
| `category` | text | NULL | — | Categoria (pacote, addon) |
| `default_currency` | text | NOT NULL | `'BRL'` | Moeda padrão |
| `metadata` | jsonb | NOT NULL | `'{}'` | Dados extras |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

---

### 4.13. `core.product_prices` — Preços por Moeda

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `product_id` | uuid | NOT NULL | — | FK → products (CASCADE) |
| `currency` | text | NOT NULL | — | Moeda (BRL, USD, EUR) |
| `price_amount` | numeric(12,2) | NOT NULL | — | Valor |
| `is_default` | boolean | NOT NULL | `false` | Se é preço padrão |
| `created_at` | timestamptz | NOT NULL | `now()` | — |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |

**Unique:** `(product_id, currency)`

---

### 4.14. `core.quotes` — Orçamentos

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `lead_id` | uuid | NOT NULL | — | FK → leads (CASCADE) |
| `conversation_id` | uuid | NULL | — | FK → conversations |
| `status` | quote_status | NOT NULL | `'draft'` | Status |
| `currency` | text | NOT NULL | `'BRL'` | Moeda |
| `subtotal` | numeric(12,2) | NOT NULL | `0` | Subtotal |
| `discount` | numeric(12,2) | NOT NULL | `0` | Desconto |
| `total` | numeric(12,2) | NOT NULL | `0` | Total |
| `valid_until` | timestamptz | NULL | — | Validade |
| `created_at` | timestamptz | NOT NULL | `now()` | — |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |

---

### 4.15. `core.quote_items` — Itens do Orçamento

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `quote_id` | uuid | NOT NULL | — | FK → quotes (CASCADE) |
| `product_id` | uuid | NULL | — | FK → products (SET NULL) |
| `qty` | integer | NOT NULL | `1` | Quantidade |
| `unit_price` | numeric(12,2) | NOT NULL | `0` | Preço unitário |
| `total` | numeric(12,2) | NOT NULL | `0` | Total do item |
| `metadata` | jsonb | NOT NULL | `'{}'` | Dados extras |

---

### 4.16. `core.payment_intents` — Intenções de Pagamento

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `lead_id` | uuid | NOT NULL | — | FK → leads (CASCADE) |
| `quote_id` | uuid | NULL | — | FK → quotes |
| `provider` | payment_provider | NOT NULL | — | Stripe ou Wise |
| `status` | payment_status | NOT NULL | `'pending'` | Status |
| `amount` | numeric(12,2) | NOT NULL | `0` | Valor |
| `currency` | text | NOT NULL | `'BRL'` | Moeda |
| `provider_ref` | text | NULL | — | ID externo (Stripe/Wise) |
| `pay_url` | text | NULL | — | Link de pagamento |
| `created_at` | timestamptz | NOT NULL | `now()` | — |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |

**Trigger:** `trg_payment_intents_events` → registra eventos automaticamente

---

### 4.17. `core.payment_events` — Eventos de Pagamento

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `payment_intent_id` | uuid | NOT NULL | — | FK → payment_intents (CASCADE) |
| `type` | text | NOT NULL | — | Tipo (webhook_received, confirmed, etc.) |
| `payload` | jsonb | NOT NULL | `'{}'` | Dados do evento |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

---

### 4.18. `core.work_orders` — Ordens de Serviço

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `lead_id` | uuid | NOT NULL | — | FK → leads (CASCADE) |
| `quote_id` | uuid | NULL | — | FK → quotes |
| `payment_intent_id` | uuid | NULL | — | FK → payment_intents |
| `status` | work_order_status | NOT NULL | `'created'` | Status da OS |
| `due_at` | timestamptz | NULL | — | Data de entrega |
| `external_task_id` | text | NULL | — | ClickUp Task ID |
| `briefing` | jsonb | NOT NULL | `'{}'` | Dados do briefing |
| `upload_token` | text | NULL | — | Token único para portal de upload |
| `created_at` | timestamptz | NOT NULL | `now()` | — |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |

**Unique:** `upload_token`
**Trigger:** `trg_work_orders_events` → registra eventos automaticamente

---

### 4.19. `core.work_order_assets` — Assets da OS

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `work_order_id` | uuid | NOT NULL | — | FK → work_orders (CASCADE) |
| `type` | text | NOT NULL | — | Tipo (pdf, image, video, link) |
| `url` | text | NOT NULL | — | URL do arquivo |
| `metadata` | jsonb | NOT NULL | `'{}'` | Dados extras (nome, tamanho, etc.) |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

---

### 4.20. `core.approvals` — Aprovações de Prévia

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `work_order_id` | uuid | NOT NULL | — | FK → work_orders (CASCADE) |
| `status` | text | NOT NULL | `'pending'` | pending / approved / rejected |
| `notes` | text | NULL | — | Observações |
| `created_at` | timestamptz | NOT NULL | `now()` | — |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |

---

### 4.21. `core.followup_rules` — Regras de Cadência

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `trigger_stage_id` | uuid | NOT NULL | — | FK → stages |
| `delay_minutes` | integer | NOT NULL | — | Atraso em minutos |
| `channel` | channel_type | NOT NULL | — | Canal do follow-up |
| `template_name` | text | NULL | — | Template WhatsApp (se fora da janela) |
| `active` | boolean | NOT NULL | `true` | Se está ativo |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

---

### 4.22. `core.followup_queue` — Fila de Follow-ups

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `lead_id` | uuid | NOT NULL | — | FK → leads (CASCADE) |
| `conversation_id` | uuid | NULL | — | FK → conversations |
| `rule_id` | uuid | NOT NULL | — | FK → followup_rules (CASCADE) |
| `scheduled_at` | timestamptz | NOT NULL | — | Quando disparar |
| `status` | followup_status | NOT NULL | `'scheduled'` | Status |
| `attempts` | integer | NOT NULL | `0` | Tentativas |
| `last_error` | text | NULL | — | Último erro |
| `created_at` | timestamptz | NOT NULL | `now()` | — |
| `updated_at` | timestamptz | NOT NULL | `now()` | Via trigger |

---

### 4.23. `core.events` — Event Store (Auditoria)

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `entity_type` | event_entity_type | NOT NULL | — | Tipo da entidade |
| `entity_id` | uuid | NOT NULL | — | ID da entidade |
| `event_type` | text | NOT NULL | — | Ex: 'lead.stage_changed' |
| `source` | text | NOT NULL | `'n8n'` | Origem (chatwoot, meta, stripe, db, etc.) |
| `payload` | jsonb | NOT NULL | `'{}'` | Dados do evento |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

---

### 4.24. `core.ai_runs` — Execuções de IA

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `conversation_id` | uuid | NULL | — | FK → conversations |
| `lead_id` | uuid | NULL | — | FK → leads |
| `agent` | text | NOT NULL | — | Agente (sdr, qualifier, followup, analytics) |
| `model` | text | NULL | — | Modelo de IA usado |
| `input_tokens` | integer | NULL | — | Tokens de entrada |
| `output_tokens` | integer | NULL | — | Tokens de saída |
| `cost_amount` | numeric(12,6) | NULL | — | Custo |
| `cost_currency` | text | NOT NULL | `'USD'` | Moeda do custo |
| `status` | text | NOT NULL | `'ok'` | ok ou error |
| `latency_ms` | integer | NULL | — | Latência em ms |
| `payload` | jsonb | NOT NULL | `'{}'` | Dados extras |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

---

### 4.25. `core.errors` — Log de Erros

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `tenant_id` | uuid | NOT NULL | — | FK → tenants |
| `context` | text | NOT NULL | — | Contexto (n8n, chatwoot, meta, payments, agent) |
| `entity_type` | text | NULL | — | Tipo da entidade (opcional) |
| `entity_id` | uuid | NULL | — | ID da entidade (opcional) |
| `error_message` | text | NOT NULL | — | Mensagem de erro |
| `payload` | jsonb | NOT NULL | `'{}'` | Dados do erro |
| `created_at` | timestamptz | NOT NULL | `now()` | — |

---

## 5. Views

### 5.1. `core.vw_lead_funnel_current`

Lead + stage atual por pipeline. Utilizada no dashboard para visualizar o funil de vendas.

**Colunas:** `tenant_id`, `lead_id`, `display_name`, `country_code`, `preferred_language`, `vip_level`, `score`, `lead_status`, `pipeline_id`, `pipeline_name`, `stage_id`, `stage_code`, `stage_name`, `entered_at`, `updated_at`

**JOINs:** `leads` → `lead_stage` → `pipelines` → `stages`

### 5.2. `core.vw_work_orders`

Work orders com dados do lead. Utilizada no dashboard para acompanhar produção.

**Colunas:** `tenant_id`, `work_order_id`, `status`, `due_at`, `external_task_id`, `created_at`, `updated_at`, `lead_id`, `display_name`, `country_code`, `quote_id`, `payment_intent_id`

**JOINs:** `work_orders` → `leads`

---

## 6. Triggers Automáticos

### 6.1. `updated_at` automático

Tabelas com trigger `trg_*_updated_at` que chamam `core.set_updated_at()`:
- `leads`, `conversations`, `quotes`, `payment_intents`, `work_orders`, `approvals`, `lead_stage`, `followup_queue`, `lead_qualification`, `product_prices`

### 6.2. Event Store automático

| Trigger | Tabela | Eventos Gerados |
|---------|--------|-----------------|
| `trg_lead_stage_events` | `lead_stage` | `lead.stage_set` (INSERT), `lead.stage_changed` (UPDATE) |
| `trg_work_orders_events` | `work_orders` | `work_order.created` (INSERT), `work_order.status_changed` (UPDATE), `work_order.clickup_task_linked` (UPDATE) |
| `trg_payment_intents_events` | `payment_intents` | `payment.created` (INSERT), `payment.status_changed` (UPDATE) |

### 6.3. Sincronização de Lead

| Trigger | Tabela | Descrição |
|---------|--------|-----------|
| `trg_sync_lead_from_qualification` | `lead_qualification` | Sincroniza dados da qualificação para o lead (display_name, etc.) |

---

## 7. Produtos Cadastrados

| Nome | Categoria | BRL | USD | Código Metadata |
|------|-----------|-----|-----|-----------------|
| Pacote Essencial | pacote | R$ 1.500,00 | $300,00 | PKG_ESSENCIAL |
| Pacote Comercial | pacote | R$ 2.300,00 | $460,00 | PKG_COMERCIAL |
| Pacote Lançamento | pacote | R$ 3.000,00 | $600,00 | PKG_LANCAMENTO |
| 10 Fotos Extras 4K | addon | R$ 1.000,00 | $200,00 | ADDON_FOTOS_10 |
| 2 Animações Detalhes | addon | R$ 550,00 | $110,00 | ADDON_ANIMACOES_2 |
| 3 Hooks Curtos | addon | R$ 500,00 | $100,00 | ADDON_HOOKS_3 |
