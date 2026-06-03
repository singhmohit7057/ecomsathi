// ============================================================
// SKU Tool Card
// ============================================================

import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface SKUToolCardProps {
  name: string
  href: string
  icon: React.ReactNode
  desc: string
  color: string
  iconBg: string
  badge?: string
}

const SKUToolCard: React.FC<SKUToolCardProps> = ({ name, href, icon, desc, color, iconBg, badge }) => {
  return (
    <Link
      to={href}
      className="group flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-5 transition-all duration-150 hover:border-[#2563EB] hover:shadow-[#1E293B_2px_2px_0px_0px]"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-[8px] ${iconBg} ${color}`}>
          {icon}
        </div>
        <div className="flex gap-1.5">
          {badge && (
            <span className="inline-flex items-center rounded-full bg-[#F5F3FF] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED] border border-[#DDD6FE]">
              {badge}
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A] border border-[#BBF7D0]">
            Free
          </span>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-base font-semibold text-[#0F172A] transition-colors group-hover:text-[#2563EB]">
          {name}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">{desc}</p>
      </div>

      <div className={`flex items-center gap-1 text-sm font-medium ${color}`}>
        Open Tool
        <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

export default SKUToolCard
