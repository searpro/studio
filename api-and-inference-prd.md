# Product Requirements Document (PRD)

## Backend API & Python Inference Server

**Product:** Studio – Asset-based Creative Suite
**Scope:** Backend platform replacing Gemini with custom infrastructure
**Target Stack:** Node.js + Postgres + Prisma + Redis + S3 + Python (Runpod serverless workers)

---

## 1. Objectives

This document defines the requirements for:

* A production-grade **API platform** (Node.js)
* A scalable **job orchestration system** for AI workloads
* A **Python inference service** deployed as Runpod serverless workers
* Persistent storage for assets (characters, scenes, generations)
* Async processing architecture suitable for image generation and future training jobs

Primary goals:

* Replace Gemini dependency
* Enable future support for custom character creation
* Support queue-based async workloads
* Maintain fast perceived UI responsiveness
* Keep architecture extensible for video generation later

---

## 2. System Architecture Overview

High-level flow:

Frontend (React SPA)
→ Node.js API (Auth, DB, orchestration)
→ Redis Queue (job dispatch)
→ Runpod Serverless Worker (Python inference)
→ S3 (image/model storage)
→ Postgres (metadata persistence)
→ Back to frontend via polling / websockets

Core principle:

> API = orchestration + product logic
> Python workers = pure AI execution

---

## 3. Core Services

### 3.1 Node.js API (Control Plane)

Responsibilities:

* Authentication & authorization
* Business logic
* Asset management (characters, scenes)
* Job creation & tracking
* Queueing inference tasks
* Persisting metadata
* Issuing signed S3 URLs

Stack:

* Node.js (Fastify or Express)
* TypeScript
* Prisma ORM
* PostgreSQL
* Redis (BullMQ or similar)
* S3-compatible storage (AWS S3, R2, MinIO)

### 3.2 Python Inference Server (Execution Plane)

Responsibilities:

* Receive jobs from queue
* Run image generation pipeline
* Upload outputs to S3
* Return job status + metadata

Stack:

* Python 3.10+
* FastAPI (optional local dev only)
* SDXL / FLUX pipelines
* Runpod serverless handler
* Torch + Diffusers

Deployed as:

* Runpod Serverless Worker

---

## 4. Data Model (Postgres via Prisma)

### User

* id
* email
* name
* createdAt

### Character

* id
* userId
* name
* status (PREPARING | READY | FAILED)
* coverImageUrl
* createdAt

### Scene

* id
* name
* description
* category
* thumbnailUrl
* isSystem (boolean)

### Generation

* id
* userId
* characterId
* sceneId
* promptText
* style
* mood
* shot
* imageUrl
* status (PENDING | RUNNING | COMPLETE | FAILED)
* createdAt

### Job

* id
* type (GENERATE_IMAGE, TRAIN_CHARACTER)
* status
* payload (jsonb)
* result (jsonb)
* createdAt
* updatedAt

---

## 5. API Responsibilities

### Auth (Phase 1: simple auth; Phase 2: external provider)

* POST /auth/register
* POST /auth/login
* GET /me

### Characters

* POST /characters
* GET /characters
* GET /characters/:id
* DELETE /characters/:id

### Scenes

* GET /scenes
* POST /scenes (admin only initially)

### Generation

* POST /generate
* GET /generations
* GET /generations/:id

### Uploads

* POST /uploads/signed-url

### Jobs (internal mostly)

* GET /jobs/:id

---

## 6. Image Generation Flow (End-to-End)

1. User submits generation request
2. API creates Generation row (status = PENDING)
3. API enqueues job in Redis
4. Runpod worker picks job
5. Worker:

   * Builds inference prompt
   * Runs diffusion pipeline
   * Uploads result to S3
   * Calls back API with result
6. API updates Generation row (COMPLETE)
7. UI polls or receives update

User never waits synchronously on inference.

---

## 7. Queue Design (Redis + BullMQ)

Queue types:

* generation-queue
* training-queue (future)

Job payload example:
{
"jobId": "uuid",
"type": "GENERATE_IMAGE",
"userId": "uuid",
"character": { ... },
"scene": { ... },
"controls": {
"style": "cinematic",
"mood": "dramatic",
"shot": "portrait"
}
}

Queue behavior:

* Retry on failure (max 3)
* Timeout handling
* Dead-letter queue for debugging

---

## 8. Python Inference Worker Spec

### Responsibilities

* Accept job payload
* Translate payload → inference prompt
* Run pipeline (SDXL/FLUX)
* Store result in S3
* Return structured result

### Worker Interface (Runpod handler)

Input:

* JSON payload from queue

Output:
{
"jobId": "uuid",
"status": "success",
"imageUrl": "https://..."
}

### Internal Pipeline (MVP)

* Load base model at container start
* Apply character embedding (later)
* Apply scene conditioning (later)
* Run generation
* Save output

Design constraint:

> Worker must be stateless across requests

---

## 9. Storage Strategy

### S3 Buckets

* /characters/{userId}/{characterId}/images/
* /scenes/system/
* /generations/{userId}/{generationId}.png

All URLs stored in DB are CDN-backed public URLs (or signed).

---

## 10. Observability & Reliability

API:

* Request logging
* Job lifecycle logging
* Prisma query logging (dev)

Workers:

* Per-job logs
* Generation time metrics
* Error capture

Future-ready:

* Prometheus metrics
* Sentry integration

---

## 11. Non-Functional Requirements

* API uptime > 99%
* Inference success rate > 95%
* Average image job latency < 20s
* Horizontal scalability (add more Runpod workers)
* No GPU dependency on main API

---

## 12. Security Requirements

* JWT auth on all endpoints
* User isolation on all assets
* Signed URLs for uploads
* Rate limiting per user
* API validation via Zod or similar

---

## 13. Deployment Strategy

API:

* Dockerized Node.js app
* Deploy on Fly.io / Railway / ECS / Render

Workers:

* Runpod serverless endpoint
* Container includes:

  * Python
  * Torch
  * Diffusers
  * Models cached

---

## 14. Future Extensions (Already Supported by Architecture)

* Character creation pipeline
* Scene fine-tuning
* Video generation jobs
* Multi-image batches
* Credits/billing integration
* WebSocket-based live updates

---

## 15. Core Architectural Principle

> The backend must behave like a creative production pipeline, not like a synchronous AI API wrapper.

Everything is modeled as:

* Assets
* Jobs
* Results
* Reusability

This allows Studio to scale from image generation → training → video → full creative workflows without architectural rewrite.
