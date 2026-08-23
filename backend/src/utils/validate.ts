import { ApiError } from './ApiError';

export const requireString = (
  value: unknown,
  field: string,
  { maxLength, minLength = 1 }: { maxLength?: number; minLength?: number } = {}
): string => {
  if (typeof value !== 'string' || value.trim().length < minLength) {
    throw ApiError.badRequest(`${field} is required.`);
  }
  const trimmed = value.trim();
  if (maxLength && trimmed.length > maxLength) {
    throw ApiError.badRequest(`${field} must be ${maxLength} characters or fewer.`);
  }
  return trimmed;
};

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
};
