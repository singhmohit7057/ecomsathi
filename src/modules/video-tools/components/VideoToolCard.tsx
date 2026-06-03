import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { VideoToolCardData } from '../types'

interface VideoToolCardProps {
  tool: VideoToolCardData
}

export const VideoToolCard: React.FC<VideoToolCardProps> = ({ tool }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-4 hover:shadow-[#1E293B_2px_2px_0px_0px] hover:border-[#CBD5E1] transition-all duration-150 relative">
      {tool.badge && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
          {tool.badge}
        </span>
      )}

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-[8px] border flex items-center justify-center flex-shrink-0 ${tool.accent}`}
      >
        {tool.icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1 flex-1">
        <h2 className="text-base font-semibold text-[#0F172A]">{tool.title}</h2>
        <p className="text-sm text-[#64748B] leading-relaxed">{tool.description}</p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => navigate(tool.path)}
        className="w-full px-4 py-2 text-sm font-medium text-[#2563EB] border border-[#2563EB] rounded-[4px] hover:bg-[#EFF6FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
      >
        Open Tool
      </button>
    </div>
  )
}

export default VideoToolCard
