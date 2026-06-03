import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Search, Tag, Percent } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { HSN_DATA, type HSNEntry } from '../data/hsnData'
import { SAC_DATA, type SACEntry } from '../data/sacData'
import GSTToolLayout from '../components/GSTToolLayout'

type Mode = 'hsn' | 'sac'

const RATE_BADGE: Record<number, 'success' | 'info' | 'warning' | 'error' | 'default' | 'primary'> = {
  0: 'success', 5: 'info', 12: 'primary', 18: 'warning', 28: 'error',
}

const HSN_FUSE = new Fuse(HSN_DATA, { keys: ['code', 'description'], threshold: 0.35, includeScore: true })
const SAC_FUSE = new Fuse(SAC_DATA, { keys: ['code', 'description'], threshold: 0.35, includeScore: true })

const GST_SLABS = [
  { rate: 0,  color: '#16A34A', label: 'Exempt / 0%',  desc: 'Essential goods like fresh vegetables, milk, eggs' },
  { rate: 5,  color: '#0284C7', label: '5% GST',        desc: 'Packed foods, edible oil, coffee, fertilisers' },
  { rate: 12, color: '#7C3AED', label: '12% GST',       desc: 'Computers, processed foods, business goods' },
  { rate: 18, color: '#D97706', label: '18% GST',       desc: 'Electronics, services, capital goods' },
  { rate: 28, color: '#DC2626', label: '28% GST',       desc: 'Luxury goods, tobacco, automobiles' },
]

const FAQS = [
  {
    q: 'How do I find the GST rate for my product?',
    a: 'Enter the product name or HSN code in the search box above. The GST Rate Finder uses both exact HSN code matching and fuzzy keyword search to find the applicable rate.',
  },
  {
    q: 'What GST rates exist in India?',
    a: 'India has five main GST rate slabs: 0% (exempt), 5%, 12%, 18%, and 28%. Most day-to-day goods are at 0% or 5%. Electronics and services are typically 18%. Luxury goods are at 28%.',
  },
  {
    q: 'What is the GST rate for ecommerce sellers?',
    a: 'Ecommerce sellers pay GST based on the product category (HSN code). Common ecommerce categories: apparel above ₹1000 (12%), electronics (18%), footwear above ₹1000 (18%), handcraft and handicraft items vary.',
  },
  {
    q: 'Can I use HSN and SAC in the same business?',
    a: 'Yes. If your business sells both goods and services, you will use HSN codes for goods and SAC codes for services on separate line items in the same GST invoice.',
  },
]

const RELATED_TOOLS = [
  { label: 'HSN Code Search', to: '/gst/hsn-search' },
  { label: 'SAC Code Search', to: '/gst/sac-search' },
  { label: 'GST Calculator',  to: '/gst/calculator' },
  { label: 'GST Search',      to: '/gst/search' },
]

