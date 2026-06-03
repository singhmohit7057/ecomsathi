import { Link } from 'react-router-dom'
import { ArrowRight, FileType2, Image, Film, Calculator, Tag, Scissors } from 'lucide-react'
import ToolCard from './ToolCard'
import type { ToolCategoryData } from '../types'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  pdf:   FileType2,
  image: Image,
  video: Film,
  gst:   Calculator,
  sku:   Tag,
  label: Scissors,
}

const SCHEME = {
  blue:   { accent: '#2563EB', light: '#EFF6FF', border: '#BFDBFE', iconBg: 'bg-[#DBEAFE]', iconColor: 'text-[#2563EB]', badge: 'bg-[#DBEAFE] text-[#2563EB]', btn: 'text-[#2563EB] hover:bg-[#EFF6FF]' },
  green:  { accent: '#16A34A', light: '#F0FDF4', border: '#BBF7D0', iconBg: 'bg-[#DCFCE7]', iconColor: 'text-[#16A34A]', badge: 'bg-[#DCFCE7] text-[#16A34A]', btn: 'text-[#16A34A] hover:bg-[#F0FDF4]' },
  rose:   { accent: '#E11D48', light: '#FFF1F2', border: '#FECDD3', iconBg: 'bg-[#FFE4E6]', iconColor: 'text-[#E11D48]', badge: 'bg-[#FFE4E6] text-[#E11D48]', btn: 'text-[#E11D48] hover:bg-[#FFF1F2]' },
  cyan:   { accent: '#0891B2', light: '#ECFEFF', border: '#A5F3FC', iconBg: 'bg-[#CFFAFE]', iconColor: 'text-[#0891B2]', badge: 'bg-[#CFFAFE] text-[#0891B2]', btn: 'text-[#0891B2] hover:bg-[#ECFEFF]' },
  violet: { accent: '#7C3AED', light: '#F5F3FF', border: '#DDD6FE', iconBg: 'bg-[#EDE9FE]', iconColor: 'text-[#7C3AED]', badge: 'bg-[#EDE9FE] text-[#7C3AED]', btn: 'text-[#7C3AED] hover:bg-[#F5F3FF]' },
  amber:  { accent: '#D97706', light: '#FFFBEB', border: '#FDE68A', iconBg: 'bg-[#FEF3C7]', iconColor: 'text-[#D97706]', badge: 'bg-[#FEF3C7] text-[#D97706]', btn: 'text-[#D97706] hover:bg-[#FFFBEB]' },
}

interface Props {
  category: ToolCategoryData
}

export default function ToolCategorySection({ category }: Props) {
  const Icon = CATEGORY_ICONS[category.id] ?? FileType2
  const s = SCHEME[category.colorScheme]

  return (
    <div
      id={`cat-${category.id}`}
      className="rounded-2xl border border-[#E2E8F0] overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ backgroundColor: s.light, borderBottom: `1px solid ${s.border}` }}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${s.iconBg} ${s.iconColor}`}>
            <Icon size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A]">{category.title}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.badge}`}>
                {category.tools.length} tools
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">{category.description}</p>
          </div>
        </div>
        <Link
          to={category.href}
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-current px-3 py-1.5 text-xs font-semibold transition-all ${s.btn}`}
        >
          {category.buttonText}
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 divide-x divide-y divide-[#F1F5F9] bg-white">
        {category.tools.map((tool) => (
          <ToolCard key={tool.path} tool={tool} colorScheme={category.colorScheme} />
        ))}
      </div>

      {/* Mobile footer */}
      <div
        className="sm:hidden flex justify-center px-4 py-3"
        style={{ backgroundColor: s.light, borderTop: `1px solid ${s.border}` }}
      >
        <Link
          to={category.href}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold ${s.btn} transition-colors`}
        >
          {category.buttonText} <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
