import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { CharacterStatus } from '@prisma/client';

const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10),
  coverImageUrl: z.string().url().optional(),
});

const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(10).optional(),
  coverImageUrl: z.string().url().optional(),
});

export const characterRoutes = async (server: FastifyInstance) => {
  // List user's characters
  server.get('/', async (request, reply) => {
    const characters = await prisma.character.findMany({
      where: { userId: request.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      success: true,
      data: characters,
      error: null,
    });
  });

  // Get single character
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const character = await prisma.character.findFirst({
      where: {
        id,
        userId: request.user!.id,
      },
    });

    if (!character) {
      throw new AppError('Character not found', 404, 'CHARACTER_NOT_FOUND');
    }

    return reply.send({
      success: true,
      data: character,
      error: null,
    });
  });

  // Create character
  server.post('/', async (request, reply) => {
    const body = createCharacterSchema.parse(request.body);

    const character = await prisma.character.create({
      data: {
        ...body,
        userId: request.user!.id,
        status: CharacterStatus.PREPARING,
      },
    });

    // TODO: Enqueue training job here in the future
    // For now, simulate preparation and mark as ready after delay
    setTimeout(async () => {
      await prisma.character.update({
        where: { id: character.id },
        data: { status: CharacterStatus.READY },
      });
    }, 2000);

    return reply.status(201).send({
      success: true,
      data: character,
      error: null,
    });
  });

  // Update character
  server.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateCharacterSchema.parse(request.body);

    // Check ownership
    const existing = await prisma.character.findFirst({
      where: { id, userId: request.user!.id },
    });

    if (!existing) {
      throw new AppError('Character not found', 404, 'CHARACTER_NOT_FOUND');
    }

    const character = await prisma.character.update({
      where: { id },
      data: body,
    });

    return reply.send({
      success: true,
      data: character,
      error: null,
    });
  });

  // Delete character
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    // Check ownership
    const existing = await prisma.character.findFirst({
      where: { id, userId: request.user!.id },
    });

    if (!existing) {
      throw new AppError('Character not found', 404, 'CHARACTER_NOT_FOUND');
    }

    await prisma.character.delete({ where: { id } });

    return reply.status(204).send();
  });
};
