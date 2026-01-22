# Studio - Deployment Guide

## Architecture Overview

### Production Stack

- **API**: Fly.io or Railway
- **Frontend**: Vercel or Cloudflare Pages
- **Database**: Neon, Supabase, or Railway Postgres
- **Redis**: Upstash or Redis Cloud
- **Storage**: AWS S3 or Cloudflare R2
- **Inference**: Runpod Serverless

## API Deployment (Fly.io Example)

### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. Create Fly App

```bash
cd api
fly launch --name studio-api --region sjc
```

### 3. Set Environment Variables

```bash
fly secrets set \
  DATABASE_URL="postgresql://..." \
  REDIS_URL="redis://..." \
  JWT_SECRET="$(openssl rand -base64 32)" \
  AUTH_SECRET="$(openssl rand -base64 32)" \
  S3_ENDPOINT="https://s3.amazonaws.com" \
  S3_BUCKET="studio-assets" \
  S3_REGION="us-east-1" \
  S3_ACCESS_KEY_ID="..." \
  S3_SECRET_ACCESS_KEY="..." \
  CORS_ORIGIN="https://studio.example.com"
```

### 4. Create Dockerfile for API

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### 5. Deploy

```bash
fly deploy
```

## Frontend Deployment (Vercel)

### 1. Update Frontend API URL

Create `frontend/.env.production`:

```
VITE_API_URL=https://studio-api.fly.dev
```

### 2. Deploy to Vercel

```bash
cd frontend
npx vercel --prod
```

## Inference Server Deployment (Runpod)

### 1. Build and Push Docker Image

```bash
cd inference-server

# Build
docker build -t your-registry/studio-inference:latest .

# Push to registry
docker push your-registry/studio-inference:latest
```

### 2. Create Runpod Serverless Endpoint

1. Go to Runpod console
2. Create new Serverless Endpoint
3. Use your Docker image
4. Set environment variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET`
   - `S3_REGION`
   - `API_CALLBACK_URL`
   - `DEVICE=cuda`

### 3. Update API Queue Configuration

Update `api/src/queue/index.ts` to call Runpod webhook instead of Redis queue.

## Database Migration

Run migrations in production:

```bash
# Fly.io example
fly ssh console -C "cd /app && node_modules/.bin/prisma migrate deploy"
```

## Monitoring

### API Monitoring

- Use Fly.io metrics or Railway dashboard
- Set up log aggregation (Papertrail, Datadog)
- Add Sentry for error tracking

### Inference Monitoring

- Monitor Runpod logs
- Track job success/failure rates
- Set up alerts for high failure rates

## Scaling

### API Scaling

```bash
# Fly.io
fly scale count 2  # Horizontal scaling
fly scale vm shared-cpu-2x  # Vertical scaling
```

### Inference Scaling

- Adjust Runpod worker count based on demand
- Set min/max workers
- Configure idle timeout

## Cost Optimization

### Compute
- Use Fly.io shared CPU for API (starts at $0)
- Use Runpod Spot instances for inference (70% cheaper)

### Storage
- Use Cloudflare R2 (no egress fees)
- Set image expiration policies

### Database
- Use Neon free tier for testing
- Enable connection pooling

### Estimated Monthly Costs
- API: $5-20 (Fly.io)
- Database: $0-25 (Neon/Supabase)
- Redis: $0-10 (Upstash)
- Storage: $5-50 (depends on volume)
- Inference: $0.10-0.50 per GPU hour

## Security Checklist

- [ ] Set strong JWT secrets
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable Prisma connection pooling
- [ ] Set up database backups
- [ ] Implement API authentication for inference callbacks
- [ ] Use signed S3 URLs for sensitive images
- [ ] Enable logging and monitoring

## Backup Strategy

### Database Backups

Most managed providers (Neon, Supabase) include automatic backups.

Manual backup:

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Storage Backups

Enable S3 versioning:

```bash
aws s3api put-bucket-versioning \
  --bucket studio-assets \
  --versioning-configuration Status=Enabled
```

## Rollback Procedure

### API Rollback

```bash
# Fly.io
fly releases
fly releases rollback <version>
```

### Database Rollback

```bash
# Use Prisma migrations
npx prisma migrate resolve --rolled-back <migration-name>
```

## Support & Troubleshooting

### Check API Health

```bash
curl https://studio-api.fly.dev/health
```

### Check Logs

```bash
# Fly.io
fly logs

# Runpod
Check Runpod dashboard
```

### Common Issues

1. **Database connection errors**: Check connection string and firewall rules
2. **Redis connection timeout**: Verify Redis URL and network access
3. **S3 upload failures**: Check credentials and bucket permissions
4. **Inference timeout**: Increase worker timeout in Runpod settings

---

For more help, see documentation or open an issue.
