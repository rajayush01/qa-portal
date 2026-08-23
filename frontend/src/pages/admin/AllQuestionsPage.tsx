import { useEffect, useState, useCallback } from 'react';
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
  const [filters, setFilters] = useState<AdminFilters>({
    status: lockedStatus,
    page: 1,
    limit: 20,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [facets, setFacets] = useState({ departments: [] as string[], categories: [] as string[], locations: [] as string[] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Question | null>(null);
  const [newIds, setNewIds] = useState<string[]>([]);
  const { socket } = useSocket();

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
    adminApi.facets().then(({ data }) => setFacets(data.facets)).catch(() => {});
  }, []);

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
        searchParams.delete('open');
        setSearchParams(searchParams, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNew = (q: Question) => {
      toast(`New question ${q.questionId}`, { icon: '🔔' });
      setNewIds((prev) => [...prev, q.questionId]);
      load();
      setTimeout(() => setNewIds((prev) => prev.filter((id) => id !== q.questionId)), 2200);
    };
    const onAnswered = () => load();
    socket.on('question:new', onNew);
    socket.on('question:answered', onAnswered);
    return () => {
      socket.off('question:new', onNew);
      socket.off('question:answered', onAnswered);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleAnswered = (updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.questionId === updated.questionId ? updated : q)));
  };
  const handleFlag = (updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.questionId === updated.questionId ? updated : q)));
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-100">{title}</h1>

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
