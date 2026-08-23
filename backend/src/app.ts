import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
// xss-clean has no types; imported via require for compatibility with strict TS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const xssClean = require('xss-clean');

import { env } from './config/env';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import questionRoutes from './routes/questionRoutes';
import adminRoutes from './routes/adminRoutes';
import categoryRoutes from './routes/categoryRoutes';
import attachmentRoutes from './routes/attachmentRoutes';

export const createApp = (): Application => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xssClean());
  app.use(morgan(env.IS_PROD ? 'combined' : 'dev'));
  app.use(generalLimiter);

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'OK', time: new Date().toISOString() });
  });

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/attachments', attachmentRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
