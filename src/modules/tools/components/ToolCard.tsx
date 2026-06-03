import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Image, Film, Calculator, Tag, Tags, Layers, Barcode, Printer, FilePlus, Scissors, ScanText, FileDown, FileImage, Images, Eraser, Maximize2, Crop, Package, ArrowLeftRight, RefreshCw, Camera, Video, Maximize, RefreshCcw, Search, ShieldCheck, RotateCcw, BookOpen, Percent } from 'lucide-react'
import type { ToolItem } from '../types'

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, FilePlus, FileDown, FileImage,
  Images, Scissors, ScanText, Eraser, Maximize2, Crop, Package,
  ArrowLeftRight, RefreshCw, Film, Camera, Video, Maximize,
  RefreshCcw, Image, ImageIcon: Image, Search, ShieldCheck, Calculator, RotateCcw,
  BookOpen, Percent, Tag, Tags, Layers, Barcode, Printer,
}

const COLOR_SCHEME_CLASSES = {
  blue:   { icon: 'bg-[#DBEAFE] text-[#2563EB]', hover: 'hover:border-[#BFDBFE] hover:bg-[#EFF6FF]' },
  green:  { icon: 'bg-[#DCFCE7] text-[#16A34A]', hover: 'hover:border-[#BBF7D0] hover:bg-[#F0FDF4]' },
  rose:   { icon: 'bg-[#FFE4E6] text-[#E11D48]', hover: 'hover:border-[#FECDD3] hover:bg-[#FFF1F2]' },
  cyan:   { icon: 'bg-[#CFFAFE] text-[#0891B2]', hover: 'hover:border-[#A5F3FC] hover:bg-[#ECFEFF]' },
  violet: { icon: 'bg-[#EDE9FE] text-[#7C3AED]', hover: 'hover:border-[#DDD6FE] hover:bg-[#F5F3FF]' },
  amber:  { icon: 'bg-[#FEF3C7] text-[#D97706]', hover: 'hover:border-[#FDE68A] hover:bg-[#FFFBEB]' },
}

interface ToolCardProps {
  tool: ToolItem
  colorScheme: 'blue' | 'cyan' | 'green' | 'rose' | 'violet' | 'amber'
}

export default function ToolCard({ tool, colorScheme }: ToolCardProps) {
  const IconComponent = ICON_MAP[tool.iconName] ?? FileText
  const scheme = COLOR_SCHEME_CLASSES[colorScheme]

  return (
    <Link
      to={tool.path}
      className={`group flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 transition-all duration-150 shadow-[#E2E8F0_1px_1px_0px_0px] ${scheme.hover} hover:shadow-[#1E293B_2px_2px_0px_0px]`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] ${scheme.icon}`}>
        <IconComponent size={15} strokeWidth={2} />
      </div>
      <span className="text-sm font-medium text-[#0F172A] leading-tight">{tool.name}</span>
      <ArrowRight size={13} className="ml-auto shrink-0 text-[#CBD5E1] transition-transform group-hover:translate-x-0.5 group-hover:text-[#64748B]" />
    </Link>
  )
}
