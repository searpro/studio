# Studio - Asset-based Creative Suite

Professional AI image generation platform with reusable Characters and Scenes.

## Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **API**: Node.js + Fastify + Prisma + PostgreSQL + Redis
- **Inference**: Python + FastAPI (dev) / Runpod Serverless (prod)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Python 3.10+ (for inference server development)

### Installation

```bash
# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL, Redis, MinIO)
pnpm docker:up

# Run database migrations
pnpm prisma:migrate

# Start all services
pnpm dev
```

### Available Commands

```bash
# Development
pnpm dev              # Start all services
pnpm dev:api          # Start API only
pnpm dev:frontend     # Start frontend only
pnpm dev:inference    # Start inference server only

# Database
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:migrate   # Run migrations

# Docker
pnpm docker:up        # Start infrastructure
pnpm docker:down      # Stop infrastructure
pnpm docker:logs      # View logs

# Build
pnpm build            # Build all
pnpm build:api        # Build API
pnpm build:frontend   # Build frontend

# Quality
pnpm test             # Run tests
pnpm lint             # Lint code
pnpm format           # Format code
```

## Project Structure

```
studio/
├── api/                    # Node.js API
├── frontend/               # React SPA
├── inference-server/       # Python inference worker
├── shared/                 # Shared types
└── docker-compose.yml      # Local infrastructure
```

## Services

- **API**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **Inference**: http://localhost:8000 (dev only)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MinIO**: http://localhost:9000 (console: http://localhost:9001)

## Environment Setup

See individual `.env.example` files in each service directory:
- `api/.env.example`
- `inference-server/.env.example`

## Documentation

- [Frontend PRD](./frontend/PRD.md)
- [Backend & Inference PRD](./api-and-inference-prd.md)
- [Copilot Instructions](./.github/copilot-instructions.md)

## Tech Stack

### Frontend
- React 19, TypeScript, Vite
- Tailwind CSS, Lucide Icons
- React Router DOM

### API
- Fastify, Prisma ORM
- PostgreSQL, Redis, BullMQ
- Auth.js (JWT)
- S3-compatible storage

### Inference
- Python, FastAPI
- PyTorch, Diffusers
- Runpod Serverless (production)

## License

Private - All Rights Reserved
