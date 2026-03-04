# KorIA Platform — Guia de Deploy

## Ambientes

| Ambiente | API | Briefing Form | Dashboard | Upload Portal |
|----------|-----|---------------|-----------|---------------|
| Local | localhost:3000 | localhost:5173 | localhost:5174 | localhost:5175 |
| Staging | api-staging.koriastudio.com | briefing-staging.koriastudio.com | dashboard-staging.koriastudio.com | upload-staging.koriastudio.com |
| Production | api.koriastudio.com | briefing.koriastudio.com | dashboard.koriastudio.com | upload.koriastudio.com |

## Infraestrutura

### Backend (API)
- **Container:** Docker (Dockerfile.api)
- **Runtime:** Node.js 20 Alpine
- **Port:** 3000
- **Health check:** GET /api/v1/health

### Frontend (Apps)
- **Build:** Vite (static files)
- **Hosting:** Cloudflare Pages ou similar CDN
- **Build output:** `dist/`

### Banco de Dados
- **PostgreSQL 15+** com schema `core`
- **Gerenciado** (ex: Neon, Supabase, RDS)

### Cache / Filas
- **Redis** para ioredis + BullMQ
- **Gerenciado** (ex: Upstash, ElastiCache)

### Storage
- **Cloudflare R2** (S3-compatible)
- Bucket: `koria-uploads`

## Build

```bash
# Build completo
pnpm build

# Build individual
pnpm --filter @koria/api build
pnpm --filter @koria/briefing-form build
pnpm --filter @koria/dashboard build
pnpm --filter @koria/upload-portal build
```

## Docker

```bash
# Build da API
docker build -f docker/Dockerfile.api -t koria-api .

# Rodar localmente com Docker Compose
docker compose -f docker/docker-compose.yml up
```

## CI/CD

O pipeline CI/CD via GitHub Actions:

1. **CI** (`.github/workflows/ci.yml`):
   - Lint, typecheck, test em PRs
   - Build de verificação

2. **Deploy** (`.github/workflows/deploy.yml`):
   - Deploy automático no merge para `main`
   - Build e push da imagem Docker (API)
   - Deploy dos frontends no CDN

## Variáveis de Ambiente

Todas as variáveis necessárias estão documentadas em `.env.example`.
Configurar no ambiente de deploy (secrets do GitHub, dashboard do hosting, etc.).
