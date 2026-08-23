import { motion } from 'framer-motion';
import { Paperclip, ChevronRight } from 'lucide-react';
import { Question } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { QuestionIdChip } from '@/components/common/QuestionBits';

const fmt = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const QuestionCard = ({ question, onOpen }: { question: Question; onOpen: () => void }) => (
  <motion.button
    layout
    onClick={onOpen}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full rounded-2xl border border-ink-700 bg-ink-900/60 p-5 text-left transition-colors hover:border-ink-500"
  >
    <div className="mb-3 flex items-center justify-between">
      <QuestionIdChip id={question.questionId} />
      <StatusBadge status={question.status} />
    </div>
    <p className="line-clamp-2 text-sm leading-relaxed text-ink-100">{question.questionText}</p>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
        <span>{question.category}</span>
        <span className="h-1 w-1 rounded-full bg-ink-600" />
        <span>{fmt(question.createdAt)}</span>
        {question.attachments.length > 0 && (
          <span className="flex items-center gap-1">
            <Paperclip size={11} />
            {question.attachments.length}
          </span>
        )}
      </div>
      <ChevronRight size={16} className="text-ink-500" />
    </div>
  </motion.button>
);
