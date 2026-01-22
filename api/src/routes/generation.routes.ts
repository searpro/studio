import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { GenerationStatus, JobType, CharacterStatus } from '@prisma/client';
import { addGenerationJob } from '../queue/index.js';
import { nanoid } from 'nanoid';

const createGenerationSchema = z.object({
  characterId: z.string(),
  sceneId: z.string(),
  action: z.string().min(5),
  style: z.enum(['photorealistic', 'cinematic', 'illustration', 'anime']),
  mood: z.string(),
  shot: z.enum(['close-up', 'portrait', 'full-body', 'wide-angle']),
});

export const generationRoutes = async (server: FastifyInstance) => {
  // List user's generations
  server.get('/', async (request, reply) => {
    const generations = await prisma.generation.findMany({
      where: { userId: request.user!.id },
      include: {
        character: {
          select: { id: true, name: true, coverImageUrl: true },
        },
        scene: {
          select: { id: true, name: true, thumbnailUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reply.send({
      success: true,
      data: generations,
      error: null,
    });
  });

  // Get single generation
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const generation = await prisma.generation.findFirst({
      where: {
        id,
        userId: request.user!.id,
      },
      include: {
        character: true,
        scene: true,
      },
    });

    if (!generation) {
      throw new AppError('Generation not found', 404, 'GENERATION_NOT_FOUND');
    }

    return reply.send({
      success: true,
      data: generation,
      error: null,
    });
  });

  // Create generation
  server.post('/', async (request, reply) => {
    const body = createGenerationSchema.parse(request.body);

    // Verify character ownership and status
    const character = await prisma.character.findFirst({
      where: {
        id: body.characterId,
        userId: request.user!.id,
      },
    });

    if (!character) {
      throw new AppError('Character not found', 404, 'CHARACTER_NOT_FOUND');
    }

    if (character.status !== CharacterStatus.READY) {
      throw new AppError('Character is not ready', 400, 'CHARACTER_NOT_READY');
    }

    // Verify scene access
    const scene = await prisma.scene.findFirst({
      where: {
        id: body.sceneId,
        OR: [
          { isSystem: true },
          { userId: request.user!.id },
        ],
      },
    });

    if (!scene) {
      throw new AppError('Scene not found', 404, 'SCENE_NOT_FOUND');
    }

    // Build prompt
    const promptText = buildPrompt(character, scene, body);

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        userId: request.user!.id,
        characterId: body.characterId,
        sceneId: body.sceneId,
        action: body.action,
        style: body.style,
        mood: body.mood,
        shot: body.shot,
        promptText,
        status: GenerationStatus.PENDING,
      },
    });

    // Create job
    const jobId = nanoid();
    await prisma.job.create({
      data: {
        id: jobId,
        type: JobType.GENERATE_IMAGE,
        generationId: generation.id,
        payload: {
          generationId: generation.id,
          character: {
            id: character.id,
            name: character.name,
            description: character.description,
          },
          scene: {
            id: scene.id,
            name: scene.name,
            description: scene.description,
          },
          controls: {
            action: body.action,
            style: body.style,
            mood: body.mood,
            shot: body.shot,
          },
        },
      },
    });

    // Enqueue job
    await addGenerationJob({
      jobId,
      type: JobType.GENERATE_IMAGE,
      userId: request.user!.id,
      data: {
        generationId: generation.id,
        character,
        scene,
        controls: body,
      },
    });

    return reply.status(201).send({
      success: true,
      data: generation,
      error: null,
    });
  });

  // Delete generation
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const generation = await prisma.generation.findFirst({
      where: {
        id,
        userId: request.user!.id,
      },
    });

    if (!generation) {
      throw new AppError('Generation not found', 404, 'GENERATION_NOT_FOUND');
    }

    await prisma.generation.delete({ where: { id } });

    return reply.status(204).send();
  });
};

function buildPrompt(
  character: { name: string; description: string },
  scene: { name: string; description: string },
  controls: { action: string; style: string; mood: string; shot: string }
): string {
  return `Generate a ${controls.style} style image.

CORE ASSETS:
- Character: ${character.description}
- Setting: ${scene.description}

SCENE DESCRIPTION / ACTION:
${controls.action}

ART DIRECTION:
- Mood: ${controls.mood}
- Shot Type: ${controls.shot}`;
}
