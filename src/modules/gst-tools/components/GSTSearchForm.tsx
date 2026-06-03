import { Search } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface GSTSearchFormProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
  label?: string
  maxLength?: number
  loading?: boolean
  buttonLabel?: string
  hint?: string
  mono?: boolean
  error?: string
}

export default function GSTSearchForm({
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter value...',
  label,
  maxLength,
  loading = false,
  buttonLabel = 'Search',
  hint,
  mono = false,
  error,
}: GSTSearchFormProps) {
  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-[#374151]">{label}</label>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === 'Enter') onSubmit() }}
            placeholder={placeholder}
            maxLength={maxLength}
            className={[
              'w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all',
              mono ? 'font-mono tracking-widest text-base' : 'text-sm',
            ].join(' ')}
          />
        </div>
        <Button onClick={onSubmit} loading={loading} disabled={!value.trim()}>
          {buttonLabel}
        </Button>
      </div>
      {hint && <p className="text-xs text-[#94A3B8]">{hint}</p>}
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  )
}
