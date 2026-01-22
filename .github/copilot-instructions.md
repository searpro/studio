# Studio - AI Copilot Instructions

## Project Overview

**Studio** is a professional, asset-based AI image generation platform. This is a production-grade monorepo containing:

- **Frontend**: React 19 + TypeScript + Tailwind CSS SPA
- **API**: Node.js + Fastify + TypeScript + Prisma + PostgreSQL + Redis
- **Inference Server**: Python + FastAPI (dev) / Runpod Serverless (prod) + Diffusers

## Architecture Principles

1. **Asset-Based Workflow**: Users create reusable Characters and Scenes, not one-off prompts
2. **Async Job Architecture**: All AI workloads are queued (Redis/BullMQ) and processed asynchronously
3. **Stateless Workers**: Python inference workers are pure execution engines with no business logic
4. **API as Orchestrator**: Node.js API handles auth, persistence, job orchestration, and product logic
5. **User Isolation**: All assets are scoped to users; strict data access controls

## Tech Stack Reference

### Frontend (`/frontend`)
- **Framework**: React 19 with React Router DOM (HashRouter)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with dark mode support (`darkMode: 'class'`)
- **Icons**: Lucide React
- **State**: React hooks (no Redux/Zustand yet)
- **Build**: Vite

### API (`/api`)
- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ
- **Auth**: Auth.js (formerly NextAuth) with JWT
- **Storage**: S3-compatible (AWS S3, Cloudflare R2, or MinIO for local dev)
- **Validation**: Zod

### Inference Server (`/inference-server`)
- **Language**: Python 3.10+
- **Dev Framework**: FastAPI (local testing only)
- **Prod Handler**: Runpod serverless handler
- **ML Stack**: PyTorch + Diffusers + Transformers
- **Models**: SDXL / FLUX (future)
- **Storage**: boto3 for S3 uploads

## Data Model

### Core Entities

**User**
- Authentication and ownership

**Character**
- Name, description, cover image, status (PREPARING/READY/FAILED)
- Future: Custom embeddings/LoRA weights

**Scene**
- Name, description, category, thumbnail
- System scenes vs user-created

**Generation**
- Links Character + Scene + Controls (style/mood/shot)
- Stores prompt, output image URL, status, metadata

**Job**
- Generic async work unit (generation, training)
- Status tracking, payload, result, retry logic

## Code Conventions

### TypeScript (API & Frontend)
- **Strict mode**: No implicit any
- **Naming**:
  - PascalCase for types/interfaces/classes
  - camelCase for variables/functions
  - UPPER_SNAKE_CASE for constants
- **File structure**:
  - Routes: `/api/src/routes/<entity>.routes.ts`
  - Services: `/api/src/services/<entity>.service.ts`
  - Types: Co-located with feature or in `/shared/types/`
- **Exports**: Named exports preferred over default exports
- **Error handling**: Always use typed error responses

### Python (Inference Server)
- **Style**: PEP 8 compliant
- **Type hints**: Required for all function signatures
- **Naming**: snake_case for functions/variables
- **Async**: Use async/await for I/O operations
- **Error handling**: Structured logging + exception capture

### Prisma Schema
- **Models**: PascalCase singular (User, Character, Scene)
- **Fields**: camelCase
- **Relations**: Explicit naming (userId, characterId)
- **Timestamps**: Always include createdAt; updatedAt where needed
- **Indexes**: Add for foreign keys and query-heavy fields

## API Design Standards

### RESTful Conventions
```
GET    /api/characters          # List user's characters
POST   /api/characters          # Create new character
GET    /api/characters/:id      # Get single character
PATCH  /api/characters/:id      # Update character
DELETE /api/characters/:id      # Delete character
```

