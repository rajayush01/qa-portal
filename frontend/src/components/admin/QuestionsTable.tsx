import { motion } from 'framer-motion';
import { Paperclip, Bookmark } from 'lucide-react';
import { Question } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { QuestionIdChip } from '@/components/common/QuestionBits';

const fmt = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const QuestionsTable = ({
  questions,
  onOpen,
  highlightIds = [],
}: {
  questions: Question[];
  onOpen: (q: Question) => void;
  highlightIds?: string[];
}) => (
  <>
    {/* Desktop table */}
    <div className="hidden overflow-hidden rounded-2xl border border-ink-700 md:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-700 bg-ink-900/80 text-xs uppercase tracking-wide text-ink-400">
            <th className="px-4 py-3 font-medium">Question ID</th>
            <th className="px-4 py-3 font-medium">Submitter</th>
            <th className="px-4 py-3 font-medium">Dept / Category</th>
            <th className="px-4 py-3 font-medium">Question</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <motion.tr
              key={q._id}
              layout
              onClick={() => onOpen(q)}
              className={`cursor-pointer border-b border-ink-800 transition-colors last:border-0 hover:bg-ink-800/60 ${
                highlightIds.includes(q.questionId) ? 'animate-highlightIn' : ''
              }`}
            >
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <QuestionIdChip id={q.questionId} />
                  {q.sessionFlagged && <Bookmark size={13} className="text-signal-amber" />}
                </div>
              </td>
              <td className="px-4 py-3.5 text-ink-300">{q.isAnonymous ? 'Anonymous' : q.name || '—'}</td>
              <td className="px-4 py-3.5 text-ink-300">
                <div>{q.department}</div>
                <div className="text-xs text-ink-500">{q.category}</div>
              </td>
              <td className="max-w-xs px-4 py-3.5">
                <p className="truncate text-ink-200">{q.questionText}</p>
                {q.attachments.length > 0 && (
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                    <Paperclip size={10} />
                    {q.attachments.length}
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 text-xs text-ink-400">{fmt(q.createdAt)}</td>
              <td className="px-4 py-3.5">
                <StatusBadge status={q.status} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile cards */}
    <div className="space-y-3 md:hidden">
      {questions.map((q) => (
        <motion.button
          layout
          key={q._id}
          onClick={() => onOpen(q)}
          className={`w-full rounded-xl border border-ink-700 bg-ink-900/60 p-4 text-left ${
            highlightIds.includes(q.questionId) ? 'animate-highlightIn' : ''
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QuestionIdChip id={q.questionId} />
              {q.sessionFlagged && <Bookmark size={13} className="text-signal-amber" />}
            </div>
            <StatusBadge status={q.status} />
          </div>
          <p className="line-clamp-2 text-sm text-ink-100">{q.questionText}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
            <span>
              {q.department} · {q.category}
            </span>
            <span>{fmt(q.createdAt)}</span>
          </div>
        </motion.button>
      ))}
    </div>
  </>
);
