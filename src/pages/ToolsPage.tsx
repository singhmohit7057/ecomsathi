import { useState } from 'react'
import { Search, Zap, Tag, FileText, Image, Film, Scissors, Calculator } from 'lucide-react'
import { ToolsGrid, ALL_TOOLS, CATEGORY_META } from '@/components/sections/ToolsGrid'
import { ToolCard } from '@/components/sections/ToolsGrid'

// ============================================================
// Category tab IDs
// ============================================================

const CATEGORIES = [
  'All',
  'SKU Tools',
  'PDF Tools',
  'Image Tools',
  'Video Tools',
  'Label Crop',
  'GST Tools',
] as const

type Category = (typeof CATEGORIES)[number]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'SKU Tools':   <Tag size={15} />,
  'PDF Tools':   <FileText size={15} />,
  'Image Tools': <Image size={15} />,
  'Video Tools': <Film size={15} />,
  'Label Crop':  <Scissors size={15} />,
  'GST Tools':   <Calculator size={15} />,
}

// ============================================================
// ToolsPage
// ============================================================

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const popularTools = ALL_TOOLS.filter((t) => t.isPopular)

  // Category counts (unfiltered by search so tabs always show total)
  const categoryCounts = CATEGORIES.reduce<Record<Category, number>>(
    (acc, cat) => {
      acc[cat] = cat === 'All'
        ? ALL_TOOLS.length
        : ALL_TOOLS.filter((t) => t.category === cat).length
      return acc
    },
    {} as Record<Category, number>,
  )

  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero / Search section ────────────────────────────── */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
            <Zap size={12} />
            100% Free — No account required for most tools
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl">
            50+ Free Ecommerce Tools
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#64748B]">
            Built for Indian sellers — SKU generators, PDF utilities, image optimisers,
            GST helpers, label croppers, and more. No sign-up needed.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools — e.g. barcode, GST calculator, background remover…"
                className="w-full rounded-[8px] border border-[#CBD5E1] bg-white py-3 pl-11 pr-4 text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm outline-none transition-all focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#94A3B8] hover:text-[#64748B]"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* ── Most Popular section (hidden when searching) ────── */}
        {!isSearching && activeCategory === 'All' && (
          <section className="mb-12" aria-labelledby="popular-heading">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#EFF6FF] text-[#2563EB]">
                <Zap size={16} />
              </div>
              <h2 id="popular-heading" className="text-base font-bold text-[#0F172A]">
                Most Popular
              </h2>
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#2563EB]">
                {popularTools.length} tools
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularTools.map((tool) => (
                <ToolCard key={tool.path} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* ── Category filter tabs ─────────────────────────────── */}
        {!isSearching && (
          <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat
              const meta = cat !== 'All' ? CATEGORY_META[cat] : null
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
                    isActive
                      ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-sm'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]/40 hover:text-[#2563EB]',
                  ].join(' ')}
                >
                  {cat !== 'All' && (
                    <span className={isActive ? 'text-white' : meta?.color}>
                      {CATEGORY_ICONS[cat]}
                    </span>
                  )}
                  {cat}
                  <span
                    className={[
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500',
                    ].join(' ')}
                  >
                    {categoryCounts[cat]}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Tools grid ───────────────────────────────────────── */}
        <ToolsGrid
          category={activeCategory === 'All' ? undefined : activeCategory}
          searchQuery={searchQuery}
          showCategories={activeCategory === 'All' && !isSearching}
        />

        {/* ── Footer CTA ───────────────────────────────────────── */}
        <div className="mt-16 flex flex-col items-center gap-4 rounded-[8px] border border-[#E2E8F0] bg-white py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
            <Zap size={22} />
          </div>
          <div>
            <p className="text-lg font-bold text-[#0F172A]">
              More tools coming every week
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              Have a tool request? We build what sellers need.{' '}
              <a
                href="/contact"
                className="font-semibold text-[#2563EB] hover:underline"
              >
                Let us know →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
