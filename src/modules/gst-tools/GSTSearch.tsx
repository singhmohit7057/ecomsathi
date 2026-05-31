import React, { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, ExternalLink, Copy, CheckCheck } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Alert } from '../../components/common/Alert'
import { InlineLoader } from '../../components/common/Loader'
import { extractGSTINInfo, validateGSTINChecksum } from './data/gstConstants'

const BACKEND_URL = import.meta.env.VITE_PROCESSING_API_URL as string

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

interface LiveResult {
  legalName?: string
  tradeName?: string
  status?: string
  registrationDate?: string
  cancellationDate?: string
  constitutionOfBusiness?: string
  gstinStatus?: string
  address?: string
  stateJurisdiction?: string
  centerJurisdiction?: string
}

type FormatStatus = 'idle' | 'valid' | 'invalid'

export const GSTSearch: React.FC = () => {
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
    if (!upper) {
      setFormatStatus('idle')
      return
    }
    if (upper.length === 15) {
      setFormatStatus(isValidFormat ? 'valid' : 'invalid')
    } else {
      setFormatStatus('idle')
    }
    // Reset live results on input change
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">GSTIN Search & Lookup</h1>
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
                  'w-full pr-10 pl-4 py-3 text-lg font-mono tracking-widest border rounded-[6px] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all',
                  formatStatus === 'valid' ? 'border-[#16A34A] focus:ring-[#16A34A]/30' :
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

      {/* Instant format info — free tier */}
      {isValidFormat && info && (
        <Card variant="foam" padding="md">
          <p className="text-xs font-semibold text-[#16A34A] uppercase tracking-wide mb-3">
            Format Valid — Extracted Info
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem label="State Code" value={info.stateCode} />
            <InfoItem label="State" value={info.stateName} />
            <InfoItem label="PAN Number" value={info.pan} mono />
            <InfoItem label="Taxpayer Type" value={info.entityType} />
            <InfoItem label="Entity Number" value={info.entityNumber} />
            <InfoItem label="Check Digit" value={info.checkDigit} />
          </div>
        </Card>
      )}

      {formatStatus === 'invalid' && upper.length === 15 && (
        <Alert
          variant="error"
          title="Invalid GSTIN Format"
          message="The GSTIN you entered does not match the required format or has an incorrect checksum digit. Please double-check."
        />
      )}

      {/* Live verification result */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <InlineLoader label="Verifying GSTIN on government portal..." />
        </div>
      )}

      {liveError && (
        <Alert
          variant="error"
          title="Verification Failed"
          message={liveError}
          onClose={() => setLiveError('')}
        />
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

          <div className="grid grid-cols-2 gap-4 text-sm">
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
              <div className="col-span-2">
                <InfoItem label="Registered Address" value={liveResult.address} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Info note */}
      <Card variant="highlight" padding="sm">
        <div className="flex items-start gap-2 text-xs text-[#78350F]">
          <Search size={13} className="mt-0.5 flex-shrink-0" />
          <p>
            Format validation is instant and free. Live verification calls the government GSTN portal
            via our secure backend — no API key is exposed to your browser.
          </p>
        </div>
      </Card>
    </div>
  )
}

const InfoItem: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <p className="text-xs text-[#64748B]">{label}</p>
    <p className={['text-sm font-medium text-[#0F172A]', mono ? 'font-mono' : ''].join(' ')}>
      {value}
    </p>
  </div>
)

export default GSTSearch
