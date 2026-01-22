#!/bin/bash

# Studio Quick Start Script
# This script sets up the development environment

set -e

echo "🎨 Studio - Quick Start Setup"
echo "=============================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Start infrastructure
echo "🐳 Starting infrastructure (PostgreSQL, Redis, MinIO)..."
docker-compose up -d
echo "⏳ Waiting for services to be ready..."
sleep 10
echo "✅ Infrastructure started"
echo ""

# Setup database
echo "🗄️  Setting up database..."
pnpm --filter @studio/api prisma:generate
pnpm --filter @studio/api prisma:migrate
echo "✅ Database migrations applied"
echo ""

# Seed data
echo "🌱 Seeding system scenes..."
if command -v psql &> /dev/null; then
    psql postgresql://studio:studio_dev_password@localhost:5432/studio_dev -f api/prisma/seed.sql
    echo "✅ System scenes seeded"
else
    echo "⚠️  psql not found. You can seed manually later with:"
    echo "   psql \$DATABASE_URL -f api/prisma/seed.sql"
fi
echo ""

# Success message
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Start all services:"
echo "   pnpm dev"
echo ""
echo "2. Or start services individually:"
echo "   pnpm dev:api       # API at http://localhost:3000"
echo "   pnpm dev:frontend  # Frontend at http://localhost:5173"
echo "   pnpm dev:inference # Inference at http://localhost:8000"
echo ""
echo "3. View services:"
echo "   - API Health: http://localhost:3000/health"
echo "   - MinIO Console: http://localhost:9001 (minioadmin / minioadmin)"
echo "   - Prisma Studio: pnpm prisma:studio"
echo ""
echo "4. Test the API:"
echo "   curl http://localhost:3000/health"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: SETUP.md"
echo "   - Project Status: PROJECT_STATUS.md"
echo "   - Deployment Guide: DEPLOYMENT.md"
echo ""
echo "Happy coding! 🎨"
