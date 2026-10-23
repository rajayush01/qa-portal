import { useEffect, useState } from 'react';
import { Search, Download, ChevronDown } from 'lucide-react';
import { AdminFilters } from '@/types';
import { Button } from '@/components/common/Button';
import { SCOPE_OPTIONS } from '@/constants/scopes';

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

  // Keep the box in step when filters change from outside (URL / drill-down).
  useEffect(() => {
    setSearch(filters.search || '');
  }, [filters.search]);

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
    'w-full min-w-0 rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-ink-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40 sm:w-auto';

  return (
    <div className="mb-5 space-y-3 rounded-2xl border border-ink-700 bg-ink-900/50 p-3 sm:p-4">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ID, question, name, department…"
          className="w-full rounded-lg border border-ink-600 bg-ink-900 py-2.5 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
        />
      </div>

      <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap">
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
          value={filters.scope || 'all'}
          onChange={(e) => onChange({ ...filters, scope: e.target.value, page: 1 })}
          className={selectClass}
        >
          <option value="all">All scopes</option>
          {SCOPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

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
          <option value="__none__">Uncategorised</option>
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

        <label className="col-span-2 flex cursor-pointer items-center gap-2 rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-ink-200 sm:col-span-1">
          <input
            type="checkbox"
            checked={filters.sessionFlagged === 'true'}
            onChange={(e) => onChange({ ...filters, sessionFlagged: e.target.checked ? 'true' : undefined, page: 1 })}
          />
          For later
        </label>

        <div className="col-span-2 flex items-center gap-2 sm:ml-auto">
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
