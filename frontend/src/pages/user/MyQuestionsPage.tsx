import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Inbox, CheckCircle2, Clock } from 'lucide-react';
import { questionApi } from '@/services/endpoints';
import { Question } from '@/types';
import { SCOPE_OPTIONS } from '@/constants/scopes';
import { QuestionCard } from '@/components/user/QuestionCard';
import { QuestionDetailModal } from '@/components/common/QuestionDetailModal';
import { CardSkeleton, EmptyState } from '@/components/common/States';
import { useSocket } from '@/context/SocketContext';

const COPY: Record<string, { title: string; empty: string; icon: JSX.Element }> = {
  all: {
    title: 'My Questions',
    empty: "You haven't submitted any questions yet.",
    icon: <Inbox size={20} />,
  },
  answered: {
    title: 'Answered',
    empty: 'None of your questions have been answered yet.',
    icon: <CheckCircle2 size={20} />,
  },
  unanswered: {
    title: 'Unanswered',
    empty: 'Nothing is waiting on an answer — you\'re all caught up.',
    icon: <Clock size={20} />,
  },
};

export const MyQuestionsPage = ({ status = 'all' }: { status?: 'all' | 'answered' | 'unanswered' }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Question | null>(null);
  const [scope, setScope] = useState<'all' | string>('all');
  const { socket } = useSocket();
  const copy = COPY[status];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await questionApi.my(status === 'all' ? undefined : status, 1, 50, scope);
      setQuestions(data.questions);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [status, scope]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;

    const onAnswered = (updated: Question) => {
      toast.success(`Your question ${updated.questionId} has been answered.`, { icon: '🔔' });
      setQuestions((prev) => {
        const exists = prev.some((q) => q.questionId === updated.questionId);
        if (!exists) return prev;
        return prev.map((q) => (q.questionId === updated.questionId ? updated : q));
      });
      setSelected((prev) => (prev?.questionId === updated.questionId ? updated : prev));
    };

    socket.on('question:answered', onAnswered);
    return () => {
      socket.off('question:answered', onAnswered);
    };
  }, [socket]);

  // Server already filters by scope; keep the client-side guard so a live
  // socket update can never leak a non-matching card into the list.
  const filtered = questions.filter(
    (q) =>
      (status === 'all' || q.status === status) &&
      (scope === 'all' || (q.scope ?? 'other') === scope)
  );

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl text-ink-100">{copy.title}</h1>

      <div className="mb-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by scope">
        {[{ value: 'all', label: 'All' }, ...SCOPE_OPTIONS].map((o) => {
          const active = scope === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setScope(o.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-accent-500 bg-accent-500/10 text-accent-300'
                  : 'border-ink-600 text-ink-300 hover:border-ink-500'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={copy.icon} title="Nothing here yet" description={copy.empty} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((q) => (
              <QuestionCard key={q._id} question={q} onOpen={() => setSelected(q)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <QuestionDetailModal question={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
