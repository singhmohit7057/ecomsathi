import { useState, useEffect } from 'react'
import { Copy, CheckCheck, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Alert } from '@/components/common/Alert'
import { InlineLoader } from '@/components/common/Loader'
import { extractGSTINInfo, validateGSTINChecksum } from '../data/gstConstants'
import GSTToolLayout from '../components/GSTToolLayout'
import { InfoItem, InfoGrid } from '../components/GSTResultCard'

const BACKEND_URL = import.meta.env.VITE_PROCESSING_API_URL as string
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

interface LiveResult {
  legalName?: string
  tradeName?: string
  status?: string
  gstinStatus?: string
  registrationDate?: string
  cancellationDate?: string
  constitutionOfBusiness?: string
  stateJurisdiction?: string
  centerJurisdiction?: string
  address?: string
}

type FormatStatus = 'idle' | 'valid' | 'invalid'

const FAQS = [
  {
    q: 'What information does a GSTIN contain?',
    a: 'A GSTIN is 15 characters: 2-digit state code, 10-character PAN, 1-digit entity number, letter Z, and a checksum digit. You can extract the state, PAN, and taxpayer type directly from the GSTIN format.',
  },
  {
    q: 'How does live GSTIN verification work?',
    a: 'Live verification calls the official GSTN government portal via our secure backend. No API key is exposed to your browser. Results show the registered business name, status (Active/Cancelled), jurisdiction, and registration date.',
  },
  {
    q: 'Is format validation different from live verification?',
    a: 'Yes. Format validation checks whether the GSTIN follows the correct pattern and has a valid checksum — this is instant and offline. Live verification actually calls the government portal to confirm the business is registered and active.',
  },
  {
    q: 'What does an "Active" GSTIN status mean?',
    a: 'An Active status means the GSTIN is currently registered and the taxpayer is compliant. Cancelled means the registration was revoked. Always check the status before processing a high-value B2B transaction.',
  },
]

const RELATED_TOOLS = [
  { label: 'GST Verification', to: '/gst/verification' },
  { label: 'GSTIN State Finder', to: '/gst/state-finder' },
  { label: 'GST Calculator', to: '/gst/calculator' },
  { label: 'HSN Code Search', to: '/gst/hsn-search' },
  { label: 'GST Rate Finder', to: '/gst/rate-finder' },
]

