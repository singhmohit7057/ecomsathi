import { useState, Suspense, lazy } from 'react'
import { Outlet, Link, useMatches } from 'react-router-dom'
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'

const Navbar = lazy(() => import('@/components/common/Navbar'))
const Footer = lazy(() => import('@/components/common/Footer'))

// ============================================================
// Types
// ============================================================

// Each tool route can export a `handle` object with metadata.
// e.g.: export const handle = { toolName: 'SKU Generator', category: 'SKU Tools', description: '...' }
interface ToolHandle {
  toolName?: string
  category?: string
  description?: string
  relatedTools?: Array<{ label: string; to: string }>
  crumbs?: Array<{ label: string; to?: string }>
}

// ============================================================
// Related tools sidebar (collapsible on mobile)
// ============================================================

function RelatedTools({
  tools,
}: {
  tools: Array<{ label: string; to: string }>
}) {
  const [open, setOpen] = useState(true)

  return (
    <aside className="w-full lg:w-56 xl:w-64 shrink-0">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800"
          onClick={() => setOpen((v) => !v)}
        >
          Related Tools
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {open && (
          <ul className="border-t border-gray-100 p-2">
            {tools.map((t) => (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-[var(--color-primary-light,#e0f2fe)] hover:text-[var(--color-primary)]"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

// ============================================================
// ToolsLayout
// ============================================================

export default function ToolsLayout() {
  // Pull metadata from the deepest matched route's `handle`
  const matches = useMatches()
  const handle = (matches.at(-1)?.handle ?? {}) as ToolHandle

  const {
    toolName,
    category,
    description,
    relatedTools,
  } = handle

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-[var(--color-text)]">
      {/* Sticky Navbar */}
      <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
        <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
          <Navbar />
        </header>
      </Suspense>

      {/* Tool header band */}
      {(toolName || category) && (
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                {toolName && (
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{toolName}</h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-500 sm:text-base">{description}</p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {/* No login required badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
                  <CheckCircle2 size={12} />
                  No login required
                </span>

                {/* Category badge */}
                {category && (
                  <span className="inline-flex items-center rounded-full bg-[var(--color-primary-light,#e0f2fe)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
                    {category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main area: tool content + optional related sidebar */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div
          className={clsx(
            'flex gap-6',
            relatedTools?.length ? 'flex-col lg:flex-row' : 'flex-col',
          )}
        >
          {/* Tool content */}
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>

          {/* Related tools sidebar */}
          {relatedTools && relatedTools.length > 0 && (
            <RelatedTools tools={relatedTools} />
          )}
        </div>
      </main>

      {/* Footer */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  )
}
