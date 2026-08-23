import { Schema, model, Document, Types } from 'mongoose';

export type TaxonomyKind = 'category' | 'department';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  kind: TaxonomyKind;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    kind: { type: String, enum: ['category', 'department'], required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, kind: 1 }, { unique: true });

export const Category = model<ICategory>('Category', categorySchema);