export default function GSTSearch() {
  const [input, setInput] = useState('')
  const [formatStatus, setFormatStatus] = useState<FormatStatus>('idle')
  const [loading, setLoading] = useState(false)
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null)
  const [liveError, setLiveError] = useState('')
  const [copied, setCopied] = useState(false)

  const upper = input.trim().toUpperCase()
  const isValidFormat = GSTIN_REGEX.test(upper) && validateGSTINChecksum(upper)
  const info = isValidFormat ? extractGSTINInfo(upper) : null

  useEffect(() => {
    if (!upper) { setFormatStatus('idle'); return }
    if (upper.length === 15) {
      setFormatStatus(isValidFormat ? 'valid' : 'invalid')
    } else {
      setFormatStatus('idle')
    }
    setLiveResult(null)
    setLiveError('')
  }, [upper, isValidFormat])

  const handleVerify = async () => {
    if (!isValidFormat) return
    setLoading(true)
    setLiveError('')
    setLiveResult(null)
    try {
      const res = await fetch(`${BACKEND_URL}/api/gst/verify?gstin=${encodeURIComponent(upper)}`)
      const data = await res.json() as LiveResult & { error?: string }
      if (res.ok && (data.status || data.legalName)) {
        setLiveResult(data)
      } else {
        setLiveError(data.error ?? 'GSTIN not found or verification failed.')
      }
    } catch {
      setLiveError('Cannot reach verification server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(upper)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusBadge = (status?: string) => {
    if (!status) return null
    const s = status.toLowerCase()
    if (s === 'active') return <Badge variant="success">Active</Badge>
    if (s.includes('cancel')) return <Badge variant="error">Cancelled</Badge>
    if (s.includes('suspend')) return <Badge variant="warning">Suspended</Badge>
    return <Badge variant="default">{status}</Badge>
  }

  return (
    <GSTToolLayout
      title="GST Search Tool"
      metaTitle="GST Search Tool | Verify GSTIN Online Free | EcomSathi"
      metaDescription="Free GSTIN search tool. Validate any GST number format instantly and verify live status on the government portal. Check business name, state, registration date."
      metaKeywords="GST search, GSTIN search, verify GSTIN online, GST number check, GSTIN lookup"
      canonicalPath="/gst/search"
      crumbs={[{ label: 'GST Tools', to: '/gst' }, { label: 'GST Search' }]}
      relatedTools={RELATED_TOOLS}
      faqs={FAQS}
    >
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">GST Search Tool</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Validate any GSTIN format instantly and optionally verify live status via the government portal.
          </p>
        </div>

        <Card variant="shadowed" padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Enter GSTIN (15 characters)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value.toUpperCase())}
                  onKeyDown={e => { if (e.key === 'Enter' && isValidFormat) handleVerify() }}
                  placeholder="e.g. 27AABCU9603R1ZX"
                  maxLength={15}
                  className={[
                    'w-full pr-10 pl-4 py-3 text-lg font-mono tracking-widest border rounded-lg bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all',
                    formatStatus === 'valid'   ? 'border-[#16A34A] focus:ring-[#16A34A]/30' :
                    formatStatus === 'invalid' ? 'border-[#DC2626] focus:ring-[#DC2626]/30' :
                    'border-[#E2E8F0] focus:ring-[#2563EB]/30',
                  ].join(' ')}
                />
                {formatStatus !== 'idle' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {formatStatus === 'valid'
                      ? <CheckCircle size={20} className="text-[#16A34A]" />
                      : <XCircle size={20} className="text-[#DC2626]" />
                    }
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">{upper.length}/15 characters</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleVerify}
                loading={loading}
                disabled={!isValidFormat}
                leftIcon={<ExternalLink size={16} />}
                fullWidth
              >
                Verify on Government Portal
              </Button>
              <Button
                variant="ghost"
                onClick={handleCopy}
                leftIcon={copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                disabled={!upper}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </Card>

        {isValidFormat && info && (
          <Card variant="foam" padding="md">
            <p className="text-xs font-semibold text-[#16A34A] uppercase tracking-wide mb-3">
              Format Valid — Extracted Info
            </p>
            <InfoGrid>
              <InfoItem label="State Code"     value={info.stateCode} />
              <InfoItem label="State"          value={info.stateName} />
              <InfoItem label="PAN Number"     value={info.pan} mono />
              <InfoItem label="Taxpayer Type"  value={info.entityType} />
              <InfoItem label="Entity Number"  value={info.entityNumber} />
              <InfoItem label="Check Digit"    value={info.checkDigit} />
            </InfoGrid>
          </Card>
        )}

        {formatStatus === 'invalid' && upper.length === 15 && (
          <Alert
            variant="error"
            title="Invalid GSTIN Format"
            message="The GSTIN does not match the required format or has an incorrect checksum. Please double-check."
          />
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <InlineLoader label="Verifying GSTIN on government portal..." />
          </div>
        )}

        {liveError && (
          <Alert variant="error" title="Verification Failed" message={liveError} onClose={() => setLiveError('')} />
        )}

        {liveResult && (
          <Card variant="shadowed" padding="lg">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  {liveResult.legalName ?? liveResult.tradeName ?? '—'}
                </h2>
                {liveResult.tradeName && liveResult.tradeName !== liveResult.legalName && (
                  <p className="text-sm text-[#64748B]">Trade name: {liveResult.tradeName}</p>
                )}
              </div>
              {statusBadge(liveResult.status ?? liveResult.gstinStatus)}
            </div>
            <InfoGrid>
              {liveResult.constitutionOfBusiness && (
                <InfoItem label="Constitution of Business" value={liveResult.constitutionOfBusiness} />
              )}
              {liveResult.registrationDate && (
                <InfoItem label="Registration Date" value={liveResult.registrationDate} />
              )}
              {liveResult.cancellationDate && (
                <InfoItem label="Cancellation Date" value={liveResult.cancellationDate} />
              )}
              {liveResult.stateJurisdiction && (
                <InfoItem label="State Jurisdiction" value={liveResult.stateJurisdiction} />
              )}
              {liveResult.centerJurisdiction && (
                <InfoItem label="Centre Jurisdiction" value={liveResult.centerJurisdiction} />
              )}
              {liveResult.address && (
                <InfoItem label="Registered Address" value={liveResult.address} span2 />
              )}
            </InfoGrid>
          </Card>
        )}
      </div>
    </GSTToolLayout>
  )
}
