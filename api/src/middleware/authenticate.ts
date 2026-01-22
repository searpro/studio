import type { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from './error-handler.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
    } | null;
  }
}

export const authenticateUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const decoded = await request.server.jwt.verify<{ id: string; email: string }>(token);
    
    request.user = {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
};
