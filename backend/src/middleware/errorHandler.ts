import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'One or more files exceed the maximum allowed size.'
        : err.code === 'LIMIT_FILE_COUNT'
        ? 'Too many files attached to this question.'
        : err.message;
    res.status(400).json({ success: false, message });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
    return;
  }

  // Mongoose validation errors
  if (err && typeof err === 'object' && (err as any).name === 'ValidationError') {
    res.status(400).json({ success: false, message: (err as Error).message });
    return;
  }

  // Mongo duplicate key
  if (err && typeof err === 'object' && (err as any).code === 11000) {
    res.status(409).json({ success: false, message: 'A record with this value already exists.' });
    return;
  }

  console.error('[unhandled error]', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again.',
    stack: env.IS_PROD ? undefined : (err as Error)?.stack,
  });
};
