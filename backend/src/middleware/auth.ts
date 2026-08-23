import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';
import { env } from '../config/env';
import { UserRole } from '../models/User';

// Reads the JWT from the HTTP-only cookie first, falling back to the
// Authorization header (useful for non-browser clients / testing).
const extractToken = (req: Request): string | null => {
  const cookieToken = req.cookies?.[env.COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  return null;
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (!token) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired session'));
  }
};

// The frontend never gets to declare its own role — every privileged route
// re-checks the role that was embedded in the signed JWT on login.
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have access to this resource'));
    }
    next();
  };
};
