import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { requireString } from '../utils/validate';

export const listTaxonomy = asyncHandler(async (_req: Request, res: Response) => {
  const [categories, departments] = await Promise.all([
    Category.find({ kind: 'category', isActive: true }).sort({ name: 1 }),
    Category.find({ kind: 'department', isActive: true }).sort({ name: 1 }),
  ]);
  res.status(200).json({ success: true, categories, departments });
});

export const createTaxonomyEntry = asyncHandler(async (req: Request, res: Response) => {
  const name = requireString(req.body?.name, 'Name', { maxLength: 60 });
  const kind = req.body?.kind === 'department' ? 'department' : 'category';

  const existing = await Category.findOne({ name, kind });
  if (existing) throw ApiError.conflict(`"${name}" already exists.`);

  const entry = await Category.create({ name, kind, isActive: true });
  res.status(201).json({ success: true, entry });
});

export const updateTaxonomyEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await Category.findById(req.params.id);
  if (!entry) throw ApiError.notFound('Entry not found.');

  if (req.body?.name !== undefined) {
    entry.name = requireString(req.body.name, 'Name', { maxLength: 60 });
  }
  if (req.body?.isActive !== undefined) {
    entry.isActive = Boolean(req.body.isActive);
  }
  await entry.save();
  res.status(200).json({ success: true, entry });
});

export const deleteTaxonomyEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await Category.findById(req.params.id);
  if (!entry) throw ApiError.notFound('Entry not found.');
  await entry.deleteOne();
  res.status(200).json({ success: true, message: 'Deleted.' });
});
