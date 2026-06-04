import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Merge, Scissors, Crop, ScanText, FileArchive, Unlock,
  RotateCw, FileMinus, LayoutGrid, ImageIcon, Stamp, Hash,
} from 'lucide-react'
import type { RelatedPDFTool } from '../types'

interface RelatedPDFToolsProps {
  tools: RelatedPDFTool[]
  title?: string
}

const ICON_MAP: Record<string, React.ReactNode> = {
  '/pdf/merge':            <Merge size={18} />,
  '/pdf/split':            <Scissors size={18} />,
  '/pdf/crop':             <Crop size={18} />,
  '/pdf/ocr':              <ScanText size={18} />,
  '/pdf/compress':         <FileArchive size={18} />,
  '/pdf/password-remover': <Unlock size={18} />,
  '/pdf/rotate':           <RotateCw size={18} />,
  '/pdf/extract-pages':    <FileMinus size={18} />,
  '/pdf/rearrange-pages':  <LayoutGrid size={18} />,
  '/pdf/pdf-to-image':     <ImageIcon size={18} />,
  '/pdf/watermark':        <Stamp size={18} />,
  '/pdf/page-numbers':     <Hash size={18} />,
}

export const RelatedPDFTools: React.FC<RelatedPDFToolsProps> = ({
  tools,
  title = 'Related PDF Tools',
}) => {
  const navigate = useNavigate()

  if (tools.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-[#0F172A]">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.to}
            type="button"
            onClick={() => navigate(tool.to)}
            className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-[8px] p-4 text-left hover:shadow-[#1E293B_2px_2px_0px_0px] hover:border-[#CBD5E1] transition-all"
          >
            <div className="w-9 h-9 rounded-[6px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              {ICON_MAP[tool.to] ?? <FilePlus size={18} />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">{tool.label}</p>
              {tool.description && (
                <p className="text-xs text-[#64748B] truncate mt-0.5">{tool.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default RelatedPDFTools
