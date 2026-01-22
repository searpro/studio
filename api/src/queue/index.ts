import { Queue, Worker, Job as BullJob } from 'bullmq';
import { redis } from '../lib/redis.js';
import type { JobType } from '@prisma/client';

export interface JobPayload {
  jobId: string;
  type: JobType;
  userId: string;
  data: unknown;
}

export const generationQueue = new Queue('generation-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const trainingQueue = new Queue('training-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
});

export const addGenerationJob = async (payload: JobPayload) => {
  return await generationQueue.add('generate-image', payload, {
    jobId: payload.jobId,
  });
};

export const addTrainingJob = async (payload: JobPayload) => {
  return await trainingQueue.add('train-character', payload, {
    jobId: payload.jobId,
  });
};
