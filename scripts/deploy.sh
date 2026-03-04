#!/bin/bash
# KorIA Platform — Deploy Script
# Builds and deploys the specified target.
# Usage: ./scripts/deploy.sh <target> <environment>
# Example: ./scripts/deploy.sh api production

set -e

TARGET=${1:-all}
ENV=${2:-production}

echo "🚀 KorIA Platform — Deploy"
echo "Target: $TARGET | Environment: $ENV"
echo "==================================="

case $TARGET in
  api)
    echo "🏗️ Building API..."
    pnpm --filter @koria/api build
    echo "🐳 Building Docker image..."
    docker build -f docker/Dockerfile.api -t koria-api:latest .
    echo "✅ API image built: koria-api:latest"
    ;;

  dashboard)
    echo "🏗️ Building Dashboard..."
    pnpm --filter @koria/dashboard build
    echo "🐳 Building Docker image..."
    docker build --build-arg APP_NAME=dashboard -f docker/Dockerfile.frontend -t koria-dashboard:latest .
    echo "✅ Dashboard image built: koria-dashboard:latest"
    ;;

  briefing-form)
    echo "🏗️ Building Briefing Form..."
    pnpm --filter @koria/briefing-form build
    echo "🐳 Building Docker image..."
    docker build --build-arg APP_NAME=briefing-form -f docker/Dockerfile.frontend -t koria-briefing-form:latest .
    echo "✅ Briefing Form image built: koria-briefing-form:latest"
    ;;

  upload-portal)
    echo "🏗️ Building Upload Portal..."
    pnpm --filter @koria/upload-portal build
    echo "🐳 Building Docker image..."
    docker build --build-arg APP_NAME=upload-portal -f docker/Dockerfile.frontend -t koria-upload-portal:latest .
    echo "✅ Upload Portal image built: koria-upload-portal:latest"
    ;;

  all)
    echo "🏗️ Building all apps..."
    pnpm build
    echo "🐳 Building all Docker images..."
    docker build -f docker/Dockerfile.api -t koria-api:latest .
    docker build --build-arg APP_NAME=dashboard -f docker/Dockerfile.frontend -t koria-dashboard:latest .
    docker build --build-arg APP_NAME=briefing-form -f docker/Dockerfile.frontend -t koria-briefing-form:latest .
    docker build --build-arg APP_NAME=upload-portal -f docker/Dockerfile.frontend -t koria-upload-portal:latest .
    echo "✅ All images built"
    ;;

  *)
    echo "❌ Unknown target: $TARGET"
    echo "Usage: ./scripts/deploy.sh <api|dashboard|briefing-form|upload-portal|all> [environment]"
    exit 1
    ;;
esac

echo ""
echo "✅ Deploy build complete for $TARGET ($ENV)"