export default function GSTRateFinder() {
  const [mode, setMode]   = useState<Mode>('hsn')
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    if (mode === 'hsn') {
      if (/^\d+$/.test(q)) return HSN_DATA.filter(e => e.code.startsWith(q)).slice(0, 20)
      return HSN_FUSE.search(q).map(r => r.item).slice(0, 20)
    } else {
      if (/^\d+$/.test(q)) return SAC_DATA.filter(e => e.code.startsWith(q)).slice(0, 20)
      return SAC_FUSE.search(q).map(r => r.item).slice(0, 20)
    }
  }, [query, mode])

  return (
    <GSTToolLayout
      title="GST Rate Finder"
      metaTitle="GST Rate Finder Online | Find GST Rate by Product or Service | EcomSathi"
      metaDescription="Find the GST rate for any product (HSN) or service (SAC) by code or keyword. Free GST rate finder covering all 5 tax slabs for Indian ecommerce sellers."
      metaKeywords="GST rate finder, GST rate search, find GST rate, GST percentage finder, GST slab India"
      canonicalPath="/gst/rate-finder"
      crumbs={[{ label: 'GST Tools', to: '/gst' }, { label: 'GST Rate Finder' }]}
      relatedTools={RELATED_TOOLS}
      faqs={FAQS}
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">GST Rate Finder</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Find the applicable GST rate for any product (HSN) or service (SAC) by code or keyword.
          </p>
        </div>

        <Card variant="shadowed" padding="lg">
          {/* Mode toggle */}
          <div className="flex gap-3 mb-4">
            {(['hsn', 'sac'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setQuery('') }}
                className={[
                  'py-2 px-5 rounded-lg text-sm font-medium border transition-colors',
                  mode === m
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#374151] border-[#E2E8F0] hover:bg-[#F8FAFC]',
                ].join(' ')}
              >
                {m === 'hsn' ? 'Goods (HSN)' : 'Services (SAC)'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={
                mode === 'hsn'
                  ? 'Search by HSN code (e.g. 6109) or product name (e.g. t-shirt)'
                  : 'Search by SAC code (e.g. 9965) or service name (e.g. courier)'
              }
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
            />
          </div>
        </Card>

        {query.trim() && results.length === 0 && (
          <Card variant="blush" padding="md">
            <p className="text-sm text-[#991B1B]">
              No {mode === 'hsn' ? 'HSN' : 'SAC'} entries found for "{query}". Try a different keyword or code.
            </p>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {mode === 'hsn'
              ? (results as HSNEntry[]).map(entry => <HSNResultCard key={entry.code} entry={entry} />)
              : (results as SACEntry[]).map(entry => <SACResultCard key={entry.code} entry={entry} />)
            }
          </div>
        )}

        {!query.trim() && (
          <>
            <Card variant="default" padding="md">
              <div className="flex items-start gap-3">
                <Tag size={18} className="text-[#2563EB] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[#475569]">
                  <p className="font-medium text-[#0F172A] mb-1">How to use</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Enter a 4-digit or 8-digit HSN code for exact match</li>
                    <li>Type a product name like "mobile phone" or "t-shirt" for fuzzy search</li>
                    <li>Switch to SAC tab for services like logistics, software, or consulting</li>
                  </ul>
                </div>
              </div>
            </Card>

            <div>
              <h2 className="text-base font-semibold text-[#0F172A] mb-3">GST Rate Slabs Reference</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {GST_SLABS.map(slab => (
                  <div
                    key={slab.rate}
                    className="flex items-start gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-white"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: slab.color }}
                    >
                      {slab.rate}%
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{slab.label}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{slab.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </GSTToolLayout>
  )
}

function HSNResultCard({ entry }: { entry: HSNEntry }) {
  const RATE_BADGE: Record<number, 'success' | 'info' | 'warning' | 'error' | 'default' | 'primary'> = {
    0: 'success', 5: 'info', 12: 'primary', 18: 'warning', 28: 'error',
  }
  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-[#2563EB] text-sm">{entry.code}</span>
            <span className="text-xs text-[#94A3B8]">Chapter {entry.chapter}</span>
          </div>
          <p className="text-sm text-[#0F172A] mt-1">{entry.description}</p>
          {entry.unit && <p className="text-xs text-[#64748B] mt-0.5">Unit: {entry.unit}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Percent size={13} className="text-[#64748B]" />
            <Badge variant={RATE_BADGE[entry.gstRate] ?? 'default'}>GST {entry.gstRate}%</Badge>
          </div>
          {entry.cessRate !== undefined && entry.cessRate > 0 && (
            <Badge variant="default">Cess {entry.cessRate}%</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

function SACResultCard({ entry }: { entry: SACEntry }) {
  const RATE_BADGE: Record<number, 'success' | 'info' | 'warning' | 'error' | 'default' | 'primary'> = {
    0: 'success', 5: 'info', 12: 'primary', 18: 'warning', 28: 'error',
  }
  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="font-mono font-bold text-[#2563EB] text-sm">{entry.code}</span>
          <p className="text-sm text-[#0F172A] mt-1">{entry.description}</p>
        </div>
        <div className="flex-shrink-0">
          <Badge variant={RATE_BADGE[entry.gstRate] ?? 'default'}>GST {entry.gstRate}%</Badge>
        </div>
      </div>
    </Card>
  )
}
