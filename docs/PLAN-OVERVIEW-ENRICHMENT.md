# Plano de Enriquecimento — Visão Geral do Dashboard

> Documento de planejamento para implementação de métricas e widgets na OverviewPage.
> Segue a arquitetura modular NestJS (backend) + React/TanStack Query/Tailwind (frontend).

---

## Fase 1 — Ativar Endpoints Existentes Não Utilizados

Estes endpoints **já existem** no backend (`AnalyticsService`, `ObjectionsService`) e no `api.ts` do dashboard, mas **não são consumidos** na OverviewPage.

| # | Endpoint | Service Method | API Client | Widget no Dashboard |
|---|----------|---------------|------------|---------------------|
| 1.1 | `GET /analytics/ai-costs` | `analyticsService.getAiCosts()` | `dashboardApi.getAiCosts()` | Card: custo total IA + gráfico por agente |
| 1.2 | `GET /analytics/followup-rate` | `analyticsService.getFollowupConversionRate()` | `dashboardApi.getFollowupRate()` | Card: follow-ups enviados + taxa |
| 1.3 | `GET /analytics/errors` | `analyticsService.getErrors()` | `dashboardApi.getErrors()` | Card: total erros (7d) + top contextos |
| 1.4 | `GET /objections/overview` | `objectionsService.getOverview()` | `dashboardApi.getObjectionsOverview()` | Card: total objeções + taxa superação + top categorias |

### Alterações necessárias — Fase 1

#### Backend
- Nenhuma alteração. Endpoints já funcionais.

#### Frontend — `use-analytics.ts`
- Adicionar queries: `aiCosts`, `followupRate`, `errors`, `objectionsOverview`

#### Frontend — `OverviewPage.tsx`
- Adicionar seção "Operacional" abaixo dos gráficos existentes com 4 novos cards/widgets:
  - **Custos de IA**: custo total no período + mini breakdown por agente
  - **Follow-ups**: enviados no total + status placeholder (awaiting conversion tracking)
  - **Erros do Sistema**: total últimos 7 dias + contextos com mais ocorrências
  - **Objeções**: total + taxa de superação (%) + top 3 categorias

---

## Fase 2 — Novos Endpoints de Métricas Derivadas

Métricas que **não existem como endpoint** mas são **deriváveis das tabelas atuais**.

### 2.1 — Endpoint: `GET /analytics/conversion-rates`
- **Tabelas**: `leads`, `lead_qualification`, `work_orders`, `payment_intents`
- **Retorno**:
  ```json
  {
    "leadToQualified": { "total": 100, "converted": 45, "rate": 45 },
    "qualifiedToDeal": { "total": 45, "converted": 12, "rate": 26.7 },
    "dealToPaid": { "total": 12, "converted": 10, "rate": 83.3 },
    "overallConversion": 10
  }
  ```
- **Widget**: Funil de conversão com etapas e % entre cada

### 2.2 — Endpoint: `GET /analytics/average-ticket`
- **Tabelas**: `payment_intents` (status='paid')
- **Retorno**:
  ```json
  {
    "averageTicket": 8500.00,
    "totalRevenue": 85000.00,
    "totalDeals": 10,
    "currency": "BRL",
    "variation": 12
  }
  ```
- **Widget**: Card KPI com ticket médio + variação período anterior

### 2.3 — Endpoint: `GET /analytics/funnel-by-pipeline`
- **Tabelas**: `lead_stage`, `stages`, `pipelines`
- **Query params**: `?pipelineId=xxx` (opcional — se omitido, agrupa todos)
- **Retorno**:
  ```json
  {
    "pipelines": [
      {
        "id": "...", "name": "Comercial",
        "stages": [
          { "id": "...", "name": "Novo Lead", "code": "new", "position": 0, "count": 45, "percentage": 100 },
          { "id": "...", "name": "Qualificado", "code": "qualified", "position": 1, "count": 30, "percentage": 66.7 }
        ],
        "totalLeads": 45
      }
    ]
  }
  ```
- **Widget**: FunnelChart melhorado com dropdown de pipeline + percentuais entre stages

### 2.4 — Endpoint: `GET /analytics/lead-sources`
- **Tabelas**: `lead_qualification` (campo `howFoundUs`)
- **Retorno**: `Array<{ source: string; count: number; percentage: number }>`
- **Widget**: Gráfico de barras horizontais — fontes de aquisição

