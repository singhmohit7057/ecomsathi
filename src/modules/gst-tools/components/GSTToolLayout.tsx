import type { ReactNode } from 'react'
import GSTBreadcrumb, { type CrumbItem } from './GSTBreadcrumb'
import GSTSidebar from './GSTSidebar'
import RelatedTools, { type RelatedTool } from './RelatedTools'
import SEO from '@/components/common/SEO'

interface GSTToolLayoutProps {
  children: ReactNode
  title: string
  metaTitle: string
  metaDescription: string
  metaKeywords?: string
  canonicalPath: string
  crumbs: CrumbItem[]
  relatedTools?: RelatedTool[]
  schema?: object
  faqs?: Array<{ q: string; a: string }>
}

export default function GSTToolLayout({
  children,
  title,
  metaTitle,
  metaDescription,
  metaKeywords,
  canonicalPath,
  crumbs,
  relatedTools,
  schema,
  faqs,
}: GSTToolLayoutProps) {
  const faqSchema = faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : undefined

  const resolvedSchema = schema ?? faqSchema

  return (
    <>
      <SEO
        title={metaTitle}
        description={metaDescription}
        keywords={metaKeywords}
        canonicalUrl={`https://ecomsathi.vercel.app${canonicalPath}`}
        schema={resolvedSchema}
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <GSTBreadcrumb crumbs={crumbs} />

          <div className="mt-4 flex gap-8 flex-col lg:flex-row">
            {/* Main content */}
            <main className="flex-1 min-w-0 space-y-6">
              {children}

              {faqs && faqs.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-lg font-bold text-[#0F172A] mb-4">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <details
                        key={i}
                        className="group border border-[#E2E8F0] rounded-lg bg-white"
                      >
                        <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-[#0F172A] list-none">
                          {faq.q}
                          <span className="ml-2 text-[#94A3B8] group-open:rotate-180 transition-transform">
                            ▾
                          </span>
                        </summary>
                        <div className="px-5 pb-4 text-sm text-[#475569] leading-relaxed">
                          {faq.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </main>

            {/* Sidebar */}
            <aside className="w-full lg:w-60 xl:w-72 shrink-0 space-y-4">
              {relatedTools && relatedTools.length > 0 && (
                <RelatedTools tools={relatedTools} />
              )}
              <GSTSidebar currentPath={canonicalPath} />
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
