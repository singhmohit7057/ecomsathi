import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'

export interface RelatedTool {
  label: string
  to: string
  description?: string
}

interface RelatedToolsProps {
  tools: RelatedTool[]
}

export default function RelatedTools({ tools }: RelatedToolsProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#0F172A] border-b border-[#F1F5F9]"
      >
        Related Tools
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <ul className="p-2">
          {tools.map(t => (
            <li key={t.to}>
              <Link
                to={t.to}
                className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-[#475569] hover:bg-[#F0F9FF] hover:text-[#2563EB] transition-colors"
              >
                <span>{t.label}</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2563EB]" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
