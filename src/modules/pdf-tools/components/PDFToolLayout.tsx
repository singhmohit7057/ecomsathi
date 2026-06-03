import React from 'react'
import PDFBreadcrumb from './PDFBreadcrumb'
import PDFSidebar from './PDFSidebar'
import RelatedPDFTools from './RelatedPDFTools'
import type { RelatedPDFTool } from '../types'

interface PDFToolLayoutProps {
  title: string
  description: string
  breadcrumbs?: Array<{ label: string; to?: string }>
  relatedTools?: RelatedPDFTool[]
  children: React.ReactNode
  fullWidth?: boolean
}

export const PDFToolLayout: React.FC<PDFToolLayoutProps> = ({
  title,
  description,
  breadcrumbs = [],
  relatedTools = [],
  children,
  fullWidth = false,
}) => {
  const defaultCrumbs = [
    { label: 'PDF Tools', to: '/pdf' },
    { label: title },
  ]
  const crumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultCrumbs

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      <PDFBreadcrumb crumbs={crumbs} />

      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{title}</h1>
        <p className="text-sm text-[#64748B] mt-1 sm:text-base">{description}</p>
      </div>

      <div className={`flex gap-6 ${fullWidth ? 'flex-col' : 'flex-col lg:flex-row'}`}>
        <div className="min-w-0 flex-1">{children}</div>

        {!fullWidth && relatedTools.length > 0 && (
          <div className="w-full lg:w-60 xl:w-64 shrink-0">
            <PDFSidebar relatedTools={relatedTools} />
          </div>
        )}
      </div>

      {fullWidth && relatedTools.length > 0 && (
        <RelatedPDFTools tools={relatedTools} />
      )}
    </div>
  )
}

export default PDFToolLayout
