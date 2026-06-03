import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Image, Film, Calculator, Tag, Scissors } from 'lucide-react'
import ToolCard from './ToolCard'
import type { ToolCategoryData } from '../types'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  pdf:   FileText,
  image: Image,
  video: Film,
  gst:   Calculator,
  sku:   Tag,
}

const COLOR_SCHEME_STYLES = {
  blue: {
    heading:    'text-[#2563EB]',
    iconBg:     'bg-[#DBEAFE]',
    iconColor:  'text-[#2563EB]',
    sectionBg:  'bg-white',
    headerBg:   'bg-[#EFF6FF]',
    headerBorder:'border-[#BFDBFE]',
    button:     'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]',
    divider:    'bg-[#DBEAFE]',
    count:      'bg-[#DBEAFE] text-[#2563EB]',
  },
  green: {
    heading:    'text-[#16A34A]',
    iconBg:     'bg-[#DCFCE7]',
    iconColor:  'text-[#16A34A]',
    sectionBg:  'bg-[#F8FAFC]',
    headerBg:   'bg-[#F0FDF4]',
    headerBorder:'border-[#BBF7D0]',
    button:     'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7]',
    divider:    'bg-[#DCFCE7]',
    count:      'bg-[#DCFCE7] text-[#16A34A]',
  },
  rose: {
    heading:    'text-[#E11D48]',
    iconBg:     'bg-[#FFE4E6]',
    iconColor:  'text-[#E11D48]',
    sectionBg:  'bg-white',
    headerBg:   'bg-[#FFF1F2]',
    headerBorder:'border-[#FECDD3]',
    button:     'border-[#E11D48] bg-[#FFF1F2] text-[#E11D48] hover:bg-[#FFE4E6]',
    divider:    'bg-[#FFE4E6]',
    count:      'bg-[#FFE4E6] text-[#E11D48]',
  },
  cyan: {
    heading:    'text-[#0891B2]',
    iconBg:     'bg-[#CFFAFE]',
    iconColor:  'text-[#0891B2]',
    sectionBg:  'bg-[#F8FAFC]',
    headerBg:   'bg-[#ECFEFF]',
    headerBorder:'border-[#A5F3FC]',
    button:     'border-[#0891B2] bg-[#ECFEFF] text-[#0891B2] hover:bg-[#CFFAFE]',
    divider:    'bg-[#CFFAFE]',
    count:      'bg-[#CFFAFE] text-[#0891B2]',
  },
  violet: {
    heading:    'text-[#7C3AED]',
    iconBg:     'bg-[#EDE9FE]',
    iconColor:  'text-[#7C3AED]',
    sectionBg:  'bg-white',
    headerBg:   'bg-[#F5F3FF]',
    headerBorder:'border-[#DDD6FE]',
    button:     'border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED] hover:bg-[#EDE9FE]',
    divider:    'bg-[#EDE9FE]',
    count:      'bg-[#EDE9FE] text-[#7C3AED]',
  },
  amber: {
    heading:    'text-[#D97706]',
    iconBg:     'bg-[#FEF3C7]',
    iconColor:  'text-[#D97706]',
    sectionBg:  'bg-[#F8FAFC]',
    headerBg:   'bg-[#FFFBEB]',
    headerBorder:'border-[#FDE68A]',
    button:     'border-[#D97706] bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]',
    divider:    'bg-[#FEF3C7]',
    count:      'bg-[#FEF3C7] text-[#D97706]',
  },
}

interface ToolCategorySectionProps {
  category: ToolCategoryData
}

export default function ToolCategorySection({ category }: ToolCategorySectionProps) {
  const IconComponent = CATEGORY_ICONS[category.id] ?? FileText
  const styles = COLOR_SCHEME_STYLES[category.colorScheme]

  return (
    <section className={`${styles.sectionBg} py-14`} aria-labelledby={`category-${category.id}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconColor} shadow-[#E2E8F0_2px_2px_0px_0px]`}>
              <IconComponent size={22} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={`category-${category.id}`} className={`text-xl font-bold text-[#0F172A] md:text-2xl`}>
                  {category.title}
                </h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${styles.count}`}>
                  {category.tools.length}+ tools
                </span>
              </div>
              <p className="mt-1 text-sm text-[#64748B]">{category.description}</p>
            </div>
          </div>

          <Link
            to={category.href}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border px-4 py-2 text-sm font-semibold transition-all ${styles.button} shadow-[#E2E8F0_1px_1px_0px_0px] hover:shadow-[#1E293B_2px_2px_0px_0px]`}
          >
            {category.buttonText}
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {category.tools.map((tool) => (
            <ToolCard key={tool.path} tool={tool} colorScheme={category.colorScheme} />
          ))}
        </div>

        {/* Bottom link */}
        <div className="mt-6 text-center">
          <Link
            to={category.href}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold ${styles.heading} hover:underline`}
          >
            See all {category.title}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
