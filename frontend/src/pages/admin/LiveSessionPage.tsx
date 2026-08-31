import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Radio, Bookmark, MessageSquareReply, Paperclip, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { Question } from '@/types';
import { QuestionIdChip } from '@/components/common/QuestionBits';
import { Button } from '@/components/common/Button';
import { AdminAnswerModal } from '@/components/admin/AdminAnswerModal';
import { EmptyState, ConfirmDialog } from '@/components/common/States';
import { useSocket } from '@/context/SocketContext';

export const LiveSessionPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<Question | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const { socket, connected } = useSocket();

  useEffect(() => {
    adminApi
      .list({ status: 'unanswered', limit: 25 })
      .then(({ data }) => setQuestions(data.questions))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onNew = (q: Question) => {
      toast.success(`New question received — ${q.questionId}`, { icon: '🔔' });
      setQuestions((prev) => [q, ...prev]);
    };
    const onAnswered = (updated: Question) => {
      setQuestions((prev) => prev.filter((q) => q.questionId !== updated.questionId));
    };
    const onUpdated = (updated: Question) => {
      setQuestions((prev) => prev.map((q) => (q.questionId === updated.questionId ? updated : q)));
    };

    socket.on('question:new', onNew);
    socket.on('question:answered', onAnswered);
    socket.on('question:updated', onUpdated);
    return () => {
      socket.off('question:new', onNew);
      socket.off('question:answered', onAnswered);
      socket.off('question:updated', onUpdated);
    };
  }, [socket]);

  const handleAnswered = (updated: Question) => {
    setQuestions((prev) => prev.filter((q) => q.questionId !== updated.questionId));
  };
  const handleFlag = (updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.questionId === updated.questionId ? updated : q)));
  };

  const confirmQuickAnswer = async () => {
    if (!confirmTarget) return;
    setMarkingId(confirmTarget.questionId);
    try {
      await adminApi.answerInPerson(confirmTarget.questionId);
      toast.success(`${confirmTarget.questionId} marked as answered.`);
      setQuestions((prev) => prev.filter((q) => q.questionId !== confirmTarget.questionId));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setMarkingId(null);
      setConfirmTarget(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-signal-red/15 text-signal-red">
          {connected && <span className="absolute h-9 w-9 animate-pulseRing rounded-full" />}
          <Radio size={16} />
        </div>
        <div>
          <h1 className="font-display text-2xl text-ink-100">Live Session</h1>
          <p className="text-sm text-ink-400">
            {connected ? 'Watching for incoming questions in real time.' : 'Reconnecting to live updates…'}
          </p>
        </div>
      </div>

      {!loading && questions.length === 0 ? (
        <EmptyState
          icon={<Radio size={20} />}
          title="No questions waiting"
          description="New questions submitted during this session will appear here instantly."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {questions.map((q) => (
              <motion.div
                key={q._id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-ink-700 bg-ink-900/60 p-5"
              >
                <div className="mb-2.5 flex items-center gap-2">
                  <QuestionIdChip id={q.questionId} />
                  <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-ink-300">{q.department}</span>
                  <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-ink-300">{q.category}</span>
                  {q.sessionFlagged && (
                    <span className="flex items-center gap-1 rounded-full bg-signal-amber/25 border border-signal-amber px-2 py-0.5 text-xs text-ink-100">
                      <Bookmark size={11} />
                      For later
                    </span>
                  )}
                  {q.attachments.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-ink-500">
                      <Paperclip size={11} />
                      {q.attachments.length}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-ink-100">{q.questionText}</p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmTarget(q)}
                    disabled={markingId === q.questionId}
                  >
                    <CheckCircle2 size={14} />
                    Answered
                  </Button>
                  <Button size="sm" onClick={() => setSelected(q)}>
                    <MessageSquareReply size={14} />
                    Answer
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AdminAnswerModal
        question={selected}
        onClose={() => setSelected(null)}
        onAnswered={handleAnswered}
        onFlag={handleFlag}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title="Mark as answered?"
        description={
          confirmTarget
            ? `This will mark ${confirmTarget.questionId} as Answered without a written reply, since it was addressed live. The submitter will see it as answered right away.`
            : ''
        }
        confirmLabel="Mark Answered"
        loading={!!markingId}
        onConfirm={confirmQuickAnswer}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
};
