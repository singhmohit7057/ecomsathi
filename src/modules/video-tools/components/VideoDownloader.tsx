import React from 'react'
import { Download, CheckCircle2, RefreshCw } from 'lucide-react'
import { formatBytes } from '../utils/formatBytes'

interface VideoDownloaderProps {
  url: string
  filename: string
  size?: number
  label?: string
  originalSize?: number
  onReset?: () => void
}

export const VideoDownloader: React.FC<VideoDownloaderProps> = ({
  url,
  filename,
  size,
  label = 'Download',
  originalSize,
  onReset,
}) => {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const savingPct =
    originalSize && size && originalSize > 0
      ? Math.round(((originalSize - size) / originalSize) * 100)
      : null

  return (
    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[8px] p-4 flex flex-col gap-3">
      {/* Success badge */}
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />
        <p className="text-sm font-semibold text-[#166534]">Processing complete!</p>
      </div>

      {/* Stats row */}
      {(size !== undefined || savingPct !== null) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#64748B]">
          {originalSize !== undefined && (
            <span>Original: <strong className="text-[#0F172A]">{formatBytes(originalSize)}</strong></span>
          )}
          {size !== undefined && (
            <span>Output: <strong className="text-[#0F172A]">{formatBytes(size)}</strong></span>
          )}
          {savingPct !== null && savingPct > 0 && (
            <span>Saved: <strong className="text-[#16A34A]">{savingPct}%</strong></span>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#16A34A] text-white rounded-[4px] hover:bg-[#15803D] transition-colors"
        >
          <Download size={15} />
          {label}
        </button>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white text-[#0F172A] border border-[#E2E8F0] rounded-[4px] hover:bg-[#F8FAFC] transition-colors"
          >
            <RefreshCw size={14} />
            Process Another
          </button>
        )}
      </div>
    </div>
  )
}

export default VideoDownloader
