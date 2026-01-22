import type { FastifyRequest, FastifyReply, FastifyError } from 'fastify';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = async (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);

  const statusCode = error.statusCode || 500;
  const code = (error as ApiError).code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'An unexpected error occurred';

  return reply.status(statusCode).send({
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  });
};

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'APP_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}
