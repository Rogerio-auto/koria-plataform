# KorIA Platform — Arquitetura do Projeto

## 1. Visão Geral

A **KorIA Platform** (`koria-platform`) é uma plataforma interna da KorIA — produtora de vídeos com IA especializada em lançamentos imobiliários — para gestão de leads, coleta de briefing, upload de materiais e análise de dados.

O projeto é estruturado como **monorepo** utilizando **pnpm workspaces + Turborepo**, contendo múltiplas aplicações frontend e um backend unificado.

### 1.1. Aplicações

| App | Path | Tipo | Acesso | Descrição |
|-----|------|------|--------|-----------|
| **API** | `apps/api` | Backend NestJS | Interno | Backend unificado com REST API |
| **Briefing Form** | `apps/briefing-form` | Frontend React | Público | Formulário para clientes preencherem briefing pós-pagamento |
| **Dashboard** | `apps/dashboard` | Frontend React | Interno (auth) | Painel de métricas e gestão para a equipe KorIA |
| **Upload Portal** | `apps/upload-portal` | Frontend React | Público (link único) | Portal para clientes enviarem materiais/arquivos |

### 1.2. Pacotes Compartilhados

| Pacote | Path | Descrição |
|--------|------|-----------|
| `@koria/ui` | `packages/ui` | Componentes React reutilizáveis (Button, Input, Card, etc.) |
| `@koria/types` | `packages/types` | Tipos TypeScript compartilhados (DTOs, interfaces, enums) |
| `@koria/utils` | `packages/utils` | Funções utilitárias (formatters, validators, helpers) |
| `@koria/database` | `packages/database` | Schema Drizzle ORM e conexão com PostgreSQL |
| `@koria/config` | `packages/config` | Configurações compartilhadas (ESLint, Prettier, Tailwind, TS) |

---

## 2. Stack Tecnológica

### 2.1. Infraestrutura do Monorepo

- **Package Manager:** pnpm 9+
- **Build Orchestration:** Turborepo 2+
- **Node.js:** 20+ (LTS)
- **TypeScript:** 5.4+ (strict mode habilitado globalmente)

### 2.2. Frontend (Todas as Aplicações)

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| React | 18+ | Biblioteca UI |
| Vite | 5+ | Bundler / Dev server |
| TypeScript | 5.4+ | Tipagem estática |
| Tailwind CSS | 3+ | Estilização utility-first |
| shadcn/ui | latest | Componentes baseados em Radix UI |
| React Hook Form | 7+ | Gerenciamento de formulários |
| Zod | 3+ | Validação de schemas |
| Zustand | 4+ | Estado global |
| TanStack Query | 5+ | Data fetching / caching |
| React Router | 6+ | Roteamento SPA |
| Lucide React | latest | Ícones |
| Recharts | 2+ | Gráficos (Dashboard) |
| react-dropzone | 14+ | Upload drag-and-drop |
| react-i18next | 14+ | Internacionalização |

### 2.3. Backend (API Unificada)

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| NestJS | 10+ | Framework backend |
| TypeScript | 5.4+ | Tipagem estática |
| Drizzle ORM | latest | ORM type-safe para PostgreSQL |
| PostgreSQL | 15+ | Banco de dados (schema `core` existente) |
| Passport | latest | Autenticação |
| JWT | — | Tokens de autenticação |
| @nestjs/swagger | latest | Documentação OpenAPI |
| Multer | latest | Upload de arquivos |
| @aws-sdk/client-s3 | 3+ | Storage S3/Cloudflare R2 |
| ioredis | 5+ | Cache Redis |
| BullMQ | 5+ | Filas de jobs assíncronos |
| class-validator | latest | Validação de DTOs |
| class-transformer | latest | Transformação de dados |

---

## 3. Arquitetura de Módulos (Backend)

O backend segue a arquitetura modular do NestJS. Cada domínio de negócio é um módulo independente:

