import { Link } from 'react-router-dom'
import {
  FileText, FilePlus, FileDown, FileImage, Images, Scissors, ScanText,
  Eraser, Maximize2, Crop, Package, ArrowLeftRight, RefreshCw, Film,
  Camera, Video, Maximize, RefreshCcw, Search, ShieldCheck, Calculator,
  RotateCcw, BookOpen, Percent, Tag, Tags, Layers, Barcode, Printer, Image,
  ShoppingCart, Shirt, Store, Heart, Zap, ShoppingBag,
} from 'lucide-react'
import type { ToolItem } from '../types'

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, FilePlus, FileDown, FileImage,
  Images, Scissors, ScanText, Eraser, Maximize2, Crop, Package,
  ArrowLeftRight, RefreshCw, Film, Camera, Video, Maximize,
  RefreshCcw, Image, ImageIcon: Image, Search, ShieldCheck, Calculator,
  RotateCcw, BookOpen, Percent, Tag, Tags, Layers, Barcode, Printer,
  ShoppingCart, Shirt, Store, Heart, Zap, ShoppingBag,
}

const SCHEME = {
  blue:   { iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#2563EB]', hoverBorder: 'hover:border-[#93C5FD]', activeLine: 'bg-[#2563EB]' },
  green:  { iconBg: 'bg-[#F0FDF4]', iconColor: 'text-[#16A34A]', hoverBorder: 'hover:border-[#86EFAC]', activeLine: 'bg-[#16A34A]' },
  rose:   { iconBg: 'bg-[#FFF1F2]', iconColor: 'text-[#E11D48]', hoverBorder: 'hover:border-[#FCA5A5]', activeLine: 'bg-[#E11D48]' },
  cyan:   { iconBg: 'bg-[#ECFEFF]', iconColor: 'text-[#0891B2]', hoverBorder: 'hover:border-[#67E8F9]', activeLine: 'bg-[#0891B2]' },
  violet: { iconBg: 'bg-[#F5F3FF]', iconColor: 'text-[#7C3AED]', hoverBorder: 'hover:border-[#C4B5FD]', activeLine: 'bg-[#7C3AED]' },
  amber:  { iconBg: 'bg-[#FFFBEB]', iconColor: 'text-[#D97706]', hoverBorder: 'hover:border-[#FCD34D]', activeLine: 'bg-[#D97706]' },
}

interface ToolCardProps {
  tool: ToolItem
  colorScheme: keyof typeof SCHEME
}

export default function ToolCard({ tool, colorScheme }: ToolCardProps) {
  const Icon = ICON_MAP[tool.iconName] ?? FileText
  const s = SCHEME[colorScheme]

  return (
    <Link
      to={tool.path}
      className={`group relative flex flex-col items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white p-4 text-center transition-all duration-150 ${s.hoverBorder} hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* Colored top line on hover */}
      <div className={`absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${s.activeLine}`} />

      <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${s.iconBg} ${s.iconColor} transition-transform group-hover:scale-110`}>
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <span className="text-[13px] font-semibold text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors">
        {tool.name}
      </span>
    </Link>
  )
}
