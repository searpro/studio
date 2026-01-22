import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { SceneCategory } from '@prisma/client';

const createSceneSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10),
  category: z.nativeEnum(SceneCategory),
  thumbnailUrl: z.string().url().optional(),
});

export const sceneRoutes = async (server: FastifyInstance) => {
  // List all available scenes (system + user's)
  server.get('/', async (request, reply) => {
    const scenes = await prisma.scene.findMany({
      where: {
        OR: [
          { isSystem: true },
          { userId: request.user!.id },
        ],
      },
      orderBy: [
        { isSystem: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return reply.send({
      success: true,
      data: scenes,
      error: null,
    });
  });

  // Get single scene
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const scene = await prisma.scene.findFirst({
      where: {
        id,
        OR: [
          { isSystem: true },
          { userId: request.user!.id },
        ],
      },
    });

    if (!scene) {
      throw new AppError('Scene not found', 404, 'SCENE_NOT_FOUND');
    }

    return reply.send({
      success: true,
      data: scene,
      error: null,
    });
  });

  // Create scene
  server.post('/', async (request, reply) => {
    const body = createSceneSchema.parse(request.body);

    const scene = await prisma.scene.create({
      data: {
        ...body,
        userId: request.user!.id,
        isSystem: false,
      },
    });

    return reply.status(201).send({
      success: true,
      data: scene,
      error: null,
    });
  });

  // Delete scene (user's only)
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const scene = await prisma.scene.findFirst({
      where: {
        id,
        userId: request.user!.id,
        isSystem: false,
      },
    });

    if (!scene) {
      throw new AppError('Scene not found or cannot be deleted', 404, 'SCENE_NOT_FOUND');
    }

    await prisma.scene.delete({ where: { id } });

    return reply.status(204).send();
  });
};
