import React from 'react'
import VideoBreadcrumb from './VideoBreadcrumb'
import VideoSidebar from './VideoSidebar'
import RelatedVideoTools from './RelatedVideoTools'
import type { RelatedTool } from '../types'

interface VideoToolLayoutProps {
  title: string
  description: string
  breadcrumbs?: Array<{ label: string; to?: string }>
  relatedTools?: RelatedTool[]
  children: React.ReactNode
  /** If true, the main content takes full width (no sidebar). Default: false */
  fullWidth?: boolean
}

export const VideoToolLayout: React.FC<VideoToolLayoutProps> = ({
  title,
  description,
  breadcrumbs = [],
  relatedTools = [],
  children,
  fullWidth = false,
}) => {
  const defaultBreadcrumbs = [
    { label: 'Tools', to: '/tools' },
    { label: 'Video Tools', to: '/tools/video' },
    { label: title },
  ]

  const crumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <VideoBreadcrumb crumbs={crumbs} />

      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{title}</h1>
        <p className="text-sm text-[#64748B] mt-1 sm:text-base">{description}</p>
      </div>

      {/* Content + Sidebar */}
      <div className={`flex gap-6 ${fullWidth ? 'flex-col' : 'flex-col lg:flex-row'}`}>
        {/* Main content */}
        <div className="min-w-0 flex-1">{children}</div>

        {/* Sidebar */}
        {!fullWidth && relatedTools.length > 0 && (
          <div className="w-full lg:w-60 xl:w-64 shrink-0">
            <VideoSidebar relatedTools={relatedTools} />
          </div>
        )}
      </div>

      {/* Related tools section (full-width below main content) */}
      {fullWidth && relatedTools.length > 0 && (
        <RelatedVideoTools tools={relatedTools} />
      )}
    </div>
  )
}

export default VideoToolLayout
