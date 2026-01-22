# Studio Setup Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Python 3.10+ (for inference server)
- CUDA-capable GPU (optional, can use CPU/MPS for local dev)

## Step 1: Install Dependencies

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install
```

## Step 2: Environment Files

Create environment files for each service:

### API Environment

```bash
cd api
cp .env.example .env
```

Edit `api/.env` if needed (defaults work for local development).

### Inference Server Environment

```bash
cd inference-server
cp .env.example .env
```

Edit `inference-server/.env` and set the appropriate device:
- `DEVICE=cuda` (if you have NVIDIA GPU)
- `DEVICE=mps` (if you have Apple Silicon)
- `DEVICE=cpu` (fallback, will be slow)

## Step 3: Start Infrastructure

Start PostgreSQL, Redis, and MinIO using Docker:

```bash
pnpm docker:up
```

This will start:
- PostgreSQL at `localhost:5432`
- Redis at `localhost:6379`
- MinIO at `localhost:9000` (console at `localhost:9001`)

## Step 4: Database Setup

Run Prisma migrations and seed data:

```bash
# Generate Prisma client
cd api
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed system scenes (optional)
psql $DATABASE_URL -f prisma/seed.sql
```

## Step 5: Install Python Dependencies

```bash
cd inference-server
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

**Note**: First run will download ~8GB of SDXL model weights. This may take 10-30 minutes depending on your internet connection.

## Step 6: Start Development Servers

### Option A: Start All Services

From the root directory:

```bash
pnpm dev
```

This starts:
- API at `http://localhost:3000`
- Frontend at `http://localhost:5173`
- Inference server at `http://localhost:8000`

### Option B: Start Services Individually

```bash
# Terminal 1 - API
pnpm dev:api

# Terminal 2 - Frontend
pnpm dev:frontend

# Terminal 3 - Inference Server
pnpm dev:inference
```

## Verification

### Check API

```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check Inference Server

```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","model":"stabilityai/stable-diffusion-xl-base-1.0"}
```

### Check MinIO

Open `http://localhost:9001` in your browser:
- Username: `minioadmin`
- Password: `minioadmin`

You should see a bucket named `studio-assets`.

## Testing the Full Flow

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Save the `token` from the response.

### 2. Create a Character

```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Alex",
    "description": "A young professional in their late 20s with short brown hair, wearing casual business attire"
  }'
```

Wait 2 seconds for the character to become "READY".

### 3. List Scenes

```bash
curl http://localhost:3000/api/scenes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Pick a scene ID from the response.

### 4. Generate an Image

```bash
curl -X POST http://localhost:3000/api/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "characterId": "YOUR_CHARACTER_ID",
    "sceneId": "YOUR_SCENE_ID",
    "action": "standing confidently with arms crossed, looking at the camera",
    "style": "photorealistic",
    "mood": "confident",
    "shot": "portrait"
  }'
```

The generation will be queued. Check status with:

```bash
curl http://localhost:3000/api/generations/GENERATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Port Already in Use

If ports 3000, 5173, 8000, 5432, 6379, or 9000 are already in use:

1. Stop conflicting services
2. Or modify ports in respective `.env` files and `docker-compose.yml`

### Prisma Client Not Found

```bash
cd api
pnpm prisma:generate
```

### Python Dependencies Installation Fails

Make sure you have Python 3.10+ and pip installed:

```bash
python3 --version
pip3 --version
```

For PyTorch with CUDA support:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### MinIO Bucket Not Created

Recreate the bucket manually:

```bash
docker exec -it studio-minio-setup sh
mc alias set myminio http://minio:9000 minioadmin minioadmin
mc mb myminio/studio-assets
mc anonymous set download myminio/studio-assets
```

### Image Generation is Slow

- Use `DEVICE=cuda` if you have an NVIDIA GPU
- Reduce `DEFAULT_STEPS` in inference server `.env` (try 20 instead of 30)
- Use a smaller model (requires code changes)

## Development Tools

### Prisma Studio

Visual database browser:

```bash
pnpm prisma:studio
```

Opens at `http://localhost:5555`

### Redis Commander (Optional)

```bash
docker run -d --name redis-commander \
  --link studio-redis:redis \
  -p 8081:8081 \
  rediscommander/redis-commander
```

Access at `http://localhost:8081`

### Bull Board (Queue Dashboard)

TODO: Add Bull Board integration to API for queue monitoring.

## Next Steps

- Update frontend to connect to the API
- Implement real Auth.js integration (currently using simple JWT)
- Add file upload for character reference images
- Implement character training pipeline
- Add WebSocket support for real-time job updates
- Deploy to production (Fly.io/Railway for API, Runpod for inference)

## Production Deployment Notes

### API Deployment

- Set all environment variables in production
- Use a real PostgreSQL database (not local Docker)
- Use managed Redis (Redis Cloud, Upstash, etc.)
- Use AWS S3 or Cloudflare R2 (not MinIO)
- Set `NODE_ENV=production`

### Inference Deployment

1. Build Docker image: `docker build -t studio-inference ./inference-server`
2. Push to Runpod:
   - Create Runpod Serverless endpoint
   - Use the built image
   - Set environment variables
   - Configure webhook to API callback URL
3. Update API to enqueue to Runpod webhook instead of local Redis

See deployment docs for detailed instructions.
