import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Input } from '@/components/common/Input'
import { GST_STATE_CODES, ZONE_COLORS, getStateByCode, type GSTState } from '../data/gstConstants'
import GSTToolLayout from '../components/GSTToolLayout'

const ZONE_BADGE: Record<GSTState['zone'], 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  North:     'primary',
  South:     'success',
  East:      'warning',
  West:      'info',
  Central:   'error',
  Northeast: 'default',
}

function detectInputType(val: string): 'code' | 'gstin' | 'unknown' {
  const t = val.trim()
  if (/^\d{2}$/.test(t)) return 'code'
  if (t.length === 15 && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(t)) return 'gstin'
  return 'unknown'
}

const FAQS = [
  {
    q: 'What is a GST state code?',
    a: 'The first two digits of every GSTIN are the state code. It identifies which state the taxpayer is registered in. For example, 27 is Maharashtra, 07 is Delhi, and 29 is Karnataka.',
  },
  {
    q: 'How do I find the state from a GSTIN?',
    a: "The first two digits of the GSTIN are the state code. Enter the full GSTIN in this tool and it will automatically extract and identify the state for you.",
  },
  {
    q: 'Why does GST state code matter?',
    a: 'The state code determines whether a transaction is intra-state (CGST + SGST) or inter-state (IGST). If the supplier and buyer state codes differ, IGST applies. Same state code means CGST + SGST applies.',
  },
  {
    q: 'What are the GST state codes for union territories?',
    a: 'Union territories also have GST codes: Delhi (07), Jammu & Kashmir (01), Ladakh (38), Chandigarh (04), Puducherry (34), Dadra & Nagar Haveli (26), Daman & Diu (25), Andaman & Nicobar (35), Lakshadweep (31).',
  },
]

const RELATED_TOOLS = [
  { label: 'GST Search',      to: '/gst/search' },
  { label: 'GST Verification',to: '/gst/verification' },
  { label: 'GST Calculator',  to: '/gst/calculator' },
  { label: 'HSN Search',      to: '/gst/hsn-search' },
]

export default function GSTStateFinder() {
  const [query, setQuery]         = useState('')
  const [result, setResult]       = useState<GSTState | null | undefined>(undefined)
  const [extractedCode, setExtractedCode] = useState('')
  const [error, setError]         = useState('')

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
    } else if (trimmed.length >= 2) {
      code = trimmed.slice(0, 2)
    } else {
      setError('Enter a valid 2-digit state code (e.g. 27) or full 15-character GSTIN.')
      return
    }
    setExtractedCode(code)
    setResult(getStateByCode(code) ?? null)
  }

  return (
    <GSTToolLayout
      title="GST State Finder"
      metaTitle="GST State Finder | Find State from GST Code | EcomSathi"
      metaDescription="Find the state or union territory name from any 2-digit GST state code or full GSTIN. View all GST state codes with zone mapping."
      metaKeywords="GST state finder, GST state code, GSTIN state lookup, state code from GSTIN India"
      canonicalPath="/gst/state-finder"
      crumbs={[{ label: 'GST Tools', to: '/gst' }, { label: 'GST State Finder' }]}
      relatedTools={RELATED_TOOLS}
      faqs={FAQS}
    >
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">GST State Finder</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Enter a 2-digit state code or full GSTIN to identify the registered state.
          </p>
        </div>

        <Card variant="shadowed" padding="lg">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g. 27 or 27AABCU9603R1ZX"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                leftIcon={<MapPin size={16} className="text-[#94A3B8]" />}
              />
            </div>
            <Button onClick={handleSearch} leftIcon={<MapPin size={16} />}>Find State</Button>
          </div>
          {error && <p className="text-sm text-[#DC2626] mt-2">{error}</p>}
        </Card>

        {result === null && (
          <Card variant="blush" padding="md">
            <p className="text-sm text-[#991B1B]">
              State code <strong>{extractedCode}</strong> not found. Valid codes are 01–38 and certain UT codes.
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
                <p className="text-[#64748B] text-sm mt-1">
                  State Code: <strong>{result.code}</strong>
                </p>
                {extractedCode && query.length === 15 && (
                  <p className="text-xs text-[#64748B] mt-1">
                    Extracted from GSTIN: {query.trim().toUpperCase()}
                  </p>
                )}
              </div>
              <Badge variant={ZONE_BADGE[result.zone]}>{result.zone} Zone</Badge>
            </div>
          </Card>
        )}

        {/* Reference table */}
        <Card variant="default" padding="md">
          <h2 className="text-base font-semibold text-[#0F172A] mb-3">All GST State Codes Reference</h2>
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
                        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: ZONE_COLORS[state.zone] }} />
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
    </GSTToolLayout>
  )
}
