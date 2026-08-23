import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Inbox, Clock, CheckCircle2, CalendarDays, ChevronRight } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { DashboardStats, Question } from '@/types';
import { StatCard } from '@/components/admin/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { QuestionIdChip } from '@/components/common/QuestionBits';
import { CardSkeleton, EmptyState } from '@/components/common/States';
import { useSocket } from '@/context/SocketContext';

export const AdminOverviewPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        adminApi.stats(),
        adminApi.list({ status: 'unanswered', limit: 6 }),
      ]);
      setStats(statsRes.data.stats);
      setRecent(listRes.data.questions);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on('question:new', refresh);
    socket.on('question:answered', refresh);
    return () => {
      socket.off('question:new', refresh);
      socket.off('question:answered', refresh);
    };
  }, [socket, load]);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl text-ink-100">Overview</h1>
      <p className="mb-6 text-sm text-ink-400">Live snapshot of question activity across the portal.</p>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Questions" value={stats?.total ?? 0} icon={Inbox} tone="accent" />
          <StatCard label="Unanswered" value={stats?.unanswered ?? 0} icon={Clock} tone="amber" />
          <StatCard label="Answered" value={stats?.answered ?? 0} icon={CheckCircle2} tone="green" />
          <StatCard label="Today" value={stats?.today ?? 0} icon={CalendarDays} />
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink-100">Needs attention</h2>
          <button
            onClick={() => navigate('/admin/unanswered')}
            className="flex items-center gap-1 text-sm text-accent-400 hover:text-accent-300"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={20} />}
            title="All caught up"
            description="There are no unanswered questions right now."
          />
        ) : (
          <div className="space-y-3">
            {recent.map((q) => (
              <button
                key={q._id}
                onClick={() => navigate(`/admin/questions?open=${q.questionId}`)}
                className="flex w-full items-center justify-between rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3.5 text-left transition-colors hover:border-ink-500"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <QuestionIdChip id={q.questionId} />
                    <StatusBadge status={q.status} />
                  </div>
                  <p className="truncate text-sm text-ink-200">{q.questionText}</p>
                </div>
                <ChevronRight size={16} className="ml-3 shrink-0 text-ink-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
