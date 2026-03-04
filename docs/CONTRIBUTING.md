# KorIA Platform — Guia de Contribuição

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+ (com schema `core` configurado)
- Redis (para cache e filas)

## Setup Inicial

```bash
# Clonar repositório
git clone <repo-url>
cd koria-platform

# Instalar dependências
pnpm install

# Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Rodar em modo desenvolvimento
pnpm dev
```

## Convenções de Código

### Branches

- `main` — produção
- `develop` — desenvolvimento
- `feature/<nome>` — novas funcionalidades
- `fix/<nome>` — correções
- `chore/<nome>` — manutenção

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(briefing): add file upload support
fix(api): correct tenant filter on leads query
chore(deps): update tailwind to 3.4
docs(api): add upload endpoints documentation
```

### TypeScript

- Strict mode obrigatório
- Sem `any` (ESLint error)
- Tipos compartilhados em `@koria/types`
- Usar inferência quando possível

### Estilização

- Tailwind CSS utility classes
- Componentes base em `@koria/ui`
- Sem CSS custom salvo exceções documentadas
- Dark mode via class strategy

## Estrutura de PR

1. Criar branch a partir de `develop`
2. Implementar mudanças
3. Garantir que `pnpm lint` e `pnpm typecheck` passam
4. Abrir PR para `develop`
5. Descrever mudanças no PR
6. Aguardar review

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Roda todas as apps em modo dev |
| `pnpm build` | Build de todas as apps |
| `pnpm lint` | Lint de todo o monorepo |
| `pnpm typecheck` | Verificação de tipos |
| `pnpm format` | Formata código com Prettier |
| `pnpm db:generate` | Gera migrations Drizzle |
| `pnpm db:migrate` | Aplica migrations |
| `pnpm db:studio` | Abre Drizzle Studio |