### 2.5 — Endpoint: `GET /analytics/channels-distribution`
- **Tabelas**: `contact_points` (campo `channel`)
- **Retorno**: `Array<{ channel: string; count: number; percentage: number }>`
- **Widget**: Gráfico de pizza/donut — WhatsApp vs Instagram vs Email vs Messenger

### 2.6 — Endpoint: `GET /analytics/quote-funnel`
- **Tabelas**: `quotes` (campo `status`)
- **Retorno**:
  ```json
  {
    "draft": 5, "sent": 8, "accepted": 12, "rejected": 3, "expired": 2,
    "acceptanceRate": 48,
    "totalValue": 120000.00
  }
  ```
- **Widget**: Mini funil de orçamentos (draft→sent→accepted) com taxa de aceitação

### 2.7 — Endpoint: `GET /analytics/work-order-status`
- **Tabelas**: `work_orders` (campo `status`)
- **Retorno**:
  ```json
  {
    "statuses": [
      { "status": "created", "count": 3 },
      { "status": "in_progress", "count": 5 },
      { "status": "preview_sent", "count": 2 },
      { "status": "approved", "count": 8 },
      { "status": "delivered", "count": 15 },
      { "status": "canceled", "count": 1 }
    ],
    "overdueCount": 2,
    "deliveryRate": 62.5
  }
  ```
- **Widget**: Barra empilhada de status + alerta de ordens atrasadas

### 2.8 — Endpoint: `GET /analytics/briefing-completion`
- **Tabelas**: `lead_qualification` (campo `status`)
- **Retorno**:
  ```json
  {
    "pending": 10, "sent": 5, "completed": 30,
    "completionRate": 66.7,
    "averageFillTime": null
  }
  ```
- **Widget**: Card com taxa de conclusão e breakdown por status

### 2.9 — Endpoint: `GET /analytics/recent-activity`
- **Tabelas**: `events` (últimos 20 eventos)
- **Retorno**: `Array<{ id, entityType, entityId, eventType, source, createdAt }>`
- **Widget**: Feed de atividade recente em formato timeline

### 2.10 — Endpoint: `GET /analytics/pipeline-performance`
- **Tabelas**: `lead_stage`, `stages`, `pipelines`, `leads`, `payment_intents`, `work_orders`
- **Query params**: `?pipelineId=xxx` (obrigatório)
- **Retorno**:
  ```json
  {
    "pipeline": { "id": "...", "name": "Comercial" },
    "totalLeads": 45,
    "conversionRate": 26.7,
    "averageTicket": 8500,
    "revenueTotal": 85000,
    "stageDistribution": [
      { "stage": "Novo", "count": 10, "avgDaysInStage": 3.2 },
      { "stage": "Qualificado", "count": 8, "avgDaysInStage": 5.1 }
    ],
    "staleLeads": 4,
    "topSources": [{ "source": "Instagram", "count": 15 }]
  }
  ```
- **Widget**: Painel completo de análise do pipeline (PipelinesPage)

---

## Fase 3 — Enriquecer a PipelinesPage com Analytics

Adicionar seção de análise em cada pipeline card na PipelinesPage:

| Widget | Dados |
|--------|-------|
| Leads por stage (contagem + %) | `funnel-by-pipeline` |
| Taxa de conversão do pipeline | `pipeline-performance` |
| Ticket médio do pipeline | `pipeline-performance` |
| Receita total do pipeline | `pipeline-performance` |
| Tempo médio em cada stage | `pipeline-performance` (avgDaysInStage) |
| Leads parados (>7d sem mover) | `pipeline-performance` (staleLeads) |
| Fontes de aquisição do pipeline | `pipeline-performance` (topSources) |

---

## Ordem de Implementação

### Passo 1 — `use-analytics.ts` + `OverviewPage.tsx`
Ativar os 4 endpoints existentes não usados. Criar cards/widgets.

### Passo 2 — `analytics.service.ts` (backend)
Implementar os 10 novos métodos no `AnalyticsService`:
1. `getConversionRates(tenantId, startDate?, endDate?)`
2. `getAverageTicket(tenantId, startDate?, endDate?)`
3. `getFunnelByPipeline(tenantId, pipelineId?)`
4. `getLeadSources(tenantId, startDate?, endDate?)`
5. `getChannelsDistribution(tenantId)`
6. `getQuoteFunnel(tenantId, startDate?, endDate?)`
7. `getWorkOrderStatus(tenantId)`
8. `getBriefingCompletion(tenantId)`
9. `getRecentActivity(tenantId, limit?)`
10. `getPipelinePerformance(tenantId, pipelineId)`

