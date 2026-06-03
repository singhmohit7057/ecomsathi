import React from 'react'
import { Download, RotateCcw, CheckCircle2 } from 'lucide-react'
import { formatBytes } from '../utils/pdfUtils'

interface PDFDownloadProps {
  url: string
  filename: string
  size: number
  originalSize?: number
  label?: string
  onReset: () => void
}

export const PDFDownload: React.FC<PDFDownloadProps> = ({
  url,
  filename,
  size,
  originalSize,
  label = 'Download PDF',
  onReset,
}) => {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const savings =
    originalSize && originalSize > size
      ? Math.round(((originalSize - size) / originalSize) * 100)
      : null

  return (
    <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-5">
      <div className="flex items-center gap-2 text-[#16A34A]">
        <CheckCircle2 size={18} />
        <span className="text-sm font-semibold">Processing complete!</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#0F172A] truncate">{filename}</p>
          <p className="text-xs text-[#64748B] mt-0.5">
            {formatBytes(size)}
            {savings != null && savings > 0 && (
              <span className="ml-2 text-[#16A34A] font-medium">↓ {savings}% smaller</span>
            )}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#64748B] border border-[#E2E8F0] rounded-[4px] bg-white hover:bg-[#F8FAFC] transition-colors"
          >
            <RotateCcw size={14} />
            Start over
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#16A34A] text-white rounded-[4px] hover:bg-[#15803D] transition-colors"
          >
            <Download size={14} />
            {label}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PDFDownload
