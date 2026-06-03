import React from 'react'
import { Loader2 } from 'lucide-react'
import type { ProcessingStatus } from '../types'

interface ProcessingBarProps {
  status: ProcessingStatus
  progress: number
  error?: string | null
  label?: string
}

export const ProcessingBar: React.FC<ProcessingBarProps> = ({
  status,
  progress,
  error,
  label = 'Processing…',
}) => {
  if (status === 'idle' || status === 'done') return null

  if (status === 'error') {
    return (
      <div className="bg-[#FFF1F2] border border-[#FCA5A5] rounded-[6px] p-3 text-sm text-[#DC2626]">
        <strong>Error:</strong> {error ?? 'Something went wrong. Please try again.'}
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-[#0F172A]">
        <Loader2 size={15} className="animate-spin text-[#2563EB] shrink-0" />
        <span className="font-medium">
          {status === 'loading' ? 'Loading FFmpeg…' : label}
        </span>
        {status === 'processing' && progress > 0 && (
          <span className="ml-auto text-[#64748B] tabular-nums">{progress}%</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
          style={{ width: status === 'loading' ? '15%' : `${progress}%` }}
        />
      </div>

      <p className="text-xs text-[#94A3B8]">
        {status === 'loading'
          ? 'Loading video processing engine (this only happens once)…'
          : 'Processing your video in the browser. Please wait…'}
      </p>
    </div>
  )
}

export default ProcessingBar