```
apps/api/src/
├── modules/
│   ├── auth/          → Autenticação JWT (login, refresh, guards)
│   ├── leads/         → CRUD de leads e contatos
│   ├── briefing/      → Recebimento e processamento de briefings
│   ├── uploads/       → Upload de arquivos para S3/R2
│   ├── analytics/     → Métricas, relatórios e dashboards
│   ├── products/      → Catálogo de produtos e preços
│   ├── work-orders/   → Ordens de serviço e produção
│   ├── payments/      → Pagamentos (Stripe/Wise) e webhooks
│   └── health/        → Health check da aplicação
│
├── common/
│   ├── decorators/    → @CurrentUser(), @TenantId()
│   ├── guards/        → TenantGuard
│   ├── interceptors/  → LoggingInterceptor
│   ├── filters/       → HttpExceptionFilter
│   └── pipes/         → ValidationPipe configurado
│
└── config/
    ├── app.config.ts
    ├── database.config.ts
    ├── jwt.config.ts
    ├── s3.config.ts
    └── redis.config.ts
```

### 3.1. Fluxo de Requisição

```
Request → Guard (JWT/Tenant) → Interceptor (Logging)
        → Pipe (Validation) → Controller → Service → Drizzle ORM → PostgreSQL
        → Response (transformed) → Interceptor (Logging) → Client
```

---

## 4. Fluxos de Dados

### 4.1. Fluxo de Briefing

```
Cliente acessa link → Briefing Form (React)
  → POST /api/v1/briefing/submit
    → Valida dados (Zod + class-validator)
    → Upload de logo/materiais para S3
    → Salva em core.lead_qualification
    → Atualiza stage do lead para 'briefing_received'
    → Dispara evento 'lead.briefing_submitted'
    → Retorna confirmação
```

### 4.2. Fluxo de Upload

```
Cliente acessa link com token → Upload Portal (React)
  → GET /api/v1/uploads/validate/:token
    → Valida upload_token na work_order
    → Retorna dados da OS
  → POST /api/v1/uploads/files
    → Recebe arquivos (multipart/form-data)
    → Faz upload para S3/R2
    → Cria registros em core.work_order_assets
    → Retorna confirmação
```

### 4.3. Fluxo do Dashboard

```
Equipe KorIA faz login → Dashboard (React)
  → POST /api/v1/auth/login → JWT token
  → GET /api/v1/analytics/overview
    → Consulta views: vw_lead_funnel_current, vw_work_orders
    → Agrega dados de payment_intents, ai_runs, errors
    → Retorna métricas formatadas
  → Renders gráficos (Recharts)
```

### 4.4. Fluxo de Pagamento

```
Webhook Stripe/Wise → POST /api/v1/payments/webhooks/stripe
  → Valida assinatura do webhook
  → Atualiza core.payment_intents
  → Trigger do banco gera evento automático
  → Se status = 'paid':
    → Cria core.work_orders automaticamente
    → Move lead para stage 'paid'
    → Gera token de upload
```

---

## 5. Integrações Externas

### 5.1. Stripe
- **Propósito:** Processamento de pagamentos via cartão de crédito
- **Fluxo:** Checkout Session → Webhook → Confirmação
- **Tabelas:** `payment_intents`, `payment_events`

### 5.2. Wise (TransferWise)
- **Propósito:** Pagamentos internacionais via transferência bancária
- **Fluxo:** Transfer criado → Webhook → Confirmação
- **Tabelas:** `payment_intents`, `payment_events`

### 5.3. Cloudflare R2 (S3-compatible)
- **Propósito:** Storage de arquivos (logos, materiais, vídeos)
- **Protocolo:** S3 API via `@aws-sdk/client-s3`
- **Tabelas:** `work_order_assets`

### 5.4. ClickUp
- **Propósito:** Gestão de tarefas de produção
- **Sincronização:** `work_orders.external_task_id` ↔ ClickUp Task ID
- **Tabelas:** `work_orders`

### 5.5. Chatwoot
- **Propósito:** Plataforma de atendimento omnichannel
- **Sincronização:** `conversations.external_thread_id` ↔ Chatwoot Conversation ID
- **Tabelas:** `conversations`, `messages`

---

## 6. Decisões Arquiteturais

### 6.1. Monorepo com Turborepo

