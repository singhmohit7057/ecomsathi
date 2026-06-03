import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Image, Film, Calculator, Tag, Tags, Layers, Barcode, Printer, FilePlus, Scissors, ScanText, FileDown, FileImage, Images, Eraser, Maximize2, Crop, Package, ArrowLeftRight, RefreshCw, Camera, Video, Maximize, RefreshCcw, Search, ShieldCheck, RotateCcw, BookOpen, Percent } from 'lucide-react'
import type { PopularToolData } from '../types'

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, FilePlus, FileDown, FileImage,
  Images, Scissors, ScanText, Eraser, Maximize2, Crop, Package,
  ArrowLeftRight, RefreshCw, Film, Camera, Video, Maximize, Image,
  RefreshCcw, Search, ShieldCheck, Calculator, RotateCcw,
  BookOpen, Percent, Tag, Tags, Layers, Barcode, Printer,
}

const COLOR_SCHEME = {
  blue:   { bg: 'bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]', border: 'border-[#BFDBFE]', icon: 'bg-[#2563EB]', badge: 'bg-[#DBEAFE] text-[#2563EB]', link: 'text-[#2563EB]' },
  green:  { bg: 'bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]', border: 'border-[#BBF7D0]', icon: 'bg-[#16A34A]', badge: 'bg-[#DCFCE7] text-[#16A34A]', link: 'text-[#16A34A]' },
  rose:   { bg: 'bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6]', border: 'border-[#FECDD3]', icon: 'bg-[#E11D48]', badge: 'bg-[#FFE4E6] text-[#E11D48]', link: 'text-[#E11D48]' },
  cyan:   { bg: 'bg-gradient-to-br from-[#ECFEFF] to-[#CFFAFE]', border: 'border-[#A5F3FC]', icon: 'bg-[#0891B2]', badge: 'bg-[#CFFAFE] text-[#0891B2]', link: 'text-[#0891B2]' },
  violet: { bg: 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]', border: 'border-[#DDD6FE]', icon: 'bg-[#7C3AED]', badge: 'bg-[#EDE9FE] text-[#7C3AED]', link: 'text-[#7C3AED]' },
  amber:  { bg: 'bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]', border: 'border-[#FDE68A]', icon: 'bg-[#D97706]', badge: 'bg-[#FEF3C7] text-[#D97706]', link: 'text-[#D97706]' },
}

const CATEGORY_ICONS: Record<string, string> = {
  'PDF Tools':   'FilePlus',
  'Image Tools': 'Image',
  'Video Tools': 'Film',
  'GST Tools':   'Calculator',
  'SKU Tools':   'Tag',
  'Label Crop':  'Scissors',
}

interface FeaturedToolCardProps {
  tool: PopularToolData
}

export default function FeaturedToolCard({ tool }: FeaturedToolCardProps) {
  const iconName = CATEGORY_ICONS[tool.category] ?? 'FileText'
  const IconComponent = ICON_MAP[iconName] ?? FileText
  const scheme = COLOR_SCHEME[tool.colorScheme]

  return (
    <Link
      to={tool.path}
      className={`group flex flex-col gap-4 rounded-xl border ${scheme.border} ${scheme.bg} p-5 transition-all duration-150 shadow-[#E2E8F0_2px_2px_0px_0px] hover:shadow-[#1E293B_3px_3px_0px_0px]`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${scheme.icon}`}>
          <IconComponent size={18} className="text-white" strokeWidth={2} />
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scheme.badge}`}>
          {tool.category}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#0F172A]">{tool.name}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#64748B]">{tool.description}</p>
      </div>
      <div className={`inline-flex items-center gap-1 text-xs font-semibold ${scheme.link}`}>
        Use Free
        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}
