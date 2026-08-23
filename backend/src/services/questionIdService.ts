import { Question } from '../models/Question';

/**
 * Generates a sequential, year-scoped, human-readable Question ID, e.g. Q-2026-000123.
 * Uses a findOneAndUpdate-based counter document to stay atomic under concurrent
 * submissions instead of doing a racy "count + 1".
 */
import { Schema, model } from 'mongoose';

interface ICounter {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = model<ICounter>('Counter', counterSchema);

export const generateQuestionId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const counterId = `question-${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.seq).padStart(6, '0');
  const candidate = `Q-${year}-${padded}`;

  // Extremely defensive uniqueness check in case the counter collection was
  // ever reset out of sync with the questions collection.
  const exists = await Question.exists({ questionId: candidate });
  if (exists) {
    const fallback = `Q-${year}-${padded}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    return fallback;
  }

  return candidate;
};
