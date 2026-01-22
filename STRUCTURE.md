# Studio Monorepo - Complete Structure

```
studio/
│
├── 📄 Root Configuration
│   ├── package.json              # Monorepo root with workspace scripts
│   ├── pnpm-workspace.yaml       # pnpm workspace configuration
│   ├── docker-compose.yml        # PostgreSQL + Redis + MinIO
│   ├── .gitignore                # Comprehensive ignore rules
│   ├── .prettierrc               # Code formatting rules
│   └── setup.sh                  # Quick start script
│
├── 📚 Documentation
│   ├── README.md                 # Project overview & quick start
│   ├── PROJECT_STATUS.md         # Current status & next steps
│   ├── SETUP.md                  # Detailed setup guide
│   ├── DEPLOYMENT.md             # Production deployment guide
│   ├── api-and-inference-prd.md  # Backend requirements
│   └── .github/
│       └── copilot-instructions.md  # AI coding assistant context
│
├── 🔌 API (Node.js + TypeScript + Fastify)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma         # Complete data model
│   │   └── seed.sql              # System scenes
│   └── src/
│       ├── server.ts             # Main entry point
│       ├── config/
│       │   └── index.ts          # Environment config
│       ├── lib/
│       │   ├── prisma.ts         # Database client
│       │   ├── redis.ts          # Redis client
│       │   └── s3.ts             # S3 client
│       ├── middleware/
│       │   ├── authenticate.ts   # JWT auth
│       │   └── error-handler.ts  # Error handling
│       ├── queue/
│       │   └── index.ts          # BullMQ job management
│       └── routes/
│           ├── auth.routes.ts    # Register, Login, Me
│           ├── character.routes.ts  # Character CRUD
│           ├── scene.routes.ts      # Scene CRUD
│           ├── generation.routes.ts # Generation management
│           └── job.routes.ts        # Job status & callbacks
│
├── 🐍 Inference Server (Python + FastAPI + SDXL)
│   ├── package.json
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── src/
│       ├── __init__.py
│       ├── handler.py            # Runpod serverless handler
│       ├── dev_server.py         # FastAPI local server
│       ├── config.py             # Pydantic settings
│       ├── pipeline.py           # SDXL generation pipeline
│       ├── prompt_builder.py     # Prompt construction
│       └── storage.py            # S3 upload logic
│
├── ⚛️ Frontend (React + TypeScript + Vite)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── PRD.md                    # Frontend requirements
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── components/
│   │   │   ├── Icons.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Characters.tsx
│   │   │   ├── Scenes.tsx
│   │   │   ├── Create.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Billing.tsx
│   │   └── services/
│   │       └── geminiService.ts  # To be replaced with API calls
│   └── ...
│
└── 🔗 Shared Types (TypeScript)
    ├── package.json
    └── types/
        └── index.ts              # Shared interfaces & types
```

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         React Frontend (localhost:5173)                   │  │
│  │  • Dashboard  • Characters  • Scenes  • Create  • Gallery │  │
│  └───────────────────────┬──────────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTP/REST + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Node.js API (localhost:3000)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Fastify Server                                          │   │
│  │  • Auth Routes    • Character Routes   • Scene Routes    │   │
│  │  • Generation Routes   • Job Routes                      │   │
│  └──────┬──────────────────┬──────────────────┬────────────┘   │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐            │
│  │PostgreSQL│      │  Redis   │      │ MinIO S3 │            │
│  │  :5432   │      │  :6379   │      │  :9000   │            │
│  └──────────┘      └────┬─────┘      └──────────┘            │
└─────────────────────────┼─────────────────────────────────────┘
                          │ BullMQ Job Queue
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│          Python Inference Worker (localhost:8000)                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  FastAPI Dev Server / Runpod Handler                     │   │
│  │  • Prompt Builder   • SDXL Pipeline   • S3 Uploader     │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────┐          │   │
│  │  │  Stable Diffusion XL Model (8GB)         │          │   │
│  │  │  • Text Encoder  • U-Net  • VAE          │          │   │
│  │  └──────────────────────────────────────────┘          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          │ Callback on completion                │
│                          ▼                                       │
│                    API /jobs/callback                            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Example: Image Generation

