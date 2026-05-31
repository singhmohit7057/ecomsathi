import React, { useState } from 'react'
import { Shield, CheckCircle, XCircle, Clock, Copy, CheckCheck } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Alert } from '../../components/common/Alert'
import { InlineLoader } from '../../components/common/Loader'
import {
  extractGSTINInfo,
  validateGSTINChecksum,
  getStateByCode,
} from './data/gstConstants'

const BACKEND_URL = import.meta.env.VITE_PROCESSING_API_URL as string
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

interface VerifyResult {
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

type StepStatus = 'pending' | 'pass' | 'fail' | 'loading' | 'skipped'

interface Step {
  id: string
  label: string
  status: StepStatus
  detail?: string
}

function buildInitialSteps(): Step[] {
  return [
    { id: 'format', label: 'Format Check', status: 'pending' },
    { id: 'checksum', label: 'Checksum Verification', status: 'pending' },
    { id: 'live', label: 'Live Government Portal Verification', status: 'pending' },
  ]
}

function runFormatSteps(gstin: string): Step[] {
  const upper = gstin.trim().toUpperCase()
  const formatOk = GSTIN_REGEX.test(upper)
  const checksumOk = formatOk ? validateGSTINChecksum(upper) : false

  return [
    {
      id: 'format',
      label: 'Format Check',
      status: formatOk ? 'pass' : 'fail',
      detail: formatOk
        ? `Valid 15-character GSTIN pattern`
        : `Expected pattern: 2 digits + 5 uppercase letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric`,
    },
    {
      id: 'checksum',
      label: 'Checksum Verification',
      status: formatOk ? (checksumOk ? 'pass' : 'fail') : 'skipped',
      detail: formatOk
        ? (checksumOk ? 'Check digit is mathematically correct' : 'Check digit does not match — GSTIN may be mistyped')
        : 'Skipped — format check failed',
    },
    {
      id: 'live',
      label: 'Live Government Portal Verification',
      status: 'pending',
      detail: 'Click "Verify Live" to check active status',
    },
  ]
}

export const GSTVerify: React.FC = () => {
  const [input, setInput] = useState('')
  const [steps, setSteps] = useState<Step[]>(buildInitialSteps())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [liveError, setLiveError] = useState('')
  const [copied, setCopied] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)

  const upper = input.trim().toUpperCase()
  const isFormatOk = GSTIN_REGEX.test(upper)
  const isChecksumOk = isFormatOk && validateGSTINChecksum(upper)
  const info = isChecksumOk ? extractGSTINInfo(upper) : null

  const handleValidate = () => {
    setSteps(runFormatSteps(upper))
    setHasValidated(true)
    setResult(null)
    setLiveError('')
  }

