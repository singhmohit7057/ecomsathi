// ============================================================
// SKU Tool Layout — wrapper for all individual SKU tool pages
// ============================================================

import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import SKUSidebar from './SKUSidebar'
import type { RelatedSKUTool } from '../types'

interface SKUToolLayoutProps {
  title: string
  description: string
  relatedTools?: RelatedSKUTool[]
  children: React.ReactNode
}

export const SKUToolLayout: React.FC<SKUToolLayoutProps> = ({
  title,
  description,
  relatedTools = [],
  children,
}) => {
  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-[#64748B]">
        <Link to="/" className="hover:text-[#0F172A] transition-colors shrink-0">Home</Link>
        <ChevronRight size={13} className="text-[#CBD5E1]" />
        <Link to="/tools" className="hover:text-[#0F172A] transition-colors shrink-0">Tools</Link>
        <ChevronRight size={13} className="text-[#CBD5E1]" />
        <Link to="/tools/sku" className="hover:text-[#0F172A] transition-colors shrink-0">SKU Tools</Link>
        <ChevronRight size={13} className="text-[#CBD5E1]" />
        <span className="font-medium text-[#0F172A]">{title}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{title}</h1>
        <p className="text-sm text-[#64748B] mt-1 sm:text-base">{description}</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="min-w-0 flex-1">{children}</div>

        {relatedTools.length > 0 && (
          <div className="w-full lg:w-60 xl:w-64 shrink-0">
            <SKUSidebar relatedTools={relatedTools} />
          </div>
        )}
      </div>
    </div>
  )
}

export default SKUToolLayout
