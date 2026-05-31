import React from 'react';
import { Loader2 } from 'lucide-react';

// ─── Full Page Loader ─────────────────────────────────────────────────────────

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-4">
      <div className="flex items-center gap-1 select-none">
        <span className="text-2xl font-bold text-[#2563EB]">Ecom</span>
        <span className="text-2xl font-bold text-[#0F172A]">Sathi</span>
      </div>
      <Loader2 size={32} className="animate-spin text-[#2563EB]" />
    </div>
  );
};

// ─── Inline Loader ────────────────────────────────────────────────────────────

interface InlineLoaderProps {
  size?: number;
  className?: string;
  label?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  size = 20,
  className = '',
  label,
}) => {
  return (
    <span className={`inline-flex items-center gap-2 text-[#64748B] ${className}`}>
      <Loader2 size={size} className="animate-spin text-[#2563EB] flex-shrink-0" />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const skeletonRadii: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded-[4px]',
  md: 'rounded-[8px]',
  lg: 'rounded-[12px]',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  rounded = 'sm',
  className = '',
}) => {
  return (
    <div
      className={[
        'bg-[#E2E8F0] animate-pulse',
        skeletonRadii[rounded],
        className,
      ].join(' ')}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-6 flex flex-col gap-3">
      <Skeleton height={20} width="60%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 1 ? '40%' : '100%'} />
      ))}
    </div>
  );
};

// ─── Table Skeleton ────────────────────────────────────────────────────────────

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="flex flex-col gap-0 border border-[#E2E8F0] rounded-[8px] overflow-hidden">
      {/* Header */}
      <div
        className="grid gap-4 px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={14} width="70%" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={[
            'grid gap-4 px-4 py-3',
            rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]',
            rowIdx < rows - 1 ? 'border-b border-[#E2E8F0]' : '',
          ].join(' ')}
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} height={14} width={colIdx === 0 ? '80%' : '60%'} />
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Default export (Page Loader for convenience) ─────────────────────────────

export const Loader = PageLoader;
export default Loader;
