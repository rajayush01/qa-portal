import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Radio, Search, Bookmark, MessageSquareReply, Paperclip, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { Question } from '@/types';
import { SCOPE_OPTIONS, scopeLabel } from '@/constants/scopes';
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
  const [search, setSearch] = useState('');
  const [fScope, setFScope] = useState('all');
  const [fDept, setFDept] = useState('all');
  const [fCategory, setFCategory] = useState('all');
  const [fLocation, setFLocation] = useState('all');
  const [onlyFlagged, setOnlyFlagged] = useState(false);

  // Filter options are derived from what is actually in the queue.
  const uniq = (vals: string[]) => Array.from(new Set(vals)).sort((a, b) => a.localeCompare(b));
  const departments = useMemo(() => uniq(questions.map((q) => q.department).filter(Boolean)), [questions]);
  const categories = useMemo(() => uniq(questions.map((q) => q.category).filter(Boolean)), [questions]);
  const hasUncategorised = useMemo(() => questions.some((q) => !q.category), [questions]);
  const locations = useMemo(() => uniq(questions.map((q) => q.location).filter(Boolean)), [questions]);

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (fScope !== 'all' && (q.scope ?? 'other') !== fScope) return false;
      if (fDept !== 'all' && q.department !== fDept) return false;
      if (fCategory === '__none__' ? !!q.category : fCategory !== 'all' && q.category !== fCategory) return false;
      if (fLocation !== 'all' && q.location !== fLocation) return false;
      if (onlyFlagged && !q.sessionFlagged) return false;
      if (
        s &&
        ![q.questionId, q.questionText, q.name ?? '', q.department, q.location, q.category].some((v) =>
          (v ?? '').toLowerCase().includes(s)
        )
      )
        return false;
      return true;
    });
  }, [questions, search, fScope, fDept, fCategory, fLocation, onlyFlagged]);

  const filtersActive =
    !!search || fScope !== 'all' || fDept !== 'all' || fCategory !== 'all' || fLocation !== 'all' || onlyFlagged;
  const clearFilters = () => {
    setSearch('');
    setFScope('all');
    setFDept('all');
    setFCategory('all');
    setFLocation('all');
    setOnlyFlagged(false);
  };
  const selectClass =
    'w-full min-w-0 rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-ink-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40 sm:w-auto';

  // (Re)load the queue on mount and every time the socket reconnects, so
  // nothing submitted while we were offline is missed.
  useEffect(() => {
    adminApi
      .list({ status: 'unanswered', limit: 100 })
      .then(({ data }) => setQuestions(data.questions))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [connected]);

  useEffect(() => {
    if (!socket) return;

    const onNew = (q: Question) => {
      toast.success(`New question received — ${q.questionId}`, { icon: '🔔' });
      setQuestions((prev) => (prev.some((x) => x.questionId === q.questionId) ? prev : [q, ...prev]));
    };
    const onAnswered = (updated: Question) => {
      setQuestions((prev) => prev.filter((q) => q.questionId !== updated.questionId));
    };
    const onUpdated = (updated: Question) => {
      setQuestions((prev) =>
        updated.status === 'unanswered'
          ? prev.map((q) => (q.questionId === updated.questionId ? updated : q))
          : prev.filter((q) => q.questionId !== updated.questionId)
      );
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

      <div className="mb-5 space-y-3 rounded-2xl border border-ink-700 bg-ink-900/50 p-3 sm:p-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search live questions…"
            className="w-full rounded-lg border border-ink-600 bg-ink-900 py-2.5 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          />
        </div>
        <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap">
          <select value={fScope} onChange={(e) => setFScope(e.target.value)} className={selectClass}>
            <option value="all">All scopes</option>
            {SCOPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={fDept} onChange={(e) => setFDept(e.target.value)} className={selectClass}>
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={fCategory} onChange={(e) => setFCategory(e.target.value)} className={selectClass}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            {hasUncategorised && <option value="__none__">Uncategorised</option>}
          </select>
          <select value={fLocation} onChange={(e) => setFLocation(e.target.value)} className={selectClass}>
            <option value="all">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-ink-200">
            <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} />
            For later
          </label>
          <div className="col-span-2 flex items-center justify-between gap-3 text-xs text-ink-400 sm:ml-auto sm:justify-start">
            <span>
              Showing {visible.length} of {questions.length}
            </span>
            {filtersActive && (
              <button onClick={clearFilters} className="text-accent-400 hover:text-accent-300">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {!loading && questions.length === 0 ? (
        <EmptyState
          icon={<Radio size={20} />}
          title="No questions waiting"
          description="New questions submitted during this session will appear here instantly."
        />
      ) : !loading && visible.length === 0 ? (
        <EmptyState
          icon={<Search size={20} />}
          title="No questions match these filters"
          description="Try clearing a filter to see the rest of the queue."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((q) => (
              <motion.div
                key={q._id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-ink-700 bg-ink-900/60 p-4 sm:p-5"
              >
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <QuestionIdChip id={q.questionId} />
                  <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-ink-300">{q.department}</span>
                  <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-ink-300">{scopeLabel(q.scope)}</span>
                  {q.category && (
                    <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-ink-300">{q.category}</span>
                  )}
                  {q.location && <span className="text-xs text-ink-500">{q.location}</span>}
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
                <p className="break-words text-sm leading-relaxed text-ink-100">{q.questionText}</p>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
