import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Building2, MapPin, Tag, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { Question } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { QuestionIdChip, AttachmentList } from '@/components/common/QuestionBits';

const fmt = (d?: string) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export const QuestionDetailModal = ({
  question,
  onClose,
}: {
  question: Question | null;
  onClose: () => void;
}) => (
  <AnimatePresence>
    {question && (
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-ink-600 bg-ink-800 shadow-popover sm:rounded-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-ink-700 bg-ink-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <QuestionIdChip id={question.questionId} />
              {/* <StatusBadge status={question.status} /> */}
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-700 hover:text-ink-100">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-ink-400">
                <UserIcon size={14} />
                {question.isAnonymous ? 'Anonymous' : question.name || '—'}
              </div>
              <div className="flex items-center gap-2 text-ink-400">
                <Calendar size={14} />
                {fmt(question.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-ink-400">
                <Building2 size={14} />
                {question.department}
              </div>
              <div className="flex items-center gap-2 text-ink-400">
                <MapPin size={14} />
                {question.location}
              </div>
              <div className="flex items-center gap-2 text-ink-400">
                <Tag size={14} />
                {question.category}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">Question</p>
              <p className="whitespace-pre-wrap rounded-lg border border-ink-700 bg-ink-900 p-4 text-sm leading-relaxed text-ink-100">
                {question.questionText}
              </p>
            </div>

            {question.attachments.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Attachments</p>
                <AttachmentList questionId={question.questionId} attachments={question.attachments} />
              </div>
            )}

            {question.status === 'answered' ? (
              question.answeredInPerson ? (
                <div className="rounded-lg border border-signal-green/25 bg-signal-green/5 p-4 text-sm text-ink-200">
                  <p className="flex items-center gap-1.5 font-medium text-signal-green">
                    <CheckCircle2 size={15} />
                    Answered in person during the live session
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    This question was addressed verbally, so there's no written reply here.
                  </p>
                  <p className="mt-2 text-xs text-ink-500">
                    Answered {fmt(question.answeredAt)}
                    {question.answeredByName ? ` by ${question.answeredByName}` : ''}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-signal-green">Admin answer</p>
                  <p className="whitespace-pre-wrap rounded-lg border border-signal-green/25 bg-signal-green/5 p-4 text-sm leading-relaxed text-ink-100">
                    {question.answer}
                  </p>
                  <p className="mt-2 text-xs text-ink-500">
                    Answered {fmt(question.answeredAt)}
                    {question.answeredByName ? ` by ${question.answeredByName}` : ''}
                  </p>
                </div>
              )
            ) : (
              <div className="rounded-lg border border-dashed border-ink-600 bg-ink-900/60 p-4 text-center text-sm text-ink-400">
                This question hasn't been answered yet.
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
