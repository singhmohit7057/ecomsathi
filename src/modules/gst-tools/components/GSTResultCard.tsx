import type { ReactNode } from 'react'

interface GSTResultCardProps {
  title?: string
  variant?: 'success' | 'info' | 'warning' | 'neutral'
  children: ReactNode
}

const variantStyles = {
  success: 'bg-[#F0FDF4] border-[#BBF7D0]',
  info:    'bg-[#F0F9FF] border-[#BAE6FD]',
  warning: 'bg-[#FFFBEB] border-[#FDE68A]',
  neutral: 'bg-white border-[#E2E8F0]',
}

const titleStyles = {
  success: 'text-[#15803D]',
  info:    'text-[#0369A1]',
  warning: 'text-[#92400E]',
  neutral: 'text-[#0F172A]',
}

export default function GSTResultCard({
  title,
  variant = 'neutral',
  children,
}: GSTResultCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${variantStyles[variant]}`}>
      {title && (
        <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${titleStyles[variant]}`}>
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

export function ResultRow({
  label,
  value,
  mono,
  bold,
}: {
  label: string
  value: string
  mono?: boolean
  bold?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'font-semibold text-[#0F172A]' : 'text-[#475569]'}`}>
        {label}
      </span>
      <span className={`${mono ? 'font-mono' : ''} ${bold ? 'text-base font-bold text-[#16A34A]' : 'text-sm text-[#0F172A]'}`}>
        {value}
      </span>
    </div>
  )
}

export function InfoGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 text-sm">{children}</div>
}

export function InfoItem({
  label,
  value,
  mono,
  span2,
}: {
  label: string
  value: string
  mono?: boolean
  span2?: boolean
}) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <p className="text-xs text-[#64748B]">{label}</p>
      <p className={`text-sm font-medium text-[#0F172A] ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
