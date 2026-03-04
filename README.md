# KorIA Platform

Monorepo for the **KorIA** platform — AI-powered video production for real estate launches.

## Architecture

```
system-koria/
├── apps/
│   ├── api/              # NestJS REST API (port 3000)
│   ├── briefing-form/    # Public briefing form (Vite + React, port 5173)
│   ├── dashboard/        # Internal dashboard (Vite + React, port 5174)
│   └── upload-portal/    # Public file upload portal (Vite + React, port 5175)
├── packages/
│   ├── config/           # Shared ESLint, Prettier, Tailwind, TS configs
│   ├── database/         # Drizzle ORM schemas + client (PostgreSQL)
│   ├── types/            # Shared TypeScript types, enums, DTOs
│   ├── ui/               # Shared React UI components (shadcn/ui pattern)
│   └── utils/            # Shared utilities (formatters, validators, helpers)
├── docker/               # Dockerfiles, docker-compose, nginx config
├── scripts/              # Setup, dev, deploy scripts
├── docs/                 # Architecture, database, API, contributing docs
└── .github/workflows/    # CI/CD pipelines
```

## Tech Stack

| Layer       | Technology                                                       |
| ----------- | ---------------------------------------------------------------- |
| **Frontend**| React 18 · Vite 5 · TypeScript strict · Tailwind CSS · shadcn/ui |
| **State**   | Zustand · TanStack Query 5 · React Hook Form + Zod              |
| **Backend** | NestJS 10 · TypeScript strict · Drizzle ORM · Passport JWT      |
| **Database**| PostgreSQL 15 (schema `core`) · Redis 7                          |
| **Storage** | Cloudflare R2 (S3-compatible)                                    |
| **Payments**| Stripe · Wise                                                    |
| **Infra**   | Docker · pnpm workspaces · Turborepo · GitHub Actions            |

## Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- **Docker** (for PostgreSQL, Redis, MinIO)

### Setup

```bash
# Clone the repository
git clone <repo-url> system-koria
cd system-koria

# Run setup script (installs deps, copies .env)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start infrastructure (Postgres, Redis, MinIO)
docker compose -f docker/docker-compose.yml up -d

# Start all apps in development mode
pnpm dev
```

### Or step by step

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your actual values

# Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# Start all apps
pnpm dev
```

## Development URLs

| Service         | URL                                    |
| --------------- | -------------------------------------- |
| API             | http://localhost:3000/api/v1           |
| Swagger Docs    | http://localhost:3000/api/v1/docs      |
| Briefing Form   | http://localhost:5173                  |
| Dashboard       | http://localhost:5174                  |
| Upload Portal   | http://localhost:5175                  |
| MinIO Console   | http://localhost:9001                  |

## Scripts

| Command         | Description                            |
| --------------- | -------------------------------------- |
| `pnpm dev`      | Start all apps in development mode     |
| `pnpm build`    | Build all packages and apps            |
| `pnpm lint`     | Lint all packages and apps             |
| `pnpm typecheck`| Type-check all TypeScript              |
| `pnpm format`   | Format code with Prettier              |
| `pnpm clean`    | Clean all build outputs                |

### Per-app commands

```bash
# Run a specific app
pnpm --filter @koria/api dev
pnpm --filter @koria/dashboard dev
pnpm --filter @koria/briefing-form dev
pnpm --filter @koria/upload-portal dev

# Build a specific app
pnpm --filter @koria/api build
```

## Environment Variables

See [.env.example](.env.example) for all required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT token signing
- `S3_*` — Cloudflare R2 / S3 credentials
- `REDIS_URL` — Redis connection string
- `STRIPE_SECRET_KEY` / `WISE_API_TOKEN` — Payment providers
- `DEFAULT_TENANT_ID` — KorIA tenant UUID

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, data flows, integrations
- [Database](docs/DATABASE.md) — ER diagram, all tables and enums
- [API](docs/API.md) — Endpoint reference and error format
- [Contributing](docs/CONTRIBUTING.md) — Development workflow, conventions
- [Deployment](docs/DEPLOYMENT.md) — Infrastructure, CI/CD, environments

## License

Private — All rights reserved.
