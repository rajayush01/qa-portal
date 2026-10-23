import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { requireString } from '../utils/validate';
import { emitTaxonomyChanged } from '../sockets/index';

export const listTaxonomy = asyncHandler(async (_req: Request, res: Response) => {
  const [categories, departments] = await Promise.all([
    Category.find({ kind: 'category', isActive: true }).sort({ order: 1, name: 1 }),
    Category.find({ kind: 'department', isActive: true }).sort({ order: 1, name: 1 }),
  ]);
  res.status(200).json({ success: true, categories, departments });
});

export const createTaxonomyEntry = asyncHandler(async (req: Request, res: Response) => {
  const name = requireString(req.body?.name, 'Name', { maxLength: 60 });
  const kind = req.body?.kind === 'department' ? 'department' : 'category';

  const existing = await Category.findOne({ name, kind });
  if (existing) throw ApiError.conflict(`"${name}" already exists.`);

  // New entries go to the end of their list.
  const last = await Category.findOne({ kind }).sort({ order: -1 }).select('order');
  const entry = await Category.create({ name, kind, isActive: true, order: (last?.order ?? 0) + 1 });
  emitTaxonomyChanged();
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
  emitTaxonomyChanged();
  res.status(200).json({ success: true, entry });
});

export const deleteTaxonomyEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await Category.findById(req.params.id);
  if (!entry) throw ApiError.notFound('Entry not found.');
  await entry.deleteOne();
  emitTaxonomyChanged();
  res.status(200).json({ success: true, message: 'Deleted.' });
});

// Persist a new dropdown order. `ids` is the full list for one kind, top to bottom.
export const reorderTaxonomy = asyncHandler(async (req: Request, res: Response) => {
  const kind = req.body?.kind === 'department' ? 'department' : req.body?.kind === 'category' ? 'category' : null;
  const ids = req.body?.ids;
  if (!kind || !Array.isArray(ids) || ids.some((i) => typeof i !== 'string')) {
    throw ApiError.badRequest('kind and ids are required.');
  }
  if (new Set(ids).size !== ids.length) throw ApiError.badRequest('Duplicate ids.');

  const existing = await Category.find({ kind }).select('_id');
  const valid = new Set(existing.map((e) => e._id.toString()));
  if (ids.some((i: string) => !valid.has(i))) throw ApiError.badRequest('Unknown entry in list.');

  await Category.bulkWrite(
    ids.map((id: string, idx: number) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: idx + 1 } } },
    }))
  );
  emitTaxonomyChanged();
  res.status(200).json({ success: true });
});
