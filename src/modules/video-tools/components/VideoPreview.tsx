import React from 'react'
import type { VideoFile } from '../types'
import { formatBytes, formatDuration } from '../utils/formatBytes'

interface VideoPreviewProps {
  videoFile: VideoFile
  /** Show a compact row style instead of full player */
  compact?: boolean
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ videoFile, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-3">
        <video
          src={videoFile.url}
          className="w-16 h-10 rounded object-cover bg-black"
          muted
          preload="metadata"
        />
        <div className="min-w-0 flex-1 text-xs text-[#64748B]">
          <p className="font-medium text-[#0F172A] truncate">{videoFile.name}</p>
          <p className="mt-0.5">
            {formatBytes(videoFile.size)}
            {videoFile.width && videoFile.height
              ? ` · ${videoFile.width}×${videoFile.height}`
              : ''}
            {videoFile.duration
              ? ` · ${formatDuration(videoFile.duration)}`
              : ''}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden">
      {/* Video player */}
      <video
        src={videoFile.url}
        controls
        className="w-full max-h-64 bg-black object-contain"
        preload="metadata"
      />

      {/* Meta strip */}
      <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#64748B] border-t border-[#F1F5F9]">
        <MetaItem label="File" value={videoFile.name} />
        <MetaItem label="Size" value={formatBytes(videoFile.size)} />
        {videoFile.width && videoFile.height && (
          <MetaItem label="Resolution" value={`${videoFile.width}×${videoFile.height}`} />
        )}
        {videoFile.duration ? (
          <MetaItem label="Duration" value={formatDuration(videoFile.duration)} />
        ) : null}
      </div>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[#94A3B8]">{label}: </span>
      <span className="font-medium text-[#0F172A] truncate">{value}</span>
    </div>
  )
}

export default VideoPreview
