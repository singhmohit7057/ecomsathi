import React, { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  X,
  ArrowRight,
  Tag,
  FileText,
  Image,
  Film,
  Calculator,
  ScissorsLineDashed,
  Mail,
} from 'lucide-react'
import {
  ALL_TOOLS,
  CATEGORY_META,
  type Tool,
} from '@/components/sections/ToolsGrid'

// ─── Category order & config ──────────────────────────────────────────────────

const CATEGORY_ORDER = [
  'SKU Tools',
  'PDF Tools',
  'Image Tools',
  'Video Tools',
  'GST Tools',
  'Label Crop',
] as const

type CategoryKey = (typeof CATEGORY_ORDER)[number]

const CATEGORY_CONFIG: Record<
  CategoryKey,
  {
    label: string
    href: string
    description: string
    icon: React.ReactNode
    iconBg: string
    iconColor: string
  }
> = {
  'SKU Tools': {
    label: 'SKU Tools',
    href: '/tools/sku',
    description: 'Generate, bulk-create and manage product SKUs and barcodes',
    icon: <Tag size={18} />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#2563EB]',
  },
  'PDF Tools': {
    label: 'PDF Tools',
    href: '/tools/pdf',
    description: 'Merge, split, compress, OCR and more',
    icon: <FileText size={18} />,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  'Image Tools': {
    label: 'Image Tools',
    href: '/tools/image',
    description: 'Resize, compress, remove background and optimize product images',
    icon: <Image size={18} />,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  'Video Tools': {
    label: 'Video Tools',
    href: '/tools/video',
    description: 'Convert, compress and extract frames from product videos',
    icon: <Film size={18} />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  'GST Tools': {
    label: 'GST Tools',
    href: '/tools/gst',
    description: 'Calculate GST, verify GSTINs, find HSN/SAC codes and more',
    icon: <Calculator size={18} />,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  'Label Crop': {
    label: 'Label Crop',
    href: '/label-crop',
    description: 'Crop shipping labels from Amazon, Flipkart, Meesho PDFs',
    icon: <ScissorsLineDashed size={18} />,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
}

// ─── Tool count per category ──────────────────────────────────────────────────

const toolCountByCategory = CATEGORY_ORDER.reduce<Record<string, number>>(
  (acc, cat) => {
    acc[cat] = ALL_TOOLS.filter((t) => t.category === cat).length
    return acc
  },
  {},
)

const FILTER_PILLS = [
  { label: 'All', value: 'All' },
  ...CATEGORY_ORDER.map((cat) => ({
    label: `${CATEGORY_CONFIG[cat].label} (${toolCountByCategory[cat]})`,
    value: cat,
  })),
]

// ─── Compact tool card (used inside category sections + search results) ───────

const CompactToolCard: React.FC<{ tool: Tool; showCategoryBadge?: boolean }> = ({
  tool,
  showCategoryBadge = false,
}) => {
  const meta = CATEGORY_META[tool.category]

  return (
    <Link
      to={tool.path}
      className="group flex flex-col gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-4 transition-all duration-150 hover:border-[#2563EB] hover:shadow-[#1E293B_2px_2px_0px_0px]"
    >
      {/* Icon row */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={[
            'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[6px] border text-[13px]',
            meta?.bg ?? 'bg-gray-50 border-gray-200',
            meta?.color ?? 'text-gray-600',
          ].join(' ')}
        >
          {tool.icon}
        </span>

        <div className="flex shrink-0 flex-wrap gap-1">
          {tool.isPopular && (
            <span className="inline-flex items-center rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Popular
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700 border border-green-200">
            Free
          </span>
        </div>
      </div>

      {/* Name + description */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#0F172A] group-hover:text-[#2563EB]">
          {tool.name}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-[#94A3B8]">{tool.description}</p>
      </div>

      {/* Category badge (only in search results) */}
      {showCategoryBadge && (
        <span
          className={[
            'self-start inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
            meta?.bg ?? 'bg-gray-50 border-gray-200',
            meta?.color ?? 'text-gray-600',
          ].join(' ')}
        >
          {tool.category}
        </span>
      )}

      {/* Open arrow */}
      <span className="flex items-center gap-1 text-xs font-medium text-[#2563EB] opacity-0 transition-opacity group-hover:opacity-100">
        Open <ArrowRight size={12} />
      </span>
    </Link>
  )
}

// ─── Category section ─────────────────────────────────────────────────────────

const CategorySection: React.FC<{ category: CategoryKey }> = ({ category }) => {
  const config = CATEGORY_CONFIG[category]
  const tools = ALL_TOOLS.filter((t) => t.category === category)

  return (
    <section aria-labelledby={`cat-${category.replace(/\s+/g, '-')}`}>
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border',
              config.iconBg,
              config.iconColor,
              'border-current/20',
            ].join(' ')}
          >
            {config.icon}
          </span>
          <div className="min-w-0">
            <h2
              id={`cat-${category.replace(/\s+/g, '-')}`}
              className="text-base font-bold text-[#0F172A] leading-tight"
            >
              {config.label}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 truncate">{config.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden sm:inline text-xs text-[#64748B] font-medium">
            {tools.length} tools
          </span>
          <Link
            to={config.href}
            className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#2563EB] hover:underline"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-[#E2E8F0]" />

      {/* Tool cards — horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:overflow-visible">
        {tools.map((tool) => (
          <div key={tool.path} className="min-w-[200px] sm:min-w-0">
            <CompactToolCard tool={tool} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Search results flat grid ─────────────────────────────────────────────────

const SearchResults: React.FC<{ query: string; results: Tool[] }> = ({
  query,
  results,
}) => (
  <div>
    <p className="mb-4 text-sm font-medium text-[#64748B]">
      <span className="font-semibold text-[#0F172A]">{results.length}</span>{' '}
      {results.length === 1 ? 'result' : 'results'} for{' '}
      <span className="text-[#2563EB]">"{query}"</span>
    </p>

    {results.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Search size={40} className="text-gray-300" />
        <p className="text-base font-semibold text-gray-500">No tools found</p>
        <p className="text-sm text-gray-400">Try a different search term</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((tool) => (
          <CompactToolCard key={tool.path} tool={tool} showCategoryBadge />
        ))}
      </div>
    )}
  </div>
)

// ─── Main ToolsPage ───────────────────────────────────────────────────────────

export default function ToolsPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'All' | CategoryKey>('All')
  const inputRef = useRef<HTMLInputElement>(null)

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ALL_TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    )
  }, [query])

  const isSearching = query.trim().length > 0

  const visibleCategories = useMemo<CategoryKey[]>(() => {
    if (activeCategory === 'All') return [...CATEGORY_ORDER]
    return [activeCategory]
  }, [activeCategory])

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#CFFAFE] py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl md:text-5xl leading-tight">
            Free Ecommerce Tools
          </h1>
          <p className="mt-3 text-base text-[#475569] sm:text-lg">
            50+ tools for Indian marketplace sellers.{' '}
            <span className="font-semibold text-[#0F172A]">No login, no signup.</span>
          </p>

          {/* Search bar */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools... (e.g. PDF merge, background remover, GST)"
              className="w-full rounded-[8px] border border-[#E2E8F0] bg-white py-3 pl-11 pr-10 text-base text-[#0F172A] shadow-[#1E293B_2px_2px_0px_0px] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#94A3B8] hover:bg-gray-100 hover:text-[#0F172A] transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filters row ──────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b border-[#E2E8F0] bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            {FILTER_PILLS.map((pill) => {
              const isActive =
                activeCategory === pill.value ||
                (pill.value === 'All' && activeCategory === 'All')
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => {
                    setActiveCategory(pill.value as 'All' | CategoryKey)
                    setQuery('')
                  }}
                  className={[
                    'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                    isActive
                      ? 'border-[#2563EB] bg-[#2563EB] text-white'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]',
                  ].join(' ')}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isSearching ? (
          <SearchResults query={query} results={searchResults} />
        ) : (
          <div className="flex flex-col gap-12">
            {visibleCategories.map((cat) => (
              <CategorySection key={cat} category={cat} />
            ))}
          </div>
        )}
      </div>

      {/* ── CTA strip ────────────────────────────────────────── */}
      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
          <div>
            <p className="text-base font-semibold text-[#0F172A]">
              Can't find what you need?
            </p>
            <p className="text-sm text-[#64748B]">
              Tell us which tool you'd like and we'll build it for free.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#2563EB] bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#1D4ED8] hover:border-[#1D4ED8] whitespace-nowrap"
          >
            <Mail size={15} />
            Contact us
          </Link>
        </div>
      </div>
    </>
  )
}
