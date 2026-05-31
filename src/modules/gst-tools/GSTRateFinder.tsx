import React, { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Search, Tag, Percent } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { HSN_DATA, type HSNEntry } from './data/hsnData'
import { SAC_DATA, type SACEntry } from './data/sacData'

type Mode = 'hsn' | 'sac'

const RATE_BADGE: Record<number, 'success' | 'info' | 'warning' | 'error' | 'default' | 'primary'> = {
  0: 'success',
  5: 'info',
  12: 'primary',
  18: 'warning',
  28: 'error',
}

function rateBadge(rate: number) {
  return RATE_BADGE[rate] ?? 'default'
}

const HSN_FUSE = new Fuse(HSN_DATA, {
  keys: ['code', 'description'],
  threshold: 0.35,
  includeScore: true,
})

const SAC_FUSE = new Fuse(SAC_DATA, {
  keys: ['code', 'description'],
  threshold: 0.35,
  includeScore: true,
})

export const GSTRateFinder: React.FC = () => {
  const [mode, setMode] = useState<Mode>('hsn')
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    if (mode === 'hsn') {
      if (/^\d+$/.test(q)) {
        return HSN_DATA.filter(e => e.code.startsWith(q)).slice(0, 20)
      }
      return HSN_FUSE.search(q).map(r => r.item).slice(0, 20)
    } else {
      if (/^\d+$/.test(q)) {
        return SAC_DATA.filter(e => e.code.startsWith(q)).slice(0, 20)
      }
      return SAC_FUSE.search(q).map(r => r.item).slice(0, 20)
    }
  }, [query, mode])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">GST Rate Finder</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Find the GST rate for any product or service by HSN/SAC code or keyword.
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
                'py-2 px-5 rounded-[6px] text-sm font-medium border transition-colors',
                mode === m
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#374151] border-[#E2E8F0] hover:bg-[#F8FAFC]',
              ].join(' ')}
            >
              {m === 'hsn' ? 'Goods (HSN)' : 'Services (SAC)'}
            </button>
          ))}
        </div>

        {/* Search input */}
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
            className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-[6px] text-base bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
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
            ? (results as HSNEntry[]).map(entry => (
                <HSNResultCard key={entry.code} entry={entry} />
              ))
            : (results as SACEntry[]).map(entry => (
                <SACResultCard key={entry.code} entry={entry} />
              ))
          }
        </div>
      )}

      {!query.trim() && (
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
      )}
    </div>
  )
}

const HSNResultCard: React.FC<{ entry: HSNEntry }> = ({ entry }) => (
  <Card variant="default" padding="md">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-[#2563EB] text-sm">{entry.code}</span>
          <span className="text-xs text-[#94A3B8]">Chapter {entry.chapter}</span>
        </div>
        <p className="text-sm text-[#0F172A] mt-1">{entry.description}</p>
        {entry.unit && (
          <p className="text-xs text-[#64748B] mt-0.5">Unit: {entry.unit}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Percent size={13} className="text-[#64748B]" />
          <Badge variant={rateBadge(entry.gstRate)}>
            GST {entry.gstRate}%
          </Badge>
        </div>
        {entry.cessRate !== undefined && entry.cessRate > 0 && (
          <Badge variant="default">
            Cess {entry.cessRate}%
          </Badge>
        )}
      </div>
    </div>
  </Card>
)

const SACResultCard: React.FC<{ entry: SACEntry }> = ({ entry }) => (
  <Card variant="default" padding="md">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <span className="font-mono font-bold text-[#2563EB] text-sm">{entry.code}</span>
        <p className="text-sm text-[#0F172A] mt-1">{entry.description}</p>
      </div>
      <div className="flex-shrink-0">
        <Badge variant={rateBadge(entry.gstRate)}>
          GST {entry.gstRate}%
        </Badge>
      </div>
    </div>
  </Card>
)

export default GSTRateFinder
