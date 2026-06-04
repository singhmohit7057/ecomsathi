import { useState } from 'react'
import { CheckCircle, XCircle, CreditCard, RefreshCw, AlertCircle } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { PAN_ENTITY_TYPES } from '../data/gstConstants'
import GSTToolLayout from '../components/GSTToolLayout'

// ─── Types & constants ────────────────────────────────────────

interface PANInfo {
  pan: string
  holderTypeChar: string
  holderType: string
  nameInitial: string
  sequenceNumber: string
  checkDigit: string
  isValid: boolean
}

// PAN format: AAAAA0000A
// [0-2] = 3 alpha (AAA)
// [3]   = entity type char (P/C/H/A/B/F/T/L/J/G)
// [4]   = first letter of name (A–Z)
// [5-8] = 4-digit sequence
// [9]   = check digit (A–Z)
const PAN_REGEX = /^[A-Z]{3}[PCHABFTLJG][A-Z]\d{4}[A-Z]$/

const STRUCTURE_STEPS = [
  {
    label: 'First 3 characters — alphabetic (AAA)',
    check: (p: string) => p.length >= 3 && /^[A-Z]{3}$/.test(p.slice(0, 3)),
    detail: (p: string) => p.slice(0, 3) || '—',
  },
  {
    label: 'Character 4 — entity type (P/C/H/A/B/F/T/L/J/G)',
    check: (p: string) => p.length >= 4 && /^[PCHABFTLJG]$/.test(p[3]),
    detail: (p: string) => p[3] ? `${p[3]} = ${PAN_ENTITY_TYPES[p[3]] ?? 'Unknown'}` : '—',
  },
  {
    label: 'Character 5 — first letter of name (A–Z)',
    check: (p: string) => p.length >= 5 && /^[A-Z]$/.test(p[4]),
    detail: (p: string) => p[4] || '—',
  },
  {
    label: 'Characters 6–9 — numeric sequence (0000–9999)',
    check: (p: string) => p.length >= 9 && /^\d{4}$/.test(p.slice(5, 9)),
    detail: (p: string) => p.slice(5, 9) || '—',
  },
  {
    label: 'Character 10 — check digit (A–Z)',
    check: (p: string) => p.length === 10 && /^[A-Z]$/.test(p[9]),
    detail: (p: string) => p[9] || '—',
  },
]

function parsePAN(pan: string): PANInfo {
  const g = pan.trim().toUpperCase()
  return {
    pan: g,
    holderTypeChar: g[3] ?? '',
    holderType: g[3] ? (PAN_ENTITY_TYPES[g[3]] ?? 'Unknown entity type') : '',
    nameInitial: g[4] ?? '',
    sequenceNumber: g.slice(5, 9),
    checkDigit: g[9] ?? '',
    isValid: PAN_REGEX.test(g),
  }
}

// ─── SEO data ─────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What is a PAN card?',
    a: 'A PAN (Permanent Account Number) is a 10-character alphanumeric identifier issued by the Income Tax Department of India. It is mandatory for financial transactions above a certain threshold and for GST registration.',
  },
  {
    q: 'What information is encoded in a PAN?',
    a: 'Characters 1–3: alphabetic series. Character 4: entity type (P=Person, C=Company, H=HUF, etc.). Character 5: first letter of surname/org name. Characters 6–9: sequential number. Character 10: check digit.',
  },
  {
    q: 'Why no live PAN verification?',
    a: 'Live PAN verification against the NSDL/CBDT database requires a paid API licence. This free tool performs format validation only. For live verification, visit the official Income Tax e-Filing portal.',
  },
  {
    q: 'How is PAN related to GSTIN?',
    a: 'Positions 3–12 of a GSTIN embed the PAN of the registered business. You can extract it directly from any GSTIN. Use the GST Verification tool to extract and validate the embedded PAN.',
  },
]


// ─── Step row ─────────────────────────────────────────────────

