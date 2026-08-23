import { useEffect, useState } from 'react';
import { Search, Download, ChevronDown } from 'lucide-react';
import { AdminFilters } from '@/types';
import { Button } from '@/components/common/Button';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'unanswered', label: 'Unanswered' },
  { value: 'answered', label: 'Answered' },
  { value: 'archived', label: 'Archived' },
];

const DATE_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
];

export const FilterBar = ({
  filters,
  onChange,
  departments,
  categories,
  locations,
  onExportFiltered,
  onExportAll,
  lockStatus,
}: {
  filters: AdminFilters;
  onChange: (next: AdminFilters) => void;
  departments: string[];
  categories: string[];
  locations: string[];
  onExportFiltered: () => void;
  onExportAll: () => void;
  lockStatus?: boolean;
}) => {
  const [search, setSearch] = useState(filters.search || '');

  // Debounced search — commit to parent 350ms after typing stops.
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== (filters.search || '')) {
        onChange({ ...filters, search, page: 1 });
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const selectClass =
    'rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-ink-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40';

  return (
    <div className="mb-5 space-y-3 rounded-2xl border border-ink-700 bg-ink-900/50 p-4">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, question text, name, department…"
          className="w-full rounded-lg border border-ink-600 bg-ink-900 py-2.5 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!lockStatus && (
          <select
            value={filters.status || 'all'}
            onChange={(e) => onChange({ ...filters, status: e.target.value, page: 1 })}
            className={selectClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.department || 'all'}
          onChange={(e) => onChange({ ...filters, department: e.target.value, page: 1 })}
          className={selectClass}
        >
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={filters.category || 'all'}
          onChange={(e) => onChange({ ...filters, category: e.target.value, page: 1 })}
          className={selectClass}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.location || 'all'}
          onChange={(e) => onChange({ ...filters, location: e.target.value, page: 1 })}
          className={selectClass}
        >
          <option value="all">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={filters.datePreset || 'all'}
          onChange={(e) => onChange({ ...filters, datePreset: e.target.value, page: 1 })}
          className={selectClass}
        >
          {DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onExportFiltered}>
            <Download size={14} />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={onExportAll}>
            Export All
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
