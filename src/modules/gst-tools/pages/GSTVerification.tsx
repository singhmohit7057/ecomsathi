import { useState, useEffect } from 'react'
import {
  Shield,
  CheckCircle,
  XCircle,
  Copy,
  CheckCheck,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Alert } from '@/components/common/Alert'
import { InlineLoader } from '@/components/common/Loader'
import {
  extractGSTINInfo,
  validateGSTINChecksum,
  getStateByCode,
} from '../data/gstConstants'
import GSTToolLayout from '../components/GSTToolLayout'
import { InfoItem, InfoGrid } from '../components/GSTResultCard'

// ─── Constants ───────────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_PROCESSING_API_URL ?? 'http://localhost:3001'
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

// ─── Types ────────────────────────────────────────────────────────────────────

interface ValidationStep {
  label: string
  passed: boolean | null  // true=pass, false=fail, null=skipped/pending
  detail: string
}

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

// ─── 6-step deep validator ────────────────────────────────────────────────────

function runValidation(gstin: string): ValidationStep[] {
  const g = gstin.trim().toUpperCase()

  // Step 1 — length
  const lenOk = g.length === 15
  const step1: ValidationStep = {
    label: 'Length check (must be 15 characters)',
    passed: g.length > 0 ? lenOk : null,
    detail: g.length > 0 ? `Length: ${g.length}` : 'Enter GSTIN to validate',
  }
  if (!g.length) return [step1, ...Array(5).fill({ label: '', passed: null, detail: '' }).map((_, i) => ({
    label: ['State code (01–38)', 'PAN format (chars 3–12)', 'Entity number (char 13)', "14th character is 'Z'", 'Checksum digit'][i],
    passed: null as null,
    detail: '—',
  }))]

  // Step 2 — state code
  const sc = g.slice(0, 2)
  const scNum = parseInt(sc, 10)
  const scValid = /^\d{2}$/.test(sc) && scNum >= 1 && scNum <= 99
  const stateObj = getStateByCode(sc)
  const step2: ValidationStep = {
    label: 'State code valid (01–38)',
    passed: scValid && !!stateObj,
    detail: stateObj ? `${sc} — ${stateObj.name}` : `Code ${sc} not recognised`,
  }

  // Step 3 — PAN
  const pan = g.slice(2, 12)
  const panOk = /^[A-Z]{3}[PCHABFTBLJG][A-Z]\d{4}[A-Z]$/.test(pan)
  const step3: ValidationStep = {
    label: 'PAN format valid (chars 3–12)',
    passed: panOk,
    detail: panOk ? pan : `"${pan}" — invalid PAN pattern`,
  }

  // Step 4 — entity number
  const en = g[12]
  const enOk = en !== undefined && /^[1-9A-Z]$/.test(en)
  const step4: ValidationStep = {
    label: 'Entity number valid (char 13, 1–9 or A–Z)',
    passed: en !== undefined ? enOk : null,
    detail: en ? `Value: ${en}` : 'Missing',
  }

  // Step 5 — Z marker
  const zc = g[13]
  const step5: ValidationStep = {
    label: "14th character must be 'Z'",
    passed: zc !== undefined ? zc === 'Z' : null,
    detail: zc ? `Value: ${zc}` : 'Missing',
  }

  // Step 6 — checksum (only if all prior format checks can run)
  let step6: ValidationStep
  if (lenOk && step2.passed && step3.passed && step4.passed && step5.passed) {
    const csOk = validateGSTINChecksum(g)
    step6 = {
      label: 'Checksum digit valid (position 15)',
      passed: csOk,
      detail: csOk ? 'Check digit is mathematically correct' : 'Check digit mismatch — GSTIN may be mistyped',
    }
  } else {
    step6 = {
      label: 'Checksum digit valid (position 15)',
      passed: null,
      detail: 'Cannot verify — earlier checks must pass first',
    }
  }

  return [step1, step2, step3, step4, step5, step6]
}

