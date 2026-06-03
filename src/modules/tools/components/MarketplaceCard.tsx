import { Check } from 'lucide-react'
import type { MarketplaceData } from '../types'

interface MarketplaceCardProps {
  marketplace: MarketplaceData
}

export default function MarketplaceCard({ marketplace }: MarketplaceCardProps) {
  const initial = marketplace.name.charAt(0)

  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-white/12 hover:border-white/20">
      {/* Marketplace initial avatar */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
        style={{ backgroundColor: marketplace.accentColor }}
      >
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{marketplace.name}</span>
          {marketplace.badge && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: marketplace.accentColor + '40', border: `1px solid ${marketplace.accentColor}60` }}
            >
              {marketplace.badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-white/60">Label Crop Supported</p>
      </div>

      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Check size={12} className="text-white/80" strokeWidth={2.5} />
      </div>
    </div>
  )
}
