import React from 'react'
import { FileText } from 'lucide-react'
import type { PDFFile } from '../types'
import { formatBytes } from '../utils/pdfUtils'

interface PDFPreviewProps {
  pdfFile: PDFFile
  thumbnail?: string | null
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ pdfFile, thumbnail }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex items-center gap-4">
      {/* Thumbnail */}
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center">
        {thumbnail ? (
          <img src={thumbnail} alt="PDF preview" className="h-full w-full object-cover" />
        ) : (
          <FileText size={22} className="text-[#94A3B8]" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#0F172A] truncate">{pdfFile.name}</p>
        <p className="text-xs text-[#64748B] mt-0.5">
          {formatBytes(pdfFile.size)}
          {pdfFile.pageCount != null &&
            ` · ${pdfFile.pageCount} page${pdfFile.pageCount !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  )
}

export default PDFPreview
