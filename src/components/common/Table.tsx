import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronsUpDown, PackageSearch } from 'lucide-react';
import { Skeleton } from './Loader';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  rowKey?: (row: T, index: number) => string | number;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

const SortIcon: React.FC<{ direction: 'asc' | 'desc' | null }> = ({ direction }) => {
  if (direction === 'asc') return <ArrowUp size={14} className="text-[#2563EB]" />;
  if (direction === 'desc') return <ArrowDown size={14} className="text-[#2563EB]" />;
  return <ChevronsUpDown size={14} className="text-[#CBD5E1]" />;
};

// ─── Table Component ──────────────────────────────────────────────────────────

export function Table<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available.',
  onSort,
  rowKey,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort(key, newDir);
  };

  const getCellValue = (row: T, key: keyof T | string): React.ReactNode => {
    const val = (row as Record<string, unknown>)[key as string];
    if (val === null || val === undefined) return '—';
    return String(val);
  };

  const SKELETON_ROWS = 5;

  return (
    <div className="w-full overflow-x-auto rounded-[8px] border border-[#E2E8F0]">
      <table className="w-full border-collapse text-sm">
        {/* Sticky header */}
        <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={[
                  'text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap',
                  col.sortable && onSort
                    ? 'cursor-pointer select-none hover:text-[#2563EB] hover:bg-[#F1F5F9] transition-colors'
                    : '',
                ].join(' ')}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => col.sortable && handleSort(String(col.key))}
                aria-sort={
                  sortKey === String(col.key)
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && onSort && (
                    <SortIcon direction={sortKey === String(col.key) ? sortDir : null} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Loading skeleton rows */}
          {loading &&
            Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
              <tr
                key={`skel-${rowIdx}`}
                className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <Skeleton height={14} width={rowIdx % 3 === 0 ? '80%' : '60%'} />
                  </td>
                ))}
              </tr>
            ))}

          {/* Empty state */}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-[#94A3B8]">
                  <PackageSearch size={40} strokeWidth={1.5} />
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!loading &&
            data.map((row, rowIdx) => {
              const key = rowKey ? rowKey(row, rowIdx) : rowIdx;
              return (
                <tr
                  key={key}
                  className={[
                    rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]',
                    'hover:bg-[#EFF6FF] transition-colors',
                    rowIdx < data.length - 1 ? 'border-b border-[#E2E8F0]' : '',
                  ].join(' ')}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-[#0F172A] whitespace-nowrap"
                    >
                      {col.render ? col.render(row) : getCellValue(row, col.key)}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
