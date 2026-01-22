import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { GenerationStatus, JobStatus } from '@prisma/client';

const jobCallbackSchema = z.object({
  jobId: z.string(),
  status: z.enum(['success', 'failed']),
  imageUrl: z.string().url().optional(),
  error: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Public job routes (no auth required)
 * Used for callbacks from the inference server
 */
export const publicJobRoutes = async (server: FastifyInstance) => {
  // Callback from inference worker
  server.post('/callback', async (request, reply) => {
    const body = jobCallbackSchema.parse(request.body);

    console.log(`[Job Callback] Received callback for job ${body.jobId}:`, body.status);

    const job = await prisma.job.findUnique({
      where: { id: body.jobId },
      include: { generation: true },
    });

    if (!job) {
      throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
    }

    if (body.status === 'success') {
      // Update job
      await prisma.job.update({
        where: { id: body.jobId },
        data: {
          status: JobStatus.COMPLETE,
          result: body.metadata || {},
        },
      });

      // Update generation
      if (job.generationId) {
        await prisma.generation.update({
          where: { id: job.generationId },
          data: {
            status: GenerationStatus.COMPLETE,
            imageUrl: body.imageUrl,
            metadata: body.metadata || {},
          },
        });
      }

      console.log(`[Job Callback] Job ${body.jobId} marked as complete`);
    } else {
      // Update job as failed
      await prisma.job.update({
        where: { id: body.jobId },
        data: {
          status: JobStatus.FAILED,
          error: body.error || 'Unknown error',
        },
      });

      // Update generation
      if (job.generationId) {
        await prisma.generation.update({
          where: { id: job.generationId },
          data: {
            status: GenerationStatus.FAILED,
          },
        });
      }

      console.log(`[Job Callback] Job ${body.jobId} marked as failed:`, body.error);
    }

    return reply.send({
      success: true,
      data: { message: 'Callback processed' },
      error: null,
    });
  });
};
