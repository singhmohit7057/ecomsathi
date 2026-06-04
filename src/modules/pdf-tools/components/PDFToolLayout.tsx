import React from 'react'
import PDFBreadcrumb from './PDFBreadcrumb'

interface PDFToolLayoutProps {
  title: string
  description: string
  breadcrumbs?: Array<{ label: string; to?: string }>
  /** kept for backwards-compat — no longer rendered */
  relatedTools?: unknown[]
  children: React.ReactNode
  fullWidth?: boolean
}

export const PDFToolLayout: React.FC<PDFToolLayoutProps> = ({
  title,
  description,
  breadcrumbs = [],
  children,
}) => {
  const defaultCrumbs = [
    { label: 'PDF Tools', to: '/tools/pdf' },
    { label: title },
  ]
  const crumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultCrumbs

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <PDFBreadcrumb crumbs={crumbs} />

      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{title}</h1>
        <p className="text-sm text-[#64748B] mt-1 sm:text-base">{description}</p>
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  )
}

export default PDFToolLayout
