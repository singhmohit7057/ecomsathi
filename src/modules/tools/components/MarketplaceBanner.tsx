import { Link } from 'react-router-dom'
import { ArrowRight, Scissors, Zap, Layers, Printer, Check } from 'lucide-react'
import MarketplaceCard from './MarketplaceCard'
import { MARKETPLACES } from '../data/toolCategories'

const FEATURES = [
  { icon: Zap,     label: 'Auto Crop',           desc: 'Automatic label detection' },
  { icon: Layers,  label: 'Bulk Crop',            desc: 'Process hundreds at once' },
  { icon: Printer, label: 'A4 Label Support',     desc: 'Standard A4 label sheets' },
  { icon: Printer, label: 'Thermal Label Support',desc: 'Thermal printer compatible' },
]

export default function MarketplaceBanner() {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-20"
      aria-labelledby="label-crop-heading"
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
      }}
    >
      {/* Decorative grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative glow orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#6366F1]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-[#2563EB]/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
              <Scissors size={12} className="text-[#FCD34D]" />
              Label Crop Tools
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
              <span className="text-[#4ADE80]">Live</span>
            </div>

            <h2
              id="label-crop-heading"
              className="text-2xl font-bold text-white md:text-3xl lg:text-4xl"
              style={{ letterSpacing: '-0.5px' }}
            >
              Auto-Crop Labels for{' '}
              <span className="bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] bg-clip-text text-transparent">
                Every Marketplace
              </span>
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/60 md:text-base">
              Stop wasting time manually cropping shipping labels. EcomSathi automatically
              detects and crops labels from multi-label PDFs across all major Indian marketplaces.
            </p>
          </div>

          <Link
            to="/label-crop"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] px-5 py-3 text-sm font-bold text-[#0F172A] shadow-[#FCD34D40_0px_0px_20px_0px] transition-all duration-150 hover:from-[#FDE68A] hover:to-[#FCD34D] hover:shadow-[#FCD34D60_0px_0px_30px_0px]"
          >
            Explore Label Crop Tools
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── Marketplace grid ────────────────────────────────── */}
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETPLACES.map((mp) => (
            <MarketplaceCard key={mp.name} marketplace={mp} />
          ))}
        </div>

        {/* ── Features row ────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FCD34D]/20 to-[#F59E0B]/10 border border-[#FCD34D]/20">
                  <Icon size={16} className="text-[#FCD34D]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{feat.label}</p>
                  <p className="text-[11px] text-white/50">{feat.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Bottom badge row ─────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-white/40">Supported marketplaces:</span>
          {MARKETPLACES.map((mp) => (
            <span
              key={mp.name}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80"
            >
              <Check size={10} className="text-[#4ADE80]" strokeWidth={3} />
              {mp.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
