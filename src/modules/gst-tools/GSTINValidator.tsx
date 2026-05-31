import React, { useState } from 'react'
import { Check, X, Copy, CheckCheck, ExternalLink } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import {
  extractGSTINInfo,
  validateGSTINChecksum,
  getStateByCode,
} from './data/gstConstants'

const BACKEND_URL = import.meta.env.VITE_PROCESSING_API_URL as string

interface ValidationStep {
  label: string
  passed: boolean | null
  detail?: string
}

function validateGSTINSteps(gstin: string): ValidationStep[] {
  const upper = gstin.trim().toUpperCase()

  const step1: ValidationStep = {
    label: 'Length check (must be 15 characters)',
    passed: upper.length === 15,
    detail: `Length: ${upper.length}`,
  }

  if (upper.length === 0) return [step1]

  const stateCode = upper.slice(0, 2)
  const stateNum = parseInt(stateCode, 10)
  const stateValid = /^\d{2}$/.test(stateCode) && stateNum >= 1 && stateNum <= 99
  const stateObj = getStateByCode(stateCode)
  const step2: ValidationStep = {
    label: 'State code valid (01–38)',
    passed: stateValid && !!stateObj,
    detail: stateObj ? stateObj.name : `Code ${stateCode} not found`,
  }

  const panPart = upper.slice(2, 12)
  const panValid = /^[A-Z]{3}[PCHABFTBLJG][A-Z]\d{4}[A-Z]$/.test(panPart)
  const step3: ValidationStep = {
    label: 'PAN format valid (chars 3–12)',
    passed: panValid,
    detail: panPart,
  }

  const entityNum = upper[12]
  const entityValid = entityNum !== undefined && /^[1-9A-Z]$/.test(entityNum)
  const step4: ValidationStep = {
    label: 'Entity number valid (char 13, 1–9 or A–Z)',
    passed: entityValid,
    detail: entityNum ? `Value: ${entityNum}` : 'Missing',
  }

  const zChar = upper[13]
  const step5: ValidationStep = {
    label: "14th character is 'Z'",
    passed: zChar === 'Z',
    detail: zChar ? `Value: ${zChar}` : 'Missing',
  }

  let step6: ValidationStep
  if (upper.length === 15 && step2.passed && step3.passed && step4.passed && step5.passed) {
    const checksumOk = validateGSTINChecksum(upper)
    step6 = {
      label: 'Checksum digit valid',
      passed: checksumOk,
      detail: checksumOk ? 'Checksum matches' : `Expected different digit at position 15`,
    }
  } else {
    step6 = {
      label: 'Checksum digit valid',
      passed: null,
      detail: 'Cannot verify — earlier checks failed',
    }
  }

  return [step1, step2, step3, step4, step5, step6]
}

