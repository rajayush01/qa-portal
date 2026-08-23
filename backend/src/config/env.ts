import dotenv from 'dotenv';
dotenv.config();

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  MONGO_URI: required('MONGO_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  COOKIE_NAME: process.env.COOKIE_NAME ?? 'qa_portal_token',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10),
  MAX_FILES_PER_QUESTION: parseInt(process.env.MAX_FILES_PER_QUESTION ?? '5', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10),
  IS_PROD: (process.env.NODE_ENV ?? 'development') === 'production',
};
