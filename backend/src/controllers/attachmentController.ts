import { Request, Response } from 'express';
import path from 'path';
import { Question } from '../models/Question';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadRoot } from '../middleware/upload';

// A user may only fetch an attachment on a question they own; an admin may
// fetch any attachment. This is enforced server-side regardless of what
// filename the client requests.
export const downloadAttachment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { questionId, fileName } = req.params;
  const question = await Question.findOne({ questionId });
  if (!question) throw ApiError.notFound('Question not found.');

  const isOwner = question.userId.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have access to this file.');
  }

  const attachment = question.attachments.find((a) => a.fileName === fileName);
  if (!attachment) throw ApiError.notFound('Attachment not found.');

  const filePath = path.join(uploadRoot, attachment.fileName);
  res.download(filePath, attachment.originalName);
});
