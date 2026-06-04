import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Video } from 'lucide-react'
import type { RelatedTool } from '../types'

interface VideoSidebarProps {
  relatedTools: RelatedTool[]
  title?: string
}

export const VideoSidebar: React.FC<VideoSidebarProps> = ({
  relatedTools,
  title = 'Related Video Tools',
}) => {
  const [open, setOpen] = useState(true)

  return (
    <aside className="w-full">
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#0F172A]"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <Video size={14} className="text-[#2563EB]" />
            {title}
          </span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {open && (
          <ul className="border-t border-[#F1F5F9] p-2">
            {relatedTools.map((tool) => (
              <li key={tool.to}>
                <Link
                  to={tool.to}
                  className="flex flex-col gap-0.5 rounded-[6px] px-3 py-2.5 text-sm text-[#64748B] transition-colors hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                >
                  <span className="font-medium text-[#0F172A]">{tool.label}</span>
                  {tool.description && (
                    <span className="text-xs text-[#94A3B8] leading-relaxed">
                      {tool.description}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick links to other tool categories */}
      <div className="mt-4 rounded-[8px] border border-[#E2E8F0] bg-white p-4">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
          Other Tools
        </p>
        <ul className="flex flex-col gap-1.5 text-sm">
          {[
            { label: 'Image Tools', to: '/image' },
            { label: 'PDF Tools',   to: '/tools/pdf' },
            { label: 'SKU Tools',   to: '/tools/sku' },
            { label: 'GST Tools',   to: '/gst' },
          ].map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="text-[#64748B] hover:text-[#2563EB] transition-colors"
              >
                {link.label} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default VideoSidebar
