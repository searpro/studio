import { Worker, Job as BullJob } from 'bullmq';
import { redis } from '../lib/redis.js';
import { prisma } from '../lib/prisma.js';
import { JobStatus, GenerationStatus } from '@prisma/client';
import type { JobPayload } from './index.js';

const INFERENCE_SERVER_URL = process.env.INFERENCE_SERVER_URL || 'http://localhost:8000';

/**
 * Process a generation job by calling the inference server
 */
async function processGenerationJob(job: BullJob<JobPayload>): Promise<void> {
  const { jobId, type, userId, data } = job.data;
  
  console.log(`[Worker] Processing job ${jobId} of type ${type}`);

  try {
    // Update job status to processing
    await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.PROCESSING },
    });

    // Update generation status
    const dbJob = await prisma.job.findUnique({
      where: { id: jobId },
      select: { generationId: true },
    });

    if (dbJob?.generationId) {
      await prisma.generation.update({
        where: { id: dbJob.generationId },
        data: { status: GenerationStatus.PROCESSING },
      });
    }

    // Call inference server
    const response = await fetch(`${INFERENCE_SERVER_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId,
        type,
        userId,
        data,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Inference server error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Worker] Job ${jobId} completed:`, result);

  } catch (error) {
    console.error(`[Worker] Job ${jobId} failed:`, error);
    
    // Update job as failed
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Update generation as failed
    const dbJob = await prisma.job.findUnique({
      where: { id: jobId },
      select: { generationId: true },
    });

    if (dbJob?.generationId) {
      await prisma.generation.update({
        where: { id: dbJob.generationId },
        data: { status: GenerationStatus.FAILED },
      });
    }

    throw error; // Re-throw to trigger BullMQ retry logic
  }
}

/**
 * Start the generation queue worker
 */
export function startGenerationWorker() {
  const worker = new Worker<JobPayload>(
    'generation-queue',
    processGenerationJob,
    {
      connection: redis,
      concurrency: 1, // Process one job at a time to avoid GPU contention
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[Worker] Worker error:', err);
  });

  console.log('[Worker] Generation worker started');
  return worker;
}

/**
 * Start all workers
 */
export function startWorkers() {
  startGenerationWorker();
  console.log('[Worker] All workers started');
}
