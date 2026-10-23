import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search as SearchIcon } from 'lucide-react';
import { adminApi } from '@/services/endpoints';
import { AdminFilters, Question } from '@/types';
import { FilterBar } from '@/components/admin/FilterBar';
import { QuestionsTable } from '@/components/admin/QuestionsTable';
import { PaginationBar } from '@/components/admin/PaginationBar';
import { AdminAnswerModal } from '@/components/admin/AdminAnswerModal';
import { RowSkeleton, EmptyState } from '@/components/common/States';
import { useSocket } from '@/context/SocketContext';

export const AllQuestionsPage = ({
  lockedStatus,
  title,
}: {
  lockedStatus?: 'unanswered' | 'answered';
  title: string;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Filters live in the URL so they can be deep-linked (e.g. from the Overview
  // insights panel) and survive refresh / back navigation.
  const filters = useMemo<AdminFilters>(() => {
    const g = (k: string) => searchParams.get(k) || undefined;
    return {
      search: g('search'),
      status: lockedStatus ?? g('status'),
      scope: g('scope'),
      department: g('department'),
      category: g('category'),
      location: g('location'),
      datePreset: g('datePreset'),
      sessionFlagged: g('sessionFlagged'),
      page: Math.max(parseInt(g('page') ?? '1', 10) || 1, 1),
      limit: 20,
    };
  }, [searchParams, lockedStatus]);

  const setFilters = useCallback(
    (next: AdminFilters | ((f: AdminFilters) => AdminFilters)) => {
      const value = typeof next === 'function' ? next(filters) : next;
      const params = new URLSearchParams(searchParams);
      (['search', 'status', 'scope', 'department', 'category', 'location', 'datePreset', 'sessionFlagged'] as const).forEach(
        (k) => {
          const v = value[k];
          if (k === 'status' && lockedStatus) return;
          if (v && v !== 'all') params.set(k, v);
          else params.delete(k);
        }
      );
      if (value.page && value.page > 1) params.set('page', String(value.page));
      else params.delete('page');
      setSearchParams(params, { replace: true });
    },
    [filters, searchParams, setSearchParams, lockedStatus]
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [facets, setFacets] = useState({ departments: [] as string[], categories: [] as string[], locations: [] as string[] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Question | null>(null);
  const [newIds, setNewIds] = useState<string[]>([]);
  const { socket, connected } = useSocket();

  const loadFacets = useCallback(() => {
    adminApi.facets().then(({ data }) => setFacets(data.facets)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.list({ ...filters, status: lockedStatus ?? filters.status });
      setQuestions(data.questions);
      setPagination(data.pagination);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters, lockedStatus]);

  useEffect(() => {
    loadFacets();
  }, [loadFacets]);

  useEffect(() => {
    load();
  }, [load]);

  // Deep-link support: /admin/questions?open=Q-2026-000123
  useEffect(() => {
    const openId = searchParams.get('open');
    if (!openId) return;
    adminApi
      .byId(openId)
      .then(({ data }) => setSelected(data.question))
      .catch(() => toast.error('Could not find that question.'))
      .finally(() => {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete('open');
            return next;
          },
          { replace: true }
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNew = (q: Question) => {
      toast(`New question ${q.questionId}`, { icon: '🔔' });
      setNewIds((prev) => [...prev, q.questionId]);
      load();
      loadFacets();
      setTimeout(() => setNewIds((prev) => prev.filter((id) => id !== q.questionId)), 2200);
    };
    const onChanged = () => load();
    socket.on('question:new', onNew);
    socket.on('question:answered', onChanged);
    socket.on('question:updated', onChanged);
    socket.on('taxonomy:changed', loadFacets);
    return () => {
      socket.off('question:new', onNew);
      socket.off('question:answered', onChanged);
      socket.off('question:updated', onChanged);
      socket.off('taxonomy:changed', loadFacets);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, load, loadFacets]);

  // Catch up on anything missed while the socket was down.
  useEffect(() => {
    if (connected) {
      load();
      loadFacets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const handleAnswered = (updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.questionId === updated.questionId ? updated : q)));
  };
  const handleFlag = (updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.questionId === updated.questionId ? updated : q)));
  };

  return (
    <div>
      <h1 className="mb-4 font-display text-xl text-ink-100 sm:mb-6 sm:text-2xl">{title}</h1>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        departments={facets.departments}
        categories={facets.categories}
        locations={facets.locations}
        lockStatus={!!lockedStatus}
        onExportFiltered={() => window.open(adminApi.exportUrl({ ...filters, status: lockedStatus ?? filters.status }, false), '_blank')}
        onExportAll={() => window.open(adminApi.exportUrl(filters, true), '_blank')}
      />

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-ink-700">
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={20} />}
          title="No questions found"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <>
          <QuestionsTable questions={questions} onOpen={setSelected} highlightIds={newIds} />
          <PaginationBar pagination={pagination} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
        </>
      )}

      <AdminAnswerModal
        question={selected}
        onClose={() => setSelected(null)}
        onAnswered={handleAnswered}
        onFlag={handleFlag}
      />
    </div>
  );
};
