import { Request, Response } from 'express';
import { Question, QUESTION_SCOPES, QuestionScope } from '../models/Question';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { requireString, parseBoolean } from '../utils/validate';
import { generateQuestionId } from '../services/questionIdService';
import { emitNewQuestion } from '../sockets/index';
import path from 'path';

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const isAnonymous = parseBoolean(req.body?.isAnonymous);
  const department = requireString(req.body?.department, 'Department');
  const scope = requireString(req.body?.scope, 'Scope') as QuestionScope;
  if (!QUESTION_SCOPES.includes(scope)) {
    throw ApiError.badRequest('Scope must be One Earth, Sites or Other.');
  }
  const location = requireString(req.body?.location, 'Location');
  const category = requireString(req.body?.category, 'Category');
  const questionText = requireString(req.body?.questionText, 'Question', { maxLength: 1000 });

  let name: string | undefined;
  if (!isAnonymous) {
    name = requireString(req.body?.name, 'Name');
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const attachments = files.map((f) => ({
    fileName: f.filename,
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
    path: path.basename(f.path),
  }));

  const questionId = await generateQuestionId();

  const question = await Question.create({
    questionId,
    userId: req.user.id,
    isAnonymous,
    name: isAnonymous ? undefined : name,
    department,
    scope,
    location,
    category,
    questionText,
    attachments,
    status: 'unanswered',
  });

  emitNewQuestion(question);

  res.status(201).json({ success: true, question });
});

export const getMyQuestions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '20'), 10), 1), 100);
  const status = req.query.status as string | undefined;
  const scope = req.query.scope as string | undefined;

  const filter: Record<string, unknown> = { userId: req.user.id };
  if (status && status !== 'all') filter.status = status;
  if (scope && scope !== 'all') {
    if (!(QUESTION_SCOPES as readonly string[]).includes(scope)) {
      throw ApiError.badRequest('Invalid scope filter.');
    }
    // Questions created before scope existed have no value — treat them as "other".
    if (scope === 'other') {
      filter.$or = [{ scope: 'other' }, { scope: { $exists: false } }];
    } else {
      filter.scope = scope;
    }
  }

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Question.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    questions,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
});

export const getMyQuestionById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const question = await Question.findOne({
    questionId: req.params.questionId,
    userId: req.user.id,
  });
  if (!question) throw ApiError.notFound('Question not found.');

  res.status(200).json({ success: true, question });
});
