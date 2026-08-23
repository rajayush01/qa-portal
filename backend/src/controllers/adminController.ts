import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Question, IQuestion } from '../models/Question';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { requireString } from '../utils/validate';
import { emitQuestionAnswered } from '../sockets/index';
import { streamQuestionsExcel } from '../services/excelExportService';

const DATE_PRESETS: Record<string, () => Date> = {
  today: () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  },
  yesterday: () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  last7: () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  },
  last30: () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  },
};

// Shared filter builder so the listing endpoint and the export endpoint
// always interpret the same query params identically.
const buildFilter = (query: Request['query']): FilterQuery<IQuestion> => {
  const filter: FilterQuery<IQuestion> = {};

  const search = (query.search as string | undefined)?.trim();
  if (search) {
    filter.$or = [
      { questionId: { $regex: search, $options: 'i' } },
      { questionText: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  const status = query.status as string | undefined;
  if (status && status !== 'all') filter.status = status;

  const department = query.department as string | undefined;
  if (department && department !== 'all') filter.department = department;

  const category = query.category as string | undefined;
  if (category && category !== 'all') filter.category = category;

  const location = query.location as string | undefined;
  if (location && location !== 'all') filter.location = location;

  const sessionFlagged = query.sessionFlagged as string | undefined;
  if (sessionFlagged === 'true') filter.sessionFlagged = true;

  const datePreset = query.datePreset as string | undefined;
  const from = query.dateFrom as string | undefined;
  const to = query.dateTo as string | undefined;

  if (datePreset === 'yesterday') {
    const start = DATE_PRESETS.yesterday();
    const end = DATE_PRESETS.today();
    filter.createdAt = { $gte: start, $lt: end };
  } else if (datePreset && DATE_PRESETS[datePreset]) {
    filter.createdAt = { $gte: DATE_PRESETS[datePreset]() };
  } else if (from || to) {
    filter.createdAt = {};
    if (from) (filter.createdAt as any).$gte = new Date(from);
    if (to) (filter.createdAt as any).$lte = new Date(to);
  }

  return filter;
};

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const todayStart = DATE_PRESETS.today();

  const [total, unanswered, answered, today] = await Promise.all([
    Question.countDocuments({}),
    Question.countDocuments({ status: 'unanswered' }),
    Question.countDocuments({ status: 'answered' }),
    Question.countDocuments({ createdAt: { $gte: todayStart } }),
  ]);

  res.status(200).json({ success: true, stats: { total, unanswered, answered, today } });
});

export const listQuestions = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '25'), 10), 1), 100);
  const filter = buildFilter(req.query);

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ sessionFlagged: -1, createdAt: -1 })
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

export const getQuestionById = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findOne({ questionId: req.params.questionId });
  if (!question) throw ApiError.notFound('Question not found.');
  res.status(200).json({ success: true, question });
});

export const answerQuestion = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const answer = requireString(req.body?.answer, 'Answer', { maxLength: 4000 });

  const question = await Question.findOne({ questionId: req.params.questionId });
  if (!question) throw ApiError.notFound('Question not found.');

  if (question.status === 'answered') {
    throw ApiError.conflict('This question has already been answered.');
  }

  question.answer = answer;
  question.answeredBy = req.user.id as any;
  question.answeredByName = req.user.name;
  question.answeredAt = new Date();
  question.status = 'answered';
  question.sessionFlagged = false;
  await question.save();

  emitQuestionAnswered(question);

  res.status(200).json({ success: true, question });
});

export const flagForLater = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findOne({ questionId: req.params.questionId });
  if (!question) throw ApiError.notFound('Question not found.');

  question.sessionFlagged = true;
  await question.save();

  res.status(200).json({ success: true, question });
});

export const exportQuestions = asyncHandler(async (req: Request, res: Response) => {
  const exportAll = req.query.all === 'true';
  const filter = exportAll ? {} : buildFilter(req.query);

  const questions = await Question.find(filter).sort({ createdAt: -1 });
  await streamQuestionsExcel(res, questions, exportAll ? 'all-questions' : 'filtered-questions');
});

export const getFacets = asyncHandler(async (_req: Request, res: Response) => {
  const [departments, categories, locations] = await Promise.all([
    Question.distinct('department'),
    Question.distinct('category'),
    Question.distinct('location'),
  ]);
  res.status(200).json({ success: true, facets: { departments, categories, locations } });
});