export const GSTINValidator: React.FC = () => {
  const [input, setInput] = useState('')
  const [steps, setSteps] = useState<ValidationStep[]>([])
  const [validated, setValidated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveResult, setLiveResult] = useState<{ status: string; name?: string; error?: string } | null>(null)

  const handleValidate = () => {
    const upper = input.trim().toUpperCase()
    setSteps(validateGSTINSteps(upper))
    setValidated(true)
    setLiveResult(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleValidate()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(input.trim().toUpperCase())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLiveVerify = async () => {
    const gstin = input.trim().toUpperCase()
    setLiveLoading(true)
    setLiveResult(null)
    try {
      const res = await fetch(`${BACKEND_URL}/api/gst/verify?gstin=${encodeURIComponent(gstin)}`)
      const data = await res.json() as { status?: string; legalName?: string; error?: string }
      if (res.ok && data.status) {
        setLiveResult({ status: data.status, name: data.legalName })
      } else {
        setLiveResult({ status: 'error', error: data.error ?? 'Verification failed' })
      }
    } catch {
      setLiveResult({ status: 'error', error: 'Unable to reach verification server.' })
    } finally {
      setLiveLoading(false)
    }
  }

  const upper = input.trim().toUpperCase()
  const allPassed = steps.length === 6 && steps.every(s => s.passed === true)
  const info = allPassed ? extractGSTINInfo(upper) : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">GSTIN Validator</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Step-by-step format and checksum validation for any GSTIN.
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
                onChange={e => {
                  setInput(e.target.value.toUpperCase())
                  if (validated) setSteps(validateGSTINSteps(e.target.value.trim().toUpperCase()))
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 27AABCU9603R1ZX"
                maxLength={15}
                className={[
                  'flex-1 border rounded-[4px] px-3 py-2.5 text-base font-mono tracking-widest bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all',
                  validated
                    ? allPassed
                      ? 'border-[#16A34A] focus:ring-[#16A34A]/30'
                      : 'border-[#DC2626] focus:ring-[#DC2626]/30'
                    : 'border-[#E2E8F0] focus:ring-[#2563EB]/30',
                ].join(' ')}
              />
              <Button
                variant="ghost"
                onClick={handleCopy}
                leftIcon={copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                disabled={!input}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">{upper.length}/15 characters</p>
          </div>
          <Button onClick={handleValidate} fullWidth disabled={!input}>
            Validate GSTIN
          </Button>
        </div>
      </Card>

      {steps.length > 0 && (
        <Card variant="default" padding="lg">
          <h2 className="text-base font-semibold text-[#0F172A] mb-4">Validation Steps</h2>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0">
                  {step.passed === true && <Check size={16} className="text-[#16A34A]" />}
                  {step.passed === false && <X size={16} className="text-[#DC2626]" />}
                  {step.passed === null && (
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-[#D1D5DB]" />
                  )}
                </span>
                <div>
                  <p className={[
                    'text-sm font-medium',
                    step.passed === true ? 'text-[#15803D]' :
                    step.passed === false ? 'text-[#DC2626]' : 'text-[#9CA3AF]',
                  ].join(' ')}>
                    {step.label}
                  </p>
                  {step.detail && (
                    <p className="text-xs text-[#6B7280] mt-0.5">{step.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {allPassed && info && (
        <Card variant="foam" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#0F172A]">Extracted Information</h2>
            <Badge variant="success">Valid Format</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoItem label="State Code" value={info.stateCode} />
            <InfoItem label="State" value={info.stateName} />
            <InfoItem label="PAN Number" value={info.pan} mono />
            <InfoItem label="Entity Type" value={info.entityType} />
            <InfoItem label="Entity Number" value={info.entityNumber} />
            <InfoItem label="Check Digit" value={info.checkDigit} />
          </div>

          <div className="mt-5 pt-4 border-t border-[#BBF7D0]">
            <p className="text-xs text-[#64748B] mb-3">
              Format validation passed. Verify on the GSTN portal for active status.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLiveVerify}
              loading={liveLoading}
              leftIcon={<ExternalLink size={14} />}
            >
              Verify Live on Government Portal
            </Button>

            {liveResult && (
              <div className={[
                'mt-3 rounded-[6px] p-3 text-sm',
                liveResult.status === 'error'
                  ? 'bg-[#FFF1F2] text-[#991B1B]'
                  : liveResult.status?.toLowerCase() === 'active'
                  ? 'bg-[#F0FDF4] text-[#15803D]'
                  : 'bg-[#FFFBEB] text-[#92400E]',
              ].join(' ')}>
                {liveResult.status === 'error'
                  ? liveResult.error
                  : <>Status: <strong>{liveResult.status}</strong>{liveResult.name ? ` — ${liveResult.name}` : ''}</>
                }
              </div>
            )}
          </div>
        </Card>
      )}

      {validated && !allPassed && steps.some(s => s.passed === false) && (
        <Card variant="blush" padding="md">
          <p className="text-sm text-[#991B1B] font-medium">Invalid GSTIN format</p>
          <p className="text-xs text-[#DC2626] mt-1">
            Please check the highlighted errors above and correct the GSTIN.
          </p>
        </Card>
      )}
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

export default GSTINValidator
