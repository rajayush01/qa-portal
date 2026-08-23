import { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../utils/jwt';
import { requireString, isValidEmail } from '../utils/validate';
import { env } from '../config/env';

const cookieOptions = {
  httpOnly: true,
  secure: env.IS_PROD,
  sameSite: env.IS_PROD ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

// A single login endpoint for both roles: the ROLE is whatever is stored on
// the user record in the database, never something the client can assert.
export const login = asyncHandler(async (req: Request, res: Response) => {
  const email = requireString(req.body?.email, 'Email').toLowerCase();
  const password = requireString(req.body?.password, 'Password');

  if (!isValidEmail(email)) {
    throw ApiError.badRequest('Enter a valid email address.');
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
  });

  res.cookie(env.COOKIE_NAME, token, cookieOptions);
  res.status(200).json({
    success: true,
    token, // also returned for clients that prefer header-based auth
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      location: user.location,
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.status(200).json({ success: true, message: 'Logged out.' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await User.findById(req.user.id);
  if (!user || !user.isActive) throw ApiError.unauthorized('Session no longer valid.');
  res.status(200).json({ success: true, user });
});