// ─── SEO / page data ──────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What is GSTIN verification?',
    a: 'GSTIN verification confirms a GST number is structurally valid (correct length, state code, PAN format, entity number, Z marker, checksum) and optionally confirms its active status on the GSTN government portal.',
  },
  {
    q: 'What information is encoded in a GSTIN?',
    a: 'A GSTIN is 15 characters: 2-digit state code, 10-character PAN of the business, 1-digit entity number (for multiple registrations under the same PAN), the letter Z, and a checksum digit.',
  },
  {
    q: "Why does my GSTIN fail the checksum check?",
    a: "The checksum (15th character) is mathematically derived from the first 14 characters using the Luhn algorithm. A mismatch means the GSTIN is mistyped. Double-check similar-looking characters: 0 vs O, 1 vs I, 5 vs S.",
  },
  {
    q: "Can I verify a supplier's GSTIN before claiming ITC?",
    a: 'Yes. Validate the format offline first (instant), then click "Verify Live on GSTN Portal" to confirm the business is active. This ensures you can safely claim Input Tax Credit on B2B invoices.',
  },
  {
    q: "What does an 'Active' status mean?",
    a: "Active means the business is currently registered under GST and authorised to collect and remit GST. Cancelled means the registration was surrendered or revoked — do not accept GST invoices from a cancelled GSTIN.",
  },
]

