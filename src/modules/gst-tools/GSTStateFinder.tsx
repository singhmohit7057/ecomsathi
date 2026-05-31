import React, { useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { GST_STATE_CODES, ZONE_COLORS, getStateByCode, type GSTState } from './data/gstConstants'

const ZONE_BADGE: Record<GSTState['zone'], 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  North: 'primary',
  South: 'success',
  East: 'warning',
  West: 'info',
  Central: 'error',
  Northeast: 'default',
}

function detectInputType(val: string): 'code' | 'gstin' | 'unknown' {
  const trimmed = val.trim()
  if (/^\d{2}$/.test(trimmed)) return 'code'
  if (trimmed.length === 15 && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(trimmed)) return 'gstin'
  return 'unknown'
}

export const GSTStateFinder: React.FC = () => {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<GSTState | null | undefined>(undefined)
  const [extractedCode, setExtractedCode] = useState('')
  const [error, setError] = useState('')

  const handleSearch = () => {
    const trimmed = query.trim().toUpperCase()
    if (!trimmed) {
      setError('Please enter a 2-digit state code or full GSTIN.')
      setResult(undefined)
      return
    }
    setError('')

    const type = detectInputType(trimmed)
    let code = trimmed

    if (type === 'gstin') {
      code = trimmed.slice(0, 2)
      setExtractedCode(code)
    } else if (type === 'code') {
      setExtractedCode(code)
    } else if (trimmed.length >= 2) {
      // Try the first 2 chars as code
      code = trimmed.slice(0, 2)
      setExtractedCode(code)
    } else {
      setError('Enter a valid 2-digit state code (e.g. 27) or full 15-character GSTIN.')
      return
    }

    const found = getStateByCode(code)
    setResult(found ?? null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">GST State Finder</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Enter a 2-digit state code or full GSTIN to find the registered state.
        </p>
      </div>

      <Card variant="shadowed" padding="lg">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. 27 or 27AABCU9603R1ZX"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              leftIcon={<MapPin size={16} className="text-[#94A3B8]" />}
            />
          </div>
          <Button onClick={handleSearch} leftIcon={<Search size={16} />}>
            Find State
          </Button>
        </div>
        {error && <p className="text-sm text-[#DC2626] mt-2">{error}</p>}
      </Card>

      {result === null && (
        <Card variant="blush" padding="md">
          <p className="text-sm text-[#991B1B]">
            State code <strong>{extractedCode}</strong> not found. Valid state codes are 01–38 and certain union territory codes.
          </p>
        </Card>
      )}

      {result && (
        <Card variant="foam" padding="lg">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: ZONE_COLORS[result.zone] }}
                />
                <span className="text-xs text-[#64748B] font-medium uppercase tracking-wide">
                  {result.zone} India
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A]">{result.name}</h2>
              <p className="text-[#64748B] text-sm mt-1">State Code: <strong>{result.code}</strong></p>
              {extractedCode && query.length === 15 && (
                <p className="text-xs text-[#64748B] mt-1">Extracted from GSTIN: {query.trim().toUpperCase()}</p>
              )}
            </div>
            <Badge variant={ZONE_BADGE[result.zone]}>
              {result.zone} Zone
            </Badge>
          </div>
        </Card>
      )}

      {/* All states reference table */}
      <Card variant="default" padding="md">
        <h2 className="text-base font-semibold text-[#0F172A] mb-3">All State Codes Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="text-left py-2 pr-4 text-[#374151] font-medium w-16">Code</th>
                <th className="text-left py-2 pr-4 text-[#374151] font-medium">State / UT</th>
                <th className="text-left py-2 text-[#374151] font-medium">Zone</th>
              </tr>
            </thead>
            <tbody>
              {GST_STATE_CODES.map(state => (
                <tr
                  key={state.code}
                  className={[
                    'border-b border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer transition-colors',
                    result?.code === state.code ? 'bg-[#EFF6FF]' : '',
                  ].join(' ')}
                  onClick={() => {
                    setQuery(state.code)
                    setResult(state)
                    setExtractedCode(state.code)
                    setError('')
                  }}
                >
                  <td className="py-2 pr-4 font-mono font-medium text-[#2563EB]">{state.code}</td>
                  <td className="py-2 pr-4 text-[#0F172A]">{state.name}</td>
                  <td className="py-2">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: ZONE_COLORS[state.zone] }}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: ZONE_COLORS[state.zone] }}
                      />
                      {state.zone}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default GSTStateFinder
