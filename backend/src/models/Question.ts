import { Schema, model, Document, Types } from 'mongoose';

export type QuestionStatus = 'unanswered' | 'answered' | 'archived';

export interface IAttachment {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  questionId: string;
  userId: Types.ObjectId;
  isAnonymous: boolean;
  name?: string;
  department: string;
  location: string;
  category: string;
  questionText: string;
  attachments: IAttachment[];
  status: QuestionStatus;
  answer?: string;
  answeredBy?: Types.ObjectId;
  answeredByName?: string;
  answeredAt?: Date;
  sessionFlagged: boolean; // "mark for later" during a live session
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    questionId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isAnonymous: { type: Boolean, default: false },
    name: { type: String, trim: true, maxlength: 120 },
    department: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    questionText: { type: String, required: true, trim: true, maxlength: 1000 },
    attachments: { type: [attachmentSchema], default: [] },
    status: {
      type: String,
      enum: ['unanswered', 'answered', 'archived'],
      default: 'unanswered',
      index: true,
    },
    answer: { type: String, trim: true, maxlength: 4000 },
    answeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    answeredByName: { type: String },
    answeredAt: { type: Date },
    sessionFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

questionSchema.index({ createdAt: -1 });
questionSchema.index({ questionText: 'text', name: 'text' });

// Hide the submitter's name at the document level whenever a question is
// anonymous, so a stray `.find()` without projection can't leak it.
questionSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    if (ret.isAnonymous) {
      ret.name = null;
    }
    delete ret.__v;
    return ret;
  },
});

export const Question = model<IQuestion>('Question', questionSchema);
