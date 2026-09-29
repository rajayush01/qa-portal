import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Calendar, Building2, Layers, MapPin, Tag, User as UserIcon, Bookmark, CheckCircle2 } from 'lucide-react';
import { Question } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { QuestionIdChip, AttachmentList } from '@/components/common/QuestionBits';
import { scopeLabel } from '@/constants/scopes';
import { Textarea } from '@/components/common/FormFields';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/States';
import { adminApi } from '@/services/endpoints';

const fmt = (d?: string) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const MAX_ANSWER = 4000;

export const AdminAnswerModal = ({
  question,
  onClose,
  onAnswered,
  onFlag,
}: {
  question: Question | null;
  onClose: () => void;
  onAnswered: (q: Question) => void;
  onFlag: (q: Question) => void;
}) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [markingInPerson, setMarkingInPerson] = useState(false);
  const [confirmInPersonOpen, setConfirmInPersonOpen] = useState(false);

  useEffect(() => {
    setAnswer(question?.answer || '');
  }, [question?._id]);

  if (!question) return null;

  const submit = async () => {
    if (!answer.trim()) {
      toast.error('Enter an answer before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await adminApi.answer(question.questionId, answer.trim());
      toast.success(`${question.questionId} marked as answered.`);
      onAnswered(data.question);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const flagForLater = async () => {
    setFlagging(true);
    try {
      const { data } = await adminApi.flag(question.questionId);
      toast.success(`${question.questionId} marked for later.`);
      onFlag(data.question);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setFlagging(false);
    }
  };

  const markInPerson = async () => {
    setMarkingInPerson(true);
    try {
      const { data } = await adminApi.answerInPerson(question.questionId);
      toast.success(`${question.questionId} marked as answered.`);
      onAnswered(data.question);
      setConfirmInPersonOpen(false);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setMarkingInPerson(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-ink-600 bg-ink-800 shadow-popover sm:rounded-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-ink-700 bg-ink-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <QuestionIdChip id={question.questionId} />
              <StatusBadge status={question.status} />
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
                <Layers size={14} />
                {scopeLabel(question.scope)}
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

            {question.status === 'answered' && question.answeredInPerson ? (
              <div className="rounded-lg border border-signal-green/25 bg-signal-green/5 p-4 text-sm text-ink-200">
                <p className="flex items-center gap-1.5 font-medium text-signal-green">
                  <CheckCircle2 size={15} />
                  Answered in person during the live session
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  No written answer was recorded — the question was resolved verbally.
                </p>
                {question.answeredByName && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    Marked answered {fmt(question.answeredAt)} by {question.answeredByName}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <Textarea
                  label="Answer"
                  rows={5}
                  maxLength={MAX_ANSWER}
                  placeholder="Write your answer…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={question.status === 'answered'}
                />
                {question.status === 'answered' && question.answeredByName && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    Answered {fmt(question.answeredAt)} by {question.answeredByName}
                  </p>
                )}
              </div>
            )}

            {question.status !== 'answered' && (
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <Button variant="secondary" onClick={flagForLater} loading={flagging}>
                  <Bookmark size={15} />
                  Mark for Later
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setConfirmInPersonOpen(true)}
                  disabled={markingInPerson}
                >
                  <CheckCircle2 size={15} />
                  Answered
                </Button>
                <Button onClick={submit} loading={submitting}>
                  Submit Answer
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <ConfirmDialog
        open={confirmInPersonOpen}
        title="Mark as answered?"
        description={`This will mark ${question.questionId} as Answered without a written reply, since it was addressed during the live session. The submitter will see it as answered right away.`}
        confirmLabel="Mark Answered"
        loading={markingInPerson}
        onConfirm={markInPerson}
        onCancel={() => setConfirmInPersonOpen(false)}
      />
    </AnimatePresence>
  );
};
