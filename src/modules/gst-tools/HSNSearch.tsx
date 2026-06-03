import React, { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Search, ChevronDown, ChevronUp, Calculator } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { HSN_DATA, type HSNEntry } from './data/hsnData'
import { GST_RATES } from './data/gstConstants'

const RATE_BADGE: Record<number, 'success' | 'info' | 'warning' | 'error' | 'default' | 'primary'> = {
  0: 'success',
  5: 'info',
  12: 'primary',
  18: 'warning',
  28: 'error',
}

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n)
}

interface MiniCalc {
  amount: string
  transType: 'intra' | 'inter'
}

export const HSNSearch: React.FC = () => {
  const [query, setQuery] = useState('')
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const [calcState, setCalcState] = useState<Record<string, MiniCalc>>({})

  const fuse = useMemo(() => new Fuse(HSN_DATA, {
    keys: [
      { name: 'code', weight: 2 },
      { name: 'description', weight: 1 },
    ],
    threshold: 0.35,
    includeScore: true,
  }), [])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return HSN_DATA.slice(0, 20)
    if (/^\d+$/.test(q)) {
      return HSN_DATA.filter(e => e.code.startsWith(q)).slice(0, 30)
    }
    return fuse.search(q).map(r => r.item).slice(0, 30)
  }, [query, fuse])

  const getCalc = (code: string): MiniCalc =>
    calcState[code] ?? { amount: '', transType: 'intra' }

  const setCalcField = <K extends keyof MiniCalc>(code: string, key: K, val: MiniCalc[K]) => {
    setCalcState(prev => ({ ...prev, [code]: { ...getCalc(code), [key]: val } }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">HSN Code Search</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Search HSN codes by code number or product description. Click any row for details and quick GST calculation.
        </p>
      </div>

      <Card variant="shadowed" padding="md">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by code (e.g. 8517) or description (e.g. mobile phone, t-shirt)"
            className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-[6px] text-base bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
          />
        </div>
        <p className="text-xs text-[#94A3B8] mt-1.5">
          Showing {results.length} {query ? 'matching' : 'sample'} results
        </p>
      </Card>

      {results.length === 0 && (
        <Card variant="blush" padding="md">
          <p className="text-sm text-[#991B1B]">No HSN codes found for "{query}".</p>
        </Card>
      )}

      <div className="overflow-hidden rounded-[8px] border border-[#E2E8F0]">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-[#374151] w-24">HSN Code</th>
              <th className="text-left py-3 px-4 font-medium text-[#374151]">Description</th>
              <th className="text-left py-3 px-4 font-medium text-[#374151] w-24">GST Rate</th>
              <th className="text-left py-3 px-4 font-medium text-[#374151] w-20">Cess</th>
              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {results.map(entry => {
              const isExpanded = expandedCode === entry.code
              const calc = getCalc(entry.code)
              const amt = parseFloat(calc.amount) || 0
              const base = amt
              const gst = Math.round(base * entry.gstRate) / 100
              const cess = entry.cessRate ? Math.round(base * entry.cessRate) / 100 : 0
              const half = Math.round(gst * 50) / 100

              return (
                <React.Fragment key={entry.code}>
                  <tr
                    className={[
                      'border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors cursor-pointer',
                      isExpanded ? 'bg-[#EFF6FF]' : '',
                    ].join(' ')}
                    onClick={() => setExpandedCode(isExpanded ? null : entry.code)}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-[#2563EB]">
                      {entry.code}
                    </td>
                    <td className="py-3 px-4 text-[#0F172A]">
                      <span className="line-clamp-2">{entry.description}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={RATE_BADGE[entry.gstRate] ?? 'default'}>
                        {entry.gstRate}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      {entry.cessRate ? `${entry.cessRate}%` : '—'}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[#F0F9FF] border-b border-[#BAE6FD]">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-[#64748B]">HSN Code</p>
                              <p className="font-mono font-bold text-[#2563EB]">{entry.code}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#64748B]">Chapter</p>
                              <p className="font-medium text-[#0F172A]">{entry.chapter}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-[#64748B]">Full Description</p>
                              <p className="text-[#0F172A]">{entry.description}</p>
                            </div>
                          </div>

                          {/* Quick GST calc */}
                          <div className="border-t border-[#BAE6FD] pt-3">
                            <p className="text-xs font-medium text-[#374151] mb-2 flex items-center gap-1.5">
                              <Calculator size={12} /> Quick GST Calculator
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter amount (₹)"
                                value={calc.amount}
                                onChange={e => setCalcField(entry.code, 'amount', e.target.value)}
                                onClick={e => e.stopPropagation()}
                                className="border border-[#E2E8F0] rounded-[4px] px-3 py-1.5 text-sm bg-white w-44 focus:outline-none focus:ring-1 focus:ring-[#2563EB]/40"
                              />
                              <div className="flex gap-1">
                                {(['intra', 'inter'] as const).map(t => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={e => { e.stopPropagation(); setCalcField(entry.code, 'transType', t) }}
                                    className={[
                                      'py-1.5 px-3 rounded-[4px] text-xs font-medium border transition-colors',
                                      calc.transType === t
                                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                        : 'bg-white text-[#374151] border-[#E2E8F0]',
                                    ].join(' ')}
                                  >
                                    {t === 'intra' ? 'Intra' : 'Inter'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {amt > 0 && (
                              <div className="mt-2 bg-white rounded-[6px] border border-[#BAE6FD] p-3 text-xs font-mono space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-[#475569]">Base Amount</span>
                                  <span className="text-[#0F172A]">{formatINR(base)}</span>
                                </div>
                                {calc.transType === 'intra' ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-[#475569]">CGST ({entry.gstRate / 2}%)</span>
                                      <span className="text-[#0F172A]">{formatINR(half)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#475569]">SGST ({entry.gstRate / 2}%)</span>
                                      <span className="text-[#0F172A]">{formatINR(half)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex justify-between">
                                    <span className="text-[#475569]">IGST ({entry.gstRate}%)</span>
                                    <span className="text-[#0F172A]">{formatINR(gst)}</span>
                                  </div>
                                )}
                                {cess > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-[#475569]">Cess ({entry.cessRate}%)</span>
                                    <span className="text-[#0F172A]">{formatINR(cess)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between border-t border-[#BAE6FD] pt-1 font-bold">
                                  <span className="text-[#0F172A]">Total</span>
                                  <span className="text-[#16A34A]">{formatINR(base + gst + cess)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Rate legend */}
      <Card variant="default" padding="sm">
        <div className="flex flex-wrap gap-3 justify-center">
          {GST_RATES.filter(r => [0, 5, 12, 18, 28].includes(r)).map(rate => (
            <div key={rate} className="flex items-center gap-1.5 text-xs text-[#475569]">
              <Badge variant={RATE_BADGE[rate] ?? 'default'} size="sm">{rate}%</Badge>
              <span>GST</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default HSNSearch
