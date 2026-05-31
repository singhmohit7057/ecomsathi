import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  total?: number;
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  // Always show first page
  pages.push(1);

  if (current > 3) {
    pages.push('...');
  }

  // Pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  // Always show last page
  pages.push(total);

  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  pageSize,
  total,
}) => {
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Compute showing range
  let showingText: string | null = null;
  if (total !== undefined && pageSize !== undefined) {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    if (total === 0) {
      showingText = 'No items';
    } else {
      showingText = `Showing ${start}–${end} of ${total} items`;
    }
  }

  const pages = buildPageList(page, totalPages);

  const btnBase =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-[4px] text-sm font-medium transition-all duration-100 border select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40';

  const activeBtn = `${btnBase} bg-[#2563EB] text-white border-[#2563EB] shadow-[#1E293B_1px_1px_0px_0px]`;
  const inactiveBtn = `${btnBase} bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#94A3B8]`;
  const disabledBtn = `${btnBase} bg-white text-[#CBD5E1] border-[#E2E8F0] cursor-not-allowed`;
  const ellipsisStyle = `${btnBase} bg-transparent border-transparent text-[#94A3B8] cursor-default`;

  if (totalPages <= 1 && !showingText) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2">
      {/* Showing text */}
      {showingText && (
        <p className="text-sm text-[#64748B] whitespace-nowrap">{showingText}</p>
      )}

      {/* Page controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous */}
          <button
            type="button"
            className={hasPrev ? inactiveBtn : disabledBtn}
            onClick={() => hasPrev && onPageChange(page - 1)}
            disabled={!hasPrev}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className={ellipsisStyle}>
                  …
                </span>
              );
            }

            return (
              <button
                key={p}
                type="button"
                className={p === page ? activeBtn : inactiveBtn}
                onClick={() => p !== page && onPageChange(p as number)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Go to page ${p}`}
              >
                {p}
              </button>
            );
          })}

          {/* Next */}
          <button
            type="button"
            className={hasNext ? inactiveBtn : disabledBtn}
            onClick={() => hasNext && onPageChange(page + 1)}
            disabled={!hasNext}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
