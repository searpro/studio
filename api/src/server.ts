import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import { config } from './config/index.js';
import { prisma } from './lib/prisma.js';
import { authRoutes } from './routes/auth.routes.js';
import { characterRoutes } from './routes/character.routes.js';
import { sceneRoutes } from './routes/scene.routes.js';
import { generationRoutes } from './routes/generation.routes.js';
import { jobRoutes } from './routes/job.routes.js';
import { publicJobRoutes } from './routes/job-callback.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { authenticateUser } from './middleware/authenticate.js';
import { startWorkers } from './queue/worker.js';

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register plugins
await server.register(cors, {
  origin: config.corsOrigin.split(','),
  credentials: true,
});

await server.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

await server.register(jwt, {
  secret: config.jwtSecret,
});

// Decorate request with user (only if not already decorated)
if (!server.hasRequestDecorator('user')) {
  server.decorateRequest('user', null);
}

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Auth routes (public)
server.register(authRoutes, { prefix: '/api/auth' });

// Public job callback (for inference server)
server.register(publicJobRoutes, { prefix: '/api/jobs' });

// Protected routes
server.register(
  async (protectedServer) => {
    protectedServer.addHook('onRequest', authenticateUser);
    
    protectedServer.register(characterRoutes, { prefix: '/api/characters' });
    protectedServer.register(sceneRoutes, { prefix: '/api/scenes' });
    protectedServer.register(generationRoutes, { prefix: '/api/generations' });
    protectedServer.register(jobRoutes, { prefix: '/api/jobs' });
  }
);

// Error handler
server.setErrorHandler(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  server.log.info('Shutting down gracefully...');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async () => {
  try {
    // Start queue workers
    startWorkers();
    
    await server.listen({
      port: config.port,
      host: config.host,
    });
    server.log.info(`Server listening on ${config.host}:${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
