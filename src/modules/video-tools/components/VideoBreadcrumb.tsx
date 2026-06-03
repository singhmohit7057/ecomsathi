import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface VideoBreadcrumbProps {
  crumbs: BreadcrumbItem[]
}

export const VideoBreadcrumb: React.FC<VideoBreadcrumbProps> = ({ crumbs }) => {
  // Build schema breadcrumb list
  const schemaItems = [
    { name: 'Home', item: 'https://ecomsathi.vercel.app/' },
    ...crumbs.map((c, i) => ({
      name: c.label,
      item: c.to
        ? `https://ecomsathi.vercel.app${c.to}`
        : `https://ecomsathi.vercel.app/#${i}`,
    })),
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.item,
    })),
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Visual breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm text-[#64748B]"
      >
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-[#0F172A] transition-colors"
          aria-label="Home"
        >
          <Home size={13} />
        </Link>

        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <ChevronRight size={13} className="text-[#CBD5E1] shrink-0" />
            {crumb.to ? (
              <Link to={crumb.to} className="hover:text-[#0F172A] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-[#0F172A]">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  )
}

export default VideoBreadcrumb
