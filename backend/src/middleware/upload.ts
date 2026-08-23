import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx']);

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

// Never trust the client-reported mimetype alone — cross-check the file
// extension too. (Deep content-sniffing/AV scanning belongs in a real
// deployment; this is the surface-level guard the app enforces itself.)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new ApiError(
        400,
        `Unsupported file type "${ext || file.mimetype}". Allowed: PDF, DOC, DOCX, XLS, XLSX.`
      )
    );
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: env.MAX_FILES_PER_QUESTION,
  },
});

export { uploadRoot };
