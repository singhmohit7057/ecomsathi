import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface CrumbItem {
  label: string
  to?: string
}

interface GSTBreadcrumbProps {
  crumbs: CrumbItem[]
}

export default function GSTBreadcrumb({ crumbs }: GSTBreadcrumbProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://ecomsathi.vercel.app/',
      },
      ...crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: c.label,
        ...(c.to ? { item: `https://ecomsathi.vercel.app${c.to}` } : {}),
      })),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-[#64748B] flex-wrap">
        <Link to="/" className="flex items-center gap-1 hover:text-[#0F172A] transition-colors">
          <Home size={13} />
          <span>Home</span>
        </Link>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={13} className="text-[#CBD5E1]" />
            {crumb.to ? (
              <Link to={crumb.to} className="hover:text-[#0F172A] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-[#0F172A]">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