function StepRow({ passed, label, detail, last }: {
  passed: boolean
  label: string
  detail: string
  last: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        {passed
          ? <CheckCircle size={18} className="text-[#16A34A]" />
          : <XCircle    size={18} className="text-[#DC2626]" />
        }
        {!last && (
          <div className={[
            'w-px flex-1 mt-1 min-h-[20px]',
            passed ? 'bg-[#BBF7D0]' : 'bg-[#FECDD3]',
          ].join(' ')} />
        )}
      </div>
      <div className="flex-1 pb-3">
        <p className={['text-sm font-medium', passed ? 'text-[#15803D]' : 'text-[#DC2626]'].join(' ')}>
          {label}
        </p>
        <p className="text-xs text-[#9CA3AF] mt-0.5 font-mono">{detail}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default function PANValidator() {
  const [input, setInput]   = useState('')
  const [result, setResult] = useState<PANInfo | null>(null)

  const upper     = input.trim().toUpperCase()
  const isFormatOk = PAN_REGEX.test(upper)
  const hasResult  = result !== null

  const handleValidate = () => {
    if (!upper) return
    setResult(parsePAN(upper))
  }

  const handleReset = () => {
    setInput('')
    setResult(null)
  }

  // Live-update steps once first validation has run
  const liveResult = hasResult ? parsePAN(upper) : null

  const borderClass =
    !hasResult       ? 'border-[#E2E8F0] focus:ring-[#2563EB]/30' :
    isFormatOk       ? 'border-[#16A34A] focus:ring-[#16A34A]/30' :
                       'border-[#DC2626] focus:ring-[#DC2626]/30'

  return (
    <GSTToolLayout
      title="PAN Validator"
      metaTitle="PAN Card Validator | Validate PAN Number Free | EcomSathi"
      metaDescription="Free PAN card validator. Validate PAN format, extract entity type (Individual, Company, HUF) and name initial instantly. No live database check required."
      metaKeywords="PAN validator, validate PAN number, PAN card format check, PAN entity type, ABCDE1234F validator India"
      canonicalPath="/gst/pan-validator"
      crumbs={[{ label: 'GST Tools', to: '/gst' }, { label: 'PAN Validator' }]}
      faqs={FAQS}
    >
      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#0F172A]">PAN Validator</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Validate PAN format and extract taxpayer entity type. Format validation only — no live database check.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">

        {/* Input card */}
        <Card variant="shadowed" padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Enter PAN Number</label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={input}
                  onChange={e => {
                    const v = e.target.value.toUpperCase()
                    setInput(v)
                    if (hasResult) setResult(parsePAN(v))
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleValidate() }}
                  placeholder="e.g. AABCU9603R"
                  maxLength={10}
                  autoComplete="off"
                  spellCheck={false}
                  className={[
                    'w-full pl-9 pr-10 py-3 text-lg font-mono tracking-widest border rounded-lg bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all',
                    borderClass,
                  ].join(' ')}
                />
                {hasResult && upper.length === 10 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isFormatOk
                      ? <CheckCircle size={18} className="text-[#16A34A]" />
                      : <XCircle    size={18} className="text-[#DC2626]" />}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">{upper.length} / 10 characters</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleValidate} disabled={!upper} fullWidth>Validate PAN</Button>
              {hasResult && (
                <Button variant="ghost" onClick={handleReset} leftIcon={<RefreshCw size={15} />}>Reset</Button>
              )}
            </div>
          </div>
        </Card>

        {/* 5-step validation */}
        {liveResult && (
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0F172A]">Format Validation</h2>
              {liveResult.isValid
                ? <Badge variant="success">Valid PAN</Badge>
                : <Badge variant="error">Invalid PAN</Badge>}
            </div>
            <div className="space-y-0">
              {STRUCTURE_STEPS.map((step, i) => (
                <StepRow key={i} passed={step.check(upper)} label={step.label}
                  detail={step.detail(upper)} last={i === STRUCTURE_STEPS.length - 1} />
              ))}
            </div>
          </Card>
        )}

        {/* Extracted details (valid) */}
        {liveResult?.isValid && (
          <Card variant="foam" padding="lg">
            <p className="text-xs font-semibold text-[#16A34A] uppercase tracking-wide mb-4">Extracted from PAN</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#64748B]">PAN Number</p>
                <p className="font-mono font-bold text-[#0F172A] text-base">{liveResult.pan}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Entity / Holder Type</p>
                <p className="font-semibold text-[#0F172A]">{liveResult.holderType}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Entity Type Code</p>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-mono font-bold text-base">
                  {liveResult.holderTypeChar}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Name Initial (char 5)</p>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED] font-mono font-bold text-base">
                  {liveResult.nameInitial}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Sequence Number</p>
                <p className="font-mono font-semibold text-[#0F172A]">{liveResult.sequenceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Check Digit</p>
                <p className="font-mono font-semibold text-[#0F172A]">{liveResult.checkDigit}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Invalid banner */}
        {liveResult && !liveResult.isValid && (
          <div className="rounded-lg bg-[#FFF1F2] border border-[#FECDD3] px-4 py-3 text-sm text-[#991B1B]">
            <span className="font-semibold">Invalid PAN format.</span>{' '}
            Valid pattern: <code className="font-mono bg-[#FECDD3] px-1 rounded">ABCDE1234F</code> — 5 letters, 4 digits, 1 letter.
          </div>
        )}

        {/* No live verify notice */}
        <div className="flex items-start gap-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] px-4 py-3">
          <AlertCircle size={15} className="text-[#D97706] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#92400E]">Why no live PAN verification?</p>
            <p className="text-xs text-[#78350F] mt-0.5 leading-relaxed">
              Requires a paid NSDL/CBDT API licence. Visit the{' '}
              <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer"
                className="underline hover:text-[#92400E]">Income Tax e-Filing portal</a> for live verification.
            </p>
          </div>
        </div>

        {/* Entity types reference */}
        <Card variant="default" padding="md">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3">PAN Entity Types Reference</h2>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(PAN_ENTITY_TYPES).map(([char, label]) => (
              <div key={char} className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-md bg-[#F8FAFC] border border-[#F1F5F9]">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-mono font-bold text-xs flex-shrink-0">
                  {char}
                </span>
                <span className="text-sm text-[#374151]">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#94A3B8] mt-3">The 4th character of a PAN identifies the taxpayer category.</p>
        </Card>

      </div>
    </GSTToolLayout>
  )
}