  const handleLiveVerify = async () => {
    if (!isChecksumOk) return
    setLoading(true)
    setLiveError('')
    setResult(null)
    setSteps(prev =>
      prev.map(s => s.id === 'live' ? { ...s, status: 'loading', detail: 'Contacting government portal…' } : s)
    )
    try {
      const res = await fetch(`${BACKEND_URL}/api/gst/verify?gstin=${encodeURIComponent(upper)}`)
      const data = await res.json() as VerifyResult & { error?: string }
      if (res.ok && (data.status || data.legalName)) {
        const statusLower = (data.status ?? data.gstinStatus ?? '').toLowerCase()
        setResult(data)
        setSteps(prev =>
          prev.map(s =>
            s.id === 'live'
              ? {
                  ...s,
                  status: statusLower === 'active' ? 'pass' : 'fail',
                  detail: `Status: ${data.status ?? data.gstinStatus}${data.legalName ? ` — ${data.legalName}` : ''}`,
                }
              : s
          )
        )
      } else {
        setLiveError(data.error ?? 'GSTIN not found on the government portal.')
        setSteps(prev =>
          prev.map(s => s.id === 'live' ? { ...s, status: 'fail', detail: data.error ?? 'Not found' } : s)
        )
      }
    } catch {
      const msg = 'Cannot reach verification server. Check your connection.'
      setLiveError(msg)
      setSteps(prev =>
        prev.map(s => s.id === 'live' ? { ...s, status: 'fail', detail: msg } : s)
      )
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
    const s = (status ?? '').toLowerCase()
    if (s === 'active') return <Badge variant="success">Active</Badge>
    if (s.includes('cancel')) return <Badge variant="error">Cancelled</Badge>
    if (s.includes('suspend')) return <Badge variant="warning">Suspended</Badge>
    return status ? <Badge variant="default">{status}</Badge> : null
  }

  const stateFromInput = upper.length >= 2 ? getStateByCode(upper.slice(0, 2)) : undefined

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">GSTIN Verification</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Step-by-step format, checksum, and live portal verification of any GSTIN.
        </p>
      </div>

      <Card variant="shadowed" padding="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Enter GSTIN
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') handleValidate() }}
                placeholder="e.g. 27AABCU9603R1ZX"
                maxLength={15}
                className="flex-1 border border-[#E2E8F0] rounded-[4px] px-3 py-2.5 text-base font-mono tracking-widest bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
              />
              <Button variant="ghost" onClick={handleCopy} disabled={!upper}
                leftIcon={copied ? <CheckCheck size={16} /> : <Copy size={16} />}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">{upper.length}/15 characters</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleValidate} disabled={!upper} leftIcon={<Shield size={16} />}>
              Validate Format
            </Button>
            <Button
              variant="outline"
              onClick={handleLiveVerify}
              disabled={!isChecksumOk}
              loading={loading}
            >
              Verify Live
            </Button>
          </div>
        </div>
      </Card>

      {/* Steps */}
      {hasValidated && (
        <Card variant="default" padding="lg">
          <h2 className="text-base font-semibold text-[#0F172A] mb-4">Verification Steps</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon status={step.status} />
                  {i < steps.length - 1 && (
                    <div className={[
                      'w-0.5 flex-1 mt-1 min-h-[24px]',
                      step.status === 'pass' ? 'bg-[#BBF7D0]' :
                      step.status === 'fail' ? 'bg-[#FFE4E6]' : 'bg-[#E2E8F0]',
                    ].join(' ')} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className={[
                    'text-sm font-semibold',
                    step.status === 'pass' ? 'text-[#15803D]' :
                    step.status === 'fail' ? 'text-[#DC2626]' :
                    step.status === 'loading' ? 'text-[#2563EB]' :
                    step.status === 'skipped' ? 'text-[#94A3B8]' : 'text-[#374151]',
                  ].join(' ')}>
                    {step.label}
                  </p>
                  {step.detail && (
                    <p className="text-xs text-[#6B7280] mt-0.5">{step.detail}</p>
                  )}
                  {step.status === 'loading' && (
                    <div className="mt-1">
                      <InlineLoader size={14} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Extracted info from format */}
      {isChecksumOk && info && hasValidated && (
        <Card variant="foam" padding="md">
          <p className="text-xs font-semibold text-[#16A34A] uppercase tracking-wide mb-3">
            Extracted from GSTIN
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-[#64748B]">State Code</p>
              <p className="font-mono font-semibold text-[#0F172A]">{info.stateCode}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">State</p>
              <p className="font-medium text-[#0F172A]">{stateFromInput?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">PAN</p>
              <p className="font-mono font-semibold text-[#0F172A]">{info.pan}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Taxpayer Type</p>
              <p className="font-medium text-[#0F172A]">{info.entityType}</p>
            </div>
          </div>
        </Card>
      )}

      {liveError && (
        <Alert variant="error" title="Live Verification Error" message={liveError} onClose={() => setLiveError('')} />
      )}

      {result && (
        <Card variant="sky" padding="lg">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                {result.legalName ?? result.tradeName ?? '—'}
              </h2>
              {result.tradeName && result.tradeName !== result.legalName && (
                <p className="text-sm text-[#64748B]">Trade name: {result.tradeName}</p>
              )}
            </div>
            {statusBadge(result.status ?? result.gstinStatus)}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {result.constitutionOfBusiness && (
              <InfoItem label="Type of Business" value={result.constitutionOfBusiness} />
            )}
            {result.registrationDate && (
              <InfoItem label="Registration Date" value={result.registrationDate} />
            )}
            {result.stateJurisdiction && (
              <InfoItem label="State Jurisdiction" value={result.stateJurisdiction} />
            )}
            {result.centerJurisdiction && (
              <InfoItem label="Centre Jurisdiction" value={result.centerJurisdiction} />
            )}
            {result.address && (
              <div className="col-span-2">
                <InfoItem label="Registered Address" value={result.address} />
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

const StepIcon: React.FC<{ status: StepStatus }> = ({ status }) => {
  if (status === 'pass') return <CheckCircle size={20} className="text-[#16A34A] flex-shrink-0" />
  if (status === 'fail') return <XCircle size={20} className="text-[#DC2626] flex-shrink-0" />
  if (status === 'loading') return <Clock size={20} className="text-[#2563EB] flex-shrink-0 animate-pulse" />
  if (status === 'skipped') return (
    <span className="inline-block w-5 h-5 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex-shrink-0" />
  )
  return (
    <span className="inline-block w-5 h-5 rounded-full border-2 border-[#D1D5DB] flex-shrink-0" />
  )
}

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-[#64748B]">{label}</p>
    <p className="text-sm font-medium text-[#0F172A]">{value}</p>
  </div>
)

export default GSTVerify