```
1. User Action (Frontend)
   └─> POST /api/generations
       {
         "characterId": "...",
         "sceneId": "...",
         "action": "standing confidently",
         "style": "photorealistic",
         "mood": "confident",
         "shot": "portrait"
       }

2. API Processing
   ├─> Verify character ownership & status (READY)
   ├─> Verify scene access
   ├─> Build composite prompt
   ├─> Create Generation record (status: PENDING)
   ├─> Create Job record
   └─> Enqueue to Redis
       └─> generationQueue.add(jobPayload)

3. Queue → Worker
   └─> Worker picks job from Redis
       ├─> Load SDXL model (cached)
       ├─> Build full prompt with negative prompts
       ├─> Run diffusion (30 steps, ~10-20 seconds)
       ├─> Upload PNG to S3
       │   └─> generations/{userId}/{generationId}.png
       └─> POST /api/jobs/callback
           {
             "jobId": "...",
             "status": "success",
             "imageUrl": "http://minio:9000/studio-assets/...",
             "metadata": { "model": "sdxl-1.0", "steps": 30 }
           }

4. API Callback Handler
   ├─> Update Job (status: COMPLETE)
   ├─> Update Generation (status: COMPLETE, imageUrl)
   └─> Frontend polls and sees updated status

5. User sees result
   └─> Image displayed in Gallery
       └─> Download button uses S3 URL
```

## 📊 Database Schema Overview

```sql
User
├── id (PK)
├── email (unique)
├── name
└── password (hashed)

Character
├── id (PK)
├── userId (FK → User)
├── name
├── description
├── coverImageUrl
├── status (PREPARING|READY|FAILED)
└── [1:Many] → Generation

Scene
├── id (PK)
├── name
├── description
├── category (INDOOR|OUTDOOR|FANTASY|SCIFI|URBAN|NATURE)
├── thumbnailUrl
├── isSystem (boolean)
├── userId (FK → User, nullable for system scenes)
└── [1:Many] → Generation

Generation
├── id (PK)
├── userId (FK → User)
├── characterId (FK → Character)
├── sceneId (FK → Scene)
├── action
├── style
├── mood
├── shot
├── promptText (full composite prompt)
├── imageUrl
├── status (PENDING|RUNNING|COMPLETE|FAILED)
├── metadata (JSON)
└── [1:1] → Job

Job
├── id (PK)
├── type (GENERATE_IMAGE|TRAIN_CHARACTER)
├── status (PENDING|RUNNING|COMPLETE|FAILED)
├── generationId (FK → Generation, nullable)
├── payload (JSON)
├── result (JSON)
├── error
└── attempts
```

## 🛠️ Development Commands

```bash
# Root level
pnpm install              # Install all dependencies
pnpm dev                  # Start all services
pnpm docker:up            # Start infrastructure
pnpm docker:down          # Stop infrastructure
pnpm build                # Build all packages
pnpm test                 # Run all tests
pnpm format               # Format all code

# API specific
pnpm dev:api              # Start API server
pnpm prisma:studio        # Open database UI
pnpm prisma:migrate       # Run migrations

# Frontend specific
pnpm dev:frontend         # Start React dev server

# Inference specific
pnpm dev:inference        # Start Python FastAPI server
```

## 📦 Package Dependencies Summary

### API
- **Runtime**: Fastify, Prisma, BullMQ, Redis, AWS SDK
- **Auth**: @fastify/jwt, bcrypt
- **Validation**: Zod
- **Dev**: tsx, TypeScript, Vitest

### Inference
- **ML**: PyTorch, Diffusers, Transformers
- **Web**: FastAPI, Uvicorn
- **Storage**: boto3
- **Deployment**: Runpod SDK

### Frontend
- **Framework**: React 19, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Router**: React Router DOM

## 🎯 Current Status

✅ **Complete**: Infrastructure, API scaffold, Inference worker, Documentation  
⏭️ **Next**: Install dependencies → Start services → Test endpoints  
🔮 **Future**: Frontend integration, Real character training, WebSockets

---

**Ready to start building!** 🚀

Run: `./setup.sh` or follow [SETUP.md](./SETUP.md)
