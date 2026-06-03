import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  to?: string
}

interface PDFBreadcrumbProps {
  crumbs: Crumb[]
}

export const PDFBreadcrumb: React.FC<PDFBreadcrumbProps> = ({ crumbs }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-[#64748B]">
      <Link to="/" className="hover:text-[#0F172A] transition-colors shrink-0">
        Home
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
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
  )
}

export default PDFBreadcrumb