const RELATED_TOOLS = [
  { label: 'GST State Finder',       to: '/gst/state-finder' },
  { label: 'GST Calculator',         to: '/gst/calculator' },
  { label: 'Reverse GST Calculator', to: '/gst/reverse-calculator' },
  { label: 'HSN Code Search',        to: '/gst/hsn-search' },
  { label: 'GST Rate Finder',        to: '/gst/rate-finder' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepRow({ step, last }: { step: ValidationStep; last: boolean }) {
  if (!step.label) return null
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        {step.passed === true  && <CheckCircle size={18} className="text-[#16A34A]" />}
        {step.passed === false && <XCircle     size={18} className="text-[#DC2626]" />}
        {step.passed === null  && (
          <span className="inline-block w-[18px] h-[18px] rounded-full border-2 border-[#D1D5DB]" />
        )}
        {!last && (
          <div className={[
            'w-px flex-1 mt-1 min-h-[20px]',
            step.passed === true  ? 'bg-[#BBF7D0]' :
            step.passed === false ? 'bg-[#FECDD3]' : 'bg-[#E2E8F0]',
          ].join(' ')} />
        )}
      </div>
      <div className="flex-1 pb-3">
        <p className={[
          'text-sm font-medium',
          step.passed === true  ? 'text-[#15803D]' :
          step.passed === false ? 'text-[#DC2626]' : 'text-[#6B7280]',
        ].join(' ')}>
          {step.label}
        </p>
        {step.detail && step.detail !== '—' && (
          <p className="text-xs text-[#9CA3AF] mt-0.5 font-mono">{step.detail}</p>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null
  const s = status.toLowerCase()
  if (s === 'active')        return <Badge variant="success">Active</Badge>
  if (s.includes('cancel'))  return <Badge variant="error">Cancelled</Badge>
  if (s.includes('suspend')) return <Badge variant="warning">Suspended</Badge>
  return <Badge variant="default">{status}</Badge>
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GSTVerification() {
  const [input, setInput]           = useState('')
  const [steps, setSteps]           = useState<ValidationStep[]>([])
  const [hasRun, setHasRun]         = useState(false)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null)
  const [liveError, setLiveError]   = useState('')
  const [copied, setCopied]         = useState(false)

  const upper = input.trim().toUpperCase()

  // Derive from steps
  const allPassed  = steps.length === 6 && steps.every(s => s.passed === true)
  const anyFailed  = steps.some(s => s.passed === false)
  const info       = allPassed ? extractGSTINInfo(upper) : null
  const stateObj   = upper.length >= 2 ? getStateByCode(upper.slice(0, 2)) : undefined

  // Auto-run validation whenever input changes (once user starts)
  useEffect(() => {
    if (!upper) {
      setHasRun(false)
      setSteps([])
      setLiveResult(null)
      setLiveError('')
      return
    }
    const result = runValidation(upper)
    setSteps(result)
    setHasRun(true)
    // Reset live result if GSTIN changes
    setLiveResult(null)
    setLiveError('')
  }, [upper])

  const handleLiveVerify = async () => {
    if (!allPassed) return
    setLiveLoading(true)
    setLiveError('')
    setLiveResult(null)
    try {
      const res  = await fetch(`${BACKEND_URL}/api/gst/verify?gstin=${encodeURIComponent(upper)}`)
      const data = await res.json() as LiveResult & { error?: string }
      if (res.ok && (data.status || data.legalName)) {
        setLiveResult(data)
      } else {
        setLiveError(data.error ?? 'GSTIN not found on the government portal.')
      }
    } catch {
      setLiveError('Cannot reach verification server. Check your connection and try again.')
    } finally {
      setLiveLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!upper) return
    await navigator.clipboard.writeText(upper)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setInput('')
    setSteps([])
    setHasRun(false)
    setLiveResult(null)
    setLiveError('')
  }

  // Border colour based on validation state
  const inputBorderClass =
    !hasRun || !upper          ? 'border-[#E2E8F0] focus:ring-[#2563EB]/30' :
    allPassed                  ? 'border-[#16A34A] focus:ring-[#16A34A]/30' :
    anyFailed                  ? 'border-[#DC2626] focus:ring-[#DC2626]/30' :
                                 'border-[#E2E8F0] focus:ring-[#2563EB]/30'

  return (
    <GSTToolLayout
      title="GST Verification Tool"
      metaTitle="GST Verification Tool | Verify GSTIN Online Free | EcomSathi"
      metaDescription="Free GSTIN verification tool. Validate GST number format, checksum, state code, PAN structure and verify live status on the government portal. All-in-one GSTIN checker."
      metaKeywords="GST verification, GSTIN validator, verify GST number online, GSTIN format check, GST number search India"
      canonicalPath="/gst/verification"
      crumbs={[{ label: 'GST Tools', to: '/gst' }, { label: 'GST Verification' }]}
      relatedTools={RELATED_TOOLS}
      faqs={FAQS}
    >
      <div className="max-w-2xl space-y-5">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">GST Verification Tool</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Validate GSTIN format, checksum &amp; structure instantly — then verify live status on the GSTN portal.
          </p>
        </div>

        {/* ── Input card ── */}
        <Card variant="shadowed" padding="lg">
          <div className="space-y-4">
            {/* Input row */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Enter GSTIN
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter' && allPassed) handleLiveVerify() }}
                    placeholder="e.g. 27AABCU9603R1ZX"
                    maxLength={15}
                    autoComplete="off"
                    spellCheck={false}
                    className={[
                      'w-full pr-9 pl-4 py-3 text-base font-mono tracking-widest border rounded-lg bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all',
                      inputBorderClass,
                    ].join(' ')}
                  />
                  {/* inline ✓/✗ icon */}
                  {hasRun && upper.length === 15 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {allPassed
                        ? <CheckCircle size={18} className="text-[#16A34A]" />
                        : <XCircle    size={18} className="text-[#DC2626]" />
                      }
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={handleCopy}
                  disabled={!upper}
                  leftIcon={copied ? <CheckCheck size={15} /> : <Copy size={15} />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                {hasRun && (
                  <Button variant="ghost" onClick={handleReset} leftIcon={<RefreshCw size={15} />}>
                    Reset
                  </Button>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">{upper.length} / 15 characters</p>
            </div>

            {/* Verify live button — primary CTA */}
            <Button
              onClick={handleLiveVerify}
              loading={liveLoading}
              disabled={!allPassed}
              leftIcon={<ExternalLink size={16} />}
              fullWidth
            >
              Verify Live on GSTN Portal
            </Button>

            {!allPassed && (
              <p className="text-xs text-[#94A3B8] text-center">
                {!upper
                  ? 'Enter a 15-character GSTIN above to validate'
                  : 'Fix the format issues below before live verification'}
              </p>
            )}
          </div>
        </Card>

        {/* ── 6-step validation ── */}
        {hasRun && steps.length > 0 && (
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0F172A]">Format Validation</h2>
              {allPassed && <Badge variant="success">All checks passed</Badge>}
              {anyFailed && <Badge variant="error">Format invalid</Badge>}
            </div>
            <div className="space-y-0">
              {steps.map((step, i) => (
                <StepRow key={i} step={step} last={i === steps.length - 1} />
              ))}
            </div>
          </Card>
        )}

        {/* ── Extracted GSTIN info ── */}
        {allPassed && info && (
          <Card variant="foam" padding="md">
            <p className="text-xs font-semibold text-[#16A34A] uppercase tracking-wide mb-3">
              Extracted from GSTIN
            </p>
            <InfoGrid>
              <InfoItem label="State Code"    value={info.stateCode} />
              <InfoItem label="State"         value={stateObj?.name ?? info.stateName} />
              <InfoItem label="PAN Number"    value={info.pan} mono />
              <InfoItem label="Taxpayer Type" value={info.entityType} />
              <InfoItem label="Entity Number" value={info.entityNumber} />
              <InfoItem label="Check Digit"   value={info.checkDigit} />
            </InfoGrid>
          </Card>
        )}

        {/* ── Invalid banner ── */}
        {anyFailed && hasRun && (
          <div className="rounded-lg bg-[#FFF1F2] border border-[#FECDD3] px-4 py-3 text-sm text-[#991B1B]">
            <span className="font-semibold">Invalid GSTIN.</span>{' '}
            Check the failed steps above. Common mistakes: typos, extra spaces, or copy-paste errors with similar-looking characters (0/O, 1/I).
          </div>
        )}

        {/* ── Live verification loading ── */}
        {liveLoading && (
          <div className="flex items-center justify-center py-6">
            <InlineLoader label="Contacting GSTN government portal…" />
          </div>
        )}

        {/* ── Live error ── */}
        {liveError && (
          <Alert
            variant="error"
            title="Live Verification Failed"
            message={liveError}
            onClose={() => setLiveError('')}
          />
        )}

        {/* ── Live result ── */}
        {liveResult && (
          <Card variant="sky" padding="lg">
            {/* Business name + status */}
            <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
              <div>
                <p className="text-xs text-[#0369A1] font-medium uppercase tracking-wide mb-1">
                  GSTN Portal Result
                </p>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  {liveResult.legalName ?? liveResult.tradeName ?? '—'}
                </h2>
                {liveResult.tradeName && liveResult.tradeName !== liveResult.legalName && (
                  <p className="text-sm text-[#475569] mt-0.5">
                    Trade name: {liveResult.tradeName}
                  </p>
                )}
              </div>
              <StatusBadge status={liveResult.status ?? liveResult.gstinStatus} />
            </div>

            {/* Details grid */}
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

            {/* Verified GSTIN */}
            <div className="mt-4 pt-4 border-t border-[#BAE6FD] flex items-center gap-2">
              <Shield size={13} className="text-[#0369A1]" />
              <span className="text-xs text-[#0369A1] font-mono">{upper}</span>
              <span className="text-xs text-[#94A3B8]">verified via GSTN portal</span>
            </div>
          </Card>
        )}

        {/* ── Info note ── */}
        {!hasRun && (
          <Card variant="highlight" padding="sm">
            <div className="flex items-start gap-2 text-xs text-[#78350F]">
              <Shield size={13} className="mt-0.5 flex-shrink-0" />
              <p>
                Format validation (6 checks) runs instantly in your browser — no internet needed.
                Live verification calls the official GSTN portal via our secure backend; no API key is exposed.
              </p>
            </div>
          </Card>
        )}

      </div>
    </GSTToolLayout>
  )
}
