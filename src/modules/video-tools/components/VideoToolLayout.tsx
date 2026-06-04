import React from 'react'
import VideoBreadcrumb from './VideoBreadcrumb'

interface VideoToolLayoutProps {
  title: string
  description: string
  breadcrumbs?: Array<{ label: string; to?: string }>
  children: React.ReactNode
}

export const VideoToolLayout: React.FC<VideoToolLayoutProps> = ({
  title,
  description,
  breadcrumbs = [],
  children,
}) => {
  const defaultBreadcrumbs = [
    { label: 'Tools', to: '/tools' },
    { label: 'Video Tools', to: '/tools/video' },
    { label: title },
  ]

  const crumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      <VideoBreadcrumb crumbs={crumbs} />

      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{title}</h1>
        <p className="text-sm text-[#64748B] mt-1 sm:text-base">{description}</p>
      </div>

      <div className="min-w-0 w-full">{children}</div>
    </div>
  )
}

export default VideoToolLayout
