import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

// Wraps an async controller so any rejected promise / thrown error is passed
// to Express's centralized error handler instead of crashing the process.
export const asyncHandler = (fn: AsyncFn): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
