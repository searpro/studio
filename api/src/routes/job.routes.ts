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

export const jobRoutes = async (server: FastifyInstance) => {
  // Get job status
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        generation: true,
      },
    });

    if (!job) {
      throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
    }

    // Verify ownership via generation
    if (job.generation && job.generation.userId !== request.user!.id) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    return reply.send({
      success: true,
      data: job,
      error: null,
    });
  });
};