### Passo 3 — `analytics.controller.ts` (backend)
Adicionar os 10 novos endpoints `GET /analytics/*` com guards e decorators.

### Passo 4 — `api.ts` (dashboard)
Adicionar os 10 novos métodos no `dashboardApi`.

### Passo 5 — `use-analytics.ts` (dashboard)
Expandir o hook para consumir todos os novos endpoints.

### Passo 6 — Novos chart components (dashboard)
Criar componentes de gráfico reutilizáveis:
- `ConversionFunnelChart` — funil com % entre etapas
- `SourcesChart` — barras horizontais para fontes
- `ChannelsChart` — donut para canais
- `QuoteFunnelChart` — mini funil de orçamentos
- `WorkOrderStatusChart` — barra empilhada
- `ActivityFeed` — timeline de eventos recentes
- `PipelineAnalyticsPanel` — painel completo para PipelinesPage

### Passo 7 — `OverviewPage.tsx` (dashboard)
Redesign completo da página em seções:
1. **KPIs principais** (8 cards em 2 fileiras):
   - Total Leads | Receita | Leads Qualificados | Negócios Fechados
   - Ticket Médio | Taxa de Conversão | Briefings Concluídos | Follow-ups Enviados
2. **Gráficos principais** (2 colunas):
   - Funil por Pipeline (com dropdown selector) | Receita por Período
3. **Análise operacional** (3 colunas):
   - Fontes de Aquisição | Canais de Comunicação | Funil de Orçamentos
4. **Status de produção** (2 colunas):
   - Status de Work Orders | Custos de IA por Agente
5. **Inteligência** (2 colunas):
   - Objeções (taxa superação + top categorias) | Erros do Sistema
6. **Atividade recente** (full-width):
   - Feed de últimos eventos

### Passo 8 — `PipelinesPage.tsx` (dashboard)
Adicionar seção de análise expandível em cada pipeline card:
- Distribuição de leads por stage (com contagem e %)
- Métricas: conversão, ticket médio, receita, tempo por stage
- Leads parados + fontes

### Passo 9 — Build & Verificação
- `npx turbo run build` — garantir zero erros
- Verificar que nenhum import ficou unused

---

## Arquivos Impactados

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `apps/api/src/modules/analytics/analytics.service.ts` | Adicionar 10 métodos |
| `apps/api/src/modules/analytics/analytics.controller.ts` | Adicionar 10 endpoints |
| `apps/dashboard/src/services/api.ts` | Adicionar 10 métodos API |
| `apps/dashboard/src/hooks/use-analytics.ts` | Expandir com 14 queries |
| `apps/dashboard/src/pages/OverviewPage.tsx` | Redesign completo |
| `apps/dashboard/src/pages/PipelinesPage.tsx` | Adicionar painel analytics |
| `apps/dashboard/src/components/charts/ConversionFunnelChart.tsx` | NOVO |
| `apps/dashboard/src/components/charts/SourcesChart.tsx` | NOVO |
| `apps/dashboard/src/components/charts/ChannelsChart.tsx` | NOVO |
| `apps/dashboard/src/components/charts/QuoteFunnelChart.tsx` | NOVO |
| `apps/dashboard/src/components/charts/WorkOrderStatusChart.tsx` | NOVO |
| `apps/dashboard/src/components/charts/ActivityFeed.tsx` | NOVO |
| `apps/dashboard/src/components/charts/PipelineAnalyticsPanel.tsx` | NOVO |

---

## Convenções Seguidas

- **Backend**: Módulo `analytics` existente, mesmos patterns (`@Inject(DATABASE_CONNECTION)`, `@TenantId()`, `JwtAuthGuard`)
- **Frontend**: TanStack Query, `dashboardApi`, Tailwind CSS, Lucide icons, componentes chart estilo existente
- **TypeScript**: Strict mode, sem `any`, tipos inline ou em interfaces locais
- **Queries**: Drizzle ORM com `eq`, `and`, `gte`, `lte`, `count`, `sum`, `sql`, `desc` — mesmo padrão dos métodos existentes
- **Layout**: Grid responsivo `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` para cards, `lg:grid-cols-2` para charts