### Request/Response Format
- Always return JSON
- Use consistent envelope:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```
- Errors:
  ```json
  {
    "success": false,
    "data": null,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Character name is required"
    }
  }
  ```

### Authentication
- All routes except `/api/auth/*` require JWT
- Token passed via `Authorization: Bearer <token>` header
- User context injected via Fastify decorator: `request.user`

## Queue Job Patterns

### Job Structure
```typescript
interface Job {
  jobId: string;
  type: 'GENERATE_IMAGE' | 'TRAIN_CHARACTER';
  userId: string;
  payload: unknown;
  createdAt: Date;
}
```

### Generation Job Payload
```typescript
interface GenerationJobPayload {
  generationId: string;
  character: {
    id: string;
    name: string;
    description: string;
  };
  scene: {
    id: string;
    name: string;
    description: string;
  };
  controls: {
    action: string;
    style: 'photorealistic' | 'cinematic' | 'illustration' | 'anime';
    mood: string;
    shot: 'close-up' | 'portrait' | 'full-body' | 'wide-angle';
  };
}
```

## Inference Worker Contract

### Input (from queue)
```json
{
  "jobId": "uuid",
  "type": "GENERATE_IMAGE",
  "payload": { ... }
}
```

### Output (callback to API)
```json
{
  "jobId": "uuid",
  "status": "success",
  "imageUrl": "https://cdn.example.com/generations/...",
  "metadata": {
    "model": "sdxl-1.0",
    "steps": 30,
    "seed": 12345
  }
}
```

### Prompt Construction
```python
def build_prompt(payload: dict) -> str:
    character = payload["character"]
    scene = payload["scene"]
    controls = payload["controls"]
    
    return f"""Generate a {controls['style']} style image.

CORE ASSETS:
- Character: {character['description']}
- Setting: {scene['description']}

SCENE DESCRIPTION / ACTION:
{controls['action']}

ART DIRECTION:
- Mood: {controls['mood']}
- Shot Type: {controls['shot']}
"""
```

## Environment Variables

### API (`.env`)
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=studio-assets
S3_REGION=us-east-1
```

### Inference Server (`.env`)
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=studio-assets
REDIS_URL=redis://localhost:6379
API_CALLBACK_URL=http://api:3000/api/jobs/callback
```

## Development Workflow

### Local Setup
```bash
# Install dependencies
pnpm install

# Start infrastructure
docker-compose up -d

# Run API migrations
cd api && pnpm prisma migrate dev

# Start all services
pnpm dev
```

### Git Workflow
- **Branch naming**: `feature/character-creation`, `fix/auth-error`, `refactor/queue-service`
- **Commits**: Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`)
- **PRs**: Squash merge to main

## Testing Strategy

### API Tests
- Unit tests for services (business logic)
- Integration tests for routes (with test DB)
- Use `vitest` or `jest`

### Inference Server Tests
- Unit tests for prompt builder
- Integration tests with mock models
- Use `pytest`

### Frontend Tests
- Component tests with React Testing Library
- E2E tests with Playwright (future)

## Security Requirements

1. **Input Validation**: All user inputs validated with Zod schemas
2. **SQL Injection**: Prevented by Prisma (parameterized queries)
3. **XSS**: React escapes by default; use `dangerouslySetInnerHTML` carefully
4. **CSRF**: Not applicable (JWT-based stateless auth)
5. **Rate Limiting**: Implement per-user rate limits on generation endpoints
6. **Data Access**: Always filter by `userId` in Prisma queries

## Performance Guidelines

- **API Response Time**: < 100ms for non-AI endpoints
- **Database Queries**: Use indexes; avoid N+1 queries
- **Image Generation**: Target < 20s per job
- **Caching**: Cache system scenes, model metadata
- **Asset URLs**: Use CDN with long cache headers

## Common Patterns

### Adding a New API Route
1. Define Zod schema in route file
2. Create service function with business logic
3. Add route handler with validation
4. Update Prisma schema if needed
5. Write tests

### Adding a New Job Type
1. Add type to Job enum
2. Create queue producer in API service
3. Add worker handler in inference server
4. Update Job payload types
5. Add status polling endpoint

### Adding a New Asset Type
1. Design Prisma model
2. Create migration
3. Build CRUD routes
4. Add frontend UI components
5. Update types in `/shared`

## Debugging Tips

- **API Logs**: Fastify logs to console; use `pino-pretty` for dev
- **Queue Inspector**: BullMQ has a dashboard (Bull Board)
- **Database**: Use Prisma Studio (`pnpm prisma studio`)
- **Inference**: Check worker logs in Runpod dashboard or local FastAPI logs

## Future Extensions

- **Video Generation**: Queue jobs will handle long-running video inference
- **Character Training**: Real LoRA training pipeline (not mocked)
- **Collaboration**: Shared scenes and galleries
- **WebSockets**: Real-time job status updates
- **Credits System**: Usage tracking and billing

---

**When coding, always:**
- Check if the pattern already exists in the codebase
- Maintain consistency with existing code style
- Add TypeScript types for everything
- Consider async/queued nature of AI operations
- Think about user isolation and data access control
- Write code that's production-ready, not prototype-quality
