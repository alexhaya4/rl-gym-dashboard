import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonTable } from './Skeleton';
import { EmptyState } from './EmptyState';
import type { LucideIcon } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => unknown;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
  data,
  columns,
  loading,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize: initialPageSize = 25,
  emptyIcon,
  emptyTitle = 'No data',
  emptyDescription,
  emptyAction,
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const v = col.accessor(row);
        return v != null && String(v).toLowerCase().includes(s);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.accessor(a);
      const bv = col.accessor(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  };

  if (loading) {
    return <SkeletonTable rows={6} columns={columns.length} />;
  }

  return (
    <div className="rounded-[var(--radius-card)] border dark:bg-dark-card dark:border-dark-border bg-light-card border-light-border overflow-hidden">
      {searchable && (
        <div className="p-4 border-b dark:border-dark-border border-light-border">
          <div className="relative max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-dark-text-secondary text-light-text-secondary"
            />
            <input
              type="text"
              value={search}
              placeholder={searchPlaceholder}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
            />
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider ${col.className ?? ''} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.header}</span>
                        {col.sortable && sortKey === col.key && (
                          <span className="text-accent">
                            {sortDir === 'asc' ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b last:border-b-0 dark:border-dark-border border-light-border dark:hover:bg-dark-hover/50 hover:bg-light-hover/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-5 py-3 ${col.className ?? ''}`}>
                        {col.render ? col.render(row) : String(col.accessor(row) ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 p-4 border-t dark:border-dark-border border-light-border text-xs dark:text-dark-text-secondary text-light-text-secondary">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="ml-2">
                {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of{' '}
                {sorted.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-[var(--radius-btn)] dark:hover:bg-dark-hover hover:bg-light-hover disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-[var(--radius-btn)] dark:hover:bg-dark-hover hover:bg-light-hover disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
