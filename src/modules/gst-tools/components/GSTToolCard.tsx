import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface GSTToolCardProps {
  title: string
  description: string
  icon: React.ReactNode
  to: string
  badge?: string
  badgeColor?: 'green' | 'blue' | 'orange'
  gradient: string
}

export default function GSTToolCard({
  title,
  description,
  icon,
  to,
  badge,
  badgeColor = 'green',
  gradient,
}: GSTToolCardProps) {
  const badgeClass =
    badgeColor === 'blue'
      ? 'bg-blue-100 text-blue-700'
      : badgeColor === 'orange'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-green-100 text-green-700'

  return (
    <Link
      to={to}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`${gradient} px-5 pt-5 pb-4`}>
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-white rounded-lg shadow-sm text-[#374151]">{icon}</div>
          {badge && (
            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col flex-1 px-5 py-4">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1 group-hover:text-[#2563EB] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[#64748B] leading-relaxed flex-1">{description}</p>
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity">
          Use Tool <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  )
}
