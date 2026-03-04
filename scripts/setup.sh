#!/bin/bash
# KorIA Platform — Initial Setup Script
# Run once after cloning the repository.

set -e

echo "🚀 KorIA Platform — Setup"
echo "=========================="

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ is required. Current: $(node -v)"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  corepack enable
  corepack prepare pnpm@9 --activate
fi
echo "✅ pnpm $(pnpm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file
if [ ! -f .env ]; then
  echo "📄 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Edit .env with your actual values"
fi

# Start infrastructure (optional)
echo ""
echo "🐳 To start infrastructure services (Postgres, Redis, MinIO):"
echo "   docker compose -f docker/docker-compose.yml up -d"
echo ""
echo "✅ Setup complete! Run 'pnpm dev' to start development."
