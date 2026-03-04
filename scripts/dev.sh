#!/bin/bash
# KorIA Platform — Development Script
# Starts all apps and infrastructure for local development.

set -e

echo "🚀 KorIA Platform — Development Mode"
echo "======================================"

# Start infrastructure
echo "🐳 Starting infrastructure services..."
docker compose -f docker/docker-compose.yml up -d

# Wait for Postgres
echo "⏳ Waiting for PostgreSQL..."
until docker exec koria-postgres pg_isready -U koria > /dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL ready"

# Wait for Redis
echo "⏳ Waiting for Redis..."
until docker exec koria-redis redis-cli ping > /dev/null 2>&1; do
  sleep 1
done
echo "✅ Redis ready"

# Run database migrations (if available)
# echo "🗄️ Running migrations..."
# pnpm --filter @koria/database migrate

# Start all apps in development mode
echo ""
echo "🚀 Starting all apps..."
echo "   API:           http://localhost:3000/api/v1"
echo "   Swagger:       http://localhost:3000/api/v1/docs"
echo "   Briefing Form: http://localhost:5173"
echo "   Dashboard:     http://localhost:5174"
echo "   Upload Portal: http://localhost:5175"
echo "   MinIO Console: http://localhost:9001"
echo ""

pnpm dev