**Motivação:** Centralizar código compartilhado, garantir consistência de tipos e facilitar deploys coordenados.

**Alternativas consideradas:**
- Repos separados → descartado por overhead de manutenção
- Nx → descartado por complexidade desnecessária para o tamanho do projeto

### 6.2. Drizzle ORM sobre Prisma

**Motivação:** Schema já existe no banco; Drizzle permite mapear tabelas existentes sem migrações invasivas, é mais performático e gera SQL mais previsível.

**Alternativas consideradas:**
- Prisma → descartado por dificuldade de mapear banco existente e overhead de introspect
- Knex → descartado por falta de type-safety nativa

### 6.3. NestJS como Backend

**Motivação:** Arquitetura modular, suporte nativo a Swagger, guards, interceptors e dependency injection. Excelente para APIs empresariais.

**Alternativas consideradas:**
- Express puro → descartado por falta de estrutura
- Fastify standalone → descartado por necessidade de mais boilerplate

### 6.4. React + Vite sobre Next.js

**Motivação:** Aplicações são SPAs puras sem necessidade de SSR/SSG. Vite oferece DX superior e builds mais rápidos para SPAs.

**Alternativas consideradas:**
- Next.js → descartado por complexidade desnecessária (sem SSR needed)
- Remix → descartado por ser overkill para formulários simples

### 6.5. Multi-tenant preparado

**Motivação:** Embora atualmente exista apenas 1 tenant (KorIA), toda a modelagem de dados e lógica de negócio respeita o `tenant_id`, facilitando futura expansão.

### 6.6. Upload Token para Portal

**Motivação:** Cada `work_order` possui um `upload_token` único, permitindo links de upload sem autenticação completa, mas vinculados a uma OS específica.

---

## 7. Segurança

### 7.1. Autenticação
- Dashboard: JWT via Passport (login com email/password)
- Briefing Form: Público (link com `lead_id` ou `qualification_id`)
- Upload Portal: Token único por work order (`upload_token`)

### 7.2. Autorização
- Todas as queries filtram por `tenant_id`
- `TenantGuard` garante isolamento de dados
- Roles: admin, operator (futuramente)

### 7.3. Validação
- Frontend: Zod schemas
- Backend: class-validator + Zod (dupla validação)
- SQL: constraints, foreign keys, enums

### 7.4. Storage
- Uploads via presigned URLs ou direct upload
- Tipos de arquivo validados (whitelist)
- Tamanho máximo configurável

---

## 8. Ambientes

| Ambiente | API URL | Apps URLs |
|----------|---------|-----------|
| **Development** | `http://localhost:3000/api/v1` | `localhost:5173/5174/5175` |
| **Staging** | `https://api-staging.koriastudio.com/api/v1` | `*.staging.koriastudio.com` |
| **Production** | `https://api.koriastudio.com/api/v1` | `briefing/dashboard/upload.koriastudio.com` |

---

## 9. Estrutura de Deploy

```
┌─────────────────────────────────────────────────────┐
│                  Cloudflare CDN                       │
│  briefing.koriastudio.com → apps/briefing-form       │
│  dashboard.koriastudio.com → apps/dashboard          │
│  upload.koriastudio.com → apps/upload-portal          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              API (NestJS Container)                   │
│           api.koriastudio.com/api/v1                  │
└──────────┬───────────────┬──────────────────────────┘
           │               │
┌──────────▼──┐  ┌────────▼────────┐
│ PostgreSQL  │  │  Cloudflare R2  │
│ (schema:    │  │  (file storage) │
│  core)      │  │                 │
└─────────────┘  └─────────────────┘
           │
┌──────────▼──┐
│   Redis     │
│  (cache +   │
│   queues)   │
└─────────────┘
```

---

## 10. Próximos Passos

1. ✅ Estrutura de pastas e configurações base
2. Configurar Drizzle com schema do banco existente
3. Criar módulos base do NestJS (auth, health)
4. Criar componentes UI base (packages/ui)
5. Implementar formulário de briefing
6. Implementar portal de upload
7. Implementar dashboard com métricas
8. Integrar pagamentos (Stripe/Wise)
9. CI/CD e deploy em produção
