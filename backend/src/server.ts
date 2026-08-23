import http from 'http';
import { createApp } from './app';
import { connectDB } from './config/db';
import { initSocket } from './sockets/index';
import { env } from './config/env';

const start = async (): Promise<void> => {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);

  server.listen(env.PORT, () => {
    console.log(`[server] Q&A Portal API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string) => {
    console.log(`[server] Received ${signal}, shutting down gracefully...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
