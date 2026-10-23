import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronRight } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { adminApi } from '@/services/endpoints';
import { AdminFilters, InsightDimension, InsightRow } from '@/types';
import { SCOPE_OPTIONS, scopeLabel, categoryLabel } from '@/constants/scopes';

const DIMENSIONS: { key: InsightDimension; label: string }[] = [
  { key: 'scope', label: 'Scope' },
  { key: 'department', label: 'Department' },
  { key: 'category', label: 'Category' },
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status' },
];

const DATE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
];

const STATUS_OPTIONS = ['all', 'unanswered', 'answered', 'archived'];

const labelFor = (dim: InsightDimension, v: string) => {
  if (dim === 'scope') return scopeLabel(v);
  if (dim === 'category') return categoryLabel(v);
  if (dim === 'status') return v.charAt(0).toUpperCase() + v.slice(1);
  return v || '—';
};

const selectClass =
  'w-full min-w-0 rounded-lg border border-ink-600 bg-ink-900 px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40 sm:w-auto';

/** "Where do most questions come from?" — ranked counts, sliceable by filters. */
export const InsightsPanel = () => {
  const [dim, setDim] = useState<InsightDimension>('scope');
  const [filters, setFilters] = useState<AdminFilters>({});
  const [rows, setRows] = useState<Record<InsightDimension, InsightRow[]> | null>(null);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState({ departments: [] as string[], categories: [] as string[], locations: [] as string[] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0); // bumped by live events to refetch
  const navigate = useNavigate();
  const { socket, connected } = useSocket();

  const loadFacets = useCallback(() => {
    adminApi.facets().then(({ data }) => setFacets(data.facets)).catch(() => undefined);
  }, []);

  useEffect(() => {
    loadFacets();
  }, [loadFacets, tick]);

  useEffect(() => {
    if (!socket) return;
    const bump = () => setTick((t) => t + 1);
    const events = ['question:new', 'question:answered', 'question:updated', 'taxonomy:changed'];
    events.forEach((e) => socket.on(e, bump));
    return () => events.forEach((e) => socket.off(e, bump));
  }, [socket]);

  useEffect(() => {
    if (connected) setTick((t) => t + 1);
  }, [connected]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    adminApi
      .insights(filters, 10)
      .then(({ data }) => {
        if (cancelled) return;
        setRows(data.insights);
        setTotal(data.total);
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters, tick]);

  // Open the matching questions: the panel's own filters plus the clicked row.
  const openQuestions = (row?: InsightRow) => {
    const params = new URLSearchParams();
    (['search', 'status', 'scope', 'department', 'category', 'location', 'datePreset'] as const).forEach((k) => {
      const v = filters[k];
      if (v && v !== 'all') params.set(k, v);
    });
    if (row) {
      if (dim === 'category') params.set('category', row.value || '__none__');
      else if (row.value || dim === 'scope') params.set(dim, row.value || 'other');
    }
    navigate(`/admin/questions?${params.toString()}`);
  };

  const set = (patch: Partial<AdminFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const current = rows?.[dim] ?? [];
  const max = Math.max(1, ...current.map((r) => r.count));
  const active = Object.values(filters).some((v) => v && v !== 'all');

  return (
    <div className="mt-8 rounded-2xl border border-ink-700 bg-ink-900/50 p-4 sm:mt-10 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-accent-400" />
          <h2 className="font-display text-lg text-ink-100">Where most questions came from</h2>
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
          {DIMENSIONS.map((d) => (
            <button
              key={d.key}
              role="tab"
              aria-selected={dim === d.key}
              onClick={() => setDim(d.key)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                dim === d.key ? 'bg-accent-500 text-white' : 'bg-ink-800 text-ink-300 hover:text-ink-100'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap">
        <select value={filters.datePreset || 'all'} onChange={(e) => set({ datePreset: e.target.value })} className={selectClass}>
          {DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={filters.status || 'all'} onChange={(e) => set({ status: e.target.value })} className={selectClass}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select value={filters.scope || 'all'} onChange={(e) => set({ scope: e.target.value })} className={selectClass}>
          <option value="all">All scopes</option>
          {SCOPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={filters.department || 'all'} onChange={(e) => set({ department: e.target.value })} className={selectClass}>
          <option value="all">All departments</option>
          {facets.departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select value={filters.category || 'all'} onChange={(e) => set({ category: e.target.value })} className={selectClass}>
          <option value="all">All categories</option>
          {facets.categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={filters.location || 'all'} onChange={(e) => set({ location: e.target.value })} className={selectClass}>
          <option value="all">All locations</option>
          {facets.locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        {active && (
          <button onClick={() => setFilters({})} className="text-xs text-accent-400 hover:text-accent-300">
            Reset
          </button>
        )}
        <button
          type="button"
          onClick={() => openQuestions()}
          className="col-span-2 rounded-lg border border-ink-600 px-3 py-1.5 text-xs text-ink-200 hover:bg-ink-800 sm:col-span-1"
        >
          View all {total}
        </button>
        <span className="col-span-2 text-xs text-ink-400 sm:col-span-1 sm:ml-auto">{total} matching question{total === 1 ? '' : 's'}</span>
      </div>

      {error ? (
        <p className="text-sm text-signal-red">{error}</p>
      ) : loading && !rows ? (
        <p className="text-sm text-ink-500">Loading…</p>
      ) : current.length === 0 ? (
        <p className="text-sm text-ink-500">No questions match these filters.</p>
      ) : (
        <ol className={`space-y-2.5 transition-opacity ${loading ? 'opacity-50' : ''}`}>
          {current.map((r, i) => (
            <li key={`${dim}-${r.value}`}>
              <button
                type="button"
                onClick={() => openQuestions(r)}
                title={`View ${r.count} question${r.count === 1 ? '' : 's'}`}
                className="group flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-sm transition-colors hover:bg-ink-800/70 sm:gap-3"
              >
              <span className="w-4 shrink-0 text-right text-xs text-ink-500">{i + 1}</span>
              <span className="w-24 shrink-0 truncate text-ink-200 sm:w-40" title={labelFor(dim, r.value)}>
                {labelFor(dim, r.value)}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-800">
                <div
                  className={`h-full rounded-full ${i === 0 ? 'bg-accent-500' : 'bg-accent-500/50'}`}
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right tabular-nums text-ink-300 sm:w-16">
                {r.count}
                <span className="ml-1 hidden text-xs text-ink-500 sm:inline">
                  {total ? `${Math.round((r.count / total) * 100)}%` : ''}
                </span>
              </span>
              <ChevronRight size={14} className="shrink-0 text-ink-600 group-hover:text-accent-400" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
