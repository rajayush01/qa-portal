import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination } from '@/types';

export const PaginationBar = ({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="mt-5 flex items-center justify-between text-sm text-ink-400">
      <p>
        Showing page {pagination.page} of {pagination.totalPages} · {pagination.total} results
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="flex items-center gap-1 rounded-lg border border-ink-700 px-3 py-1.5 disabled:opacity-40 hover:bg-ink-800"
        >
          <ChevronLeft size={14} />
          Prev
        </button>
        <button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="flex items-center gap-1 rounded-lg border border-ink-700 px-3 py-1.5 disabled:opacity-40 hover:bg-ink-800"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
