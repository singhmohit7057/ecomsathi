import React, { useState } from 'react'
import { Check, X, Info } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { PAN_ENTITY_TYPES } from './data/gstConstants'

interface PANInfo {
  pan: string
  holderTypeChar: string
  holderType: string
  firstName: string
  sequenceNumber: string
  checkDigit: string
  isValid: boolean
}

// PAN format: AAAAA0000A (5 letters, 4 digits, 1 letter)
// Position 4 (0-indexed 3) = entity type
// Position 5 (0-indexed 4) = first letter of surname/org name
const PAN_REGEX = /^[A-Z]{3}[PCHABFTLJG][A-Z]\d{4}[A-Z]$/

function parsePAN(pan: string): PANInfo {
  const upper = pan.trim().toUpperCase()
  const isValid = PAN_REGEX.test(upper)
  const holderTypeChar = upper[3] ?? ''
  const holderType = holderTypeChar ? (PAN_ENTITY_TYPES[holderTypeChar] ?? 'Unknown entity type') : ''
  const firstName = upper[4] ?? ''
  const sequenceNumber = upper.slice(5, 9)
  const checkDigit = upper[9] ?? ''
  return { pan: upper, holderTypeChar, holderType, firstName, sequenceNumber, checkDigit, isValid }
}

export const PANValidator: React.FC = () => {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<PANInfo | null>(null)
  const [validated, setValidated] = useState(false)

  const handleValidate = () => {
    if (!input.trim()) return
    setResult(parsePAN(input))
    setValidated(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleValidate()
  }

  const upper = input.trim().toUpperCase()
  const isFormatOk = PAN_REGEX.test(upper)

  const structureSteps = [
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
      label: 'Characters 6–9 — sequence number (0000)',
      check: (p: string) => p.length >= 9 && /^\d{4}$/.test(p.slice(5, 9)),
      detail: (p: string) => p.slice(5, 9) || '—',
    },
    {
      label: 'Character 10 — check digit (A–Z)',
      check: (p: string) => p.length === 10 && /^[A-Z]$/.test(p[9]),
      detail: (p: string) => p[9] || '—',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">PAN Validator</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Validate PAN format and extract taxpayer type. Format validation only — no live database check.
        </p>
      </div>

      <Card variant="shadowed" padding="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Enter PAN
            </label>
            <input
              type="text"
              value={input}
              onChange={e => {
                setInput(e.target.value.toUpperCase())
                if (validated) setResult(parsePAN(e.target.value))
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. AABCU9603R"
              maxLength={10}
              className={[
                'w-full border rounded-[4px] px-3 py-2.5 text-base font-mono tracking-widest bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all',
                validated
                  ? isFormatOk
                    ? 'border-[#16A34A] focus:ring-[#16A34A]/30'
                    : 'border-[#DC2626] focus:ring-[#DC2626]/30'
                  : 'border-[#E2E8F0] focus:ring-[#2563EB]/30',
              ].join(' ')}
            />
            <p className="text-xs text-[#94A3B8] mt-1">{upper.length}/10 characters</p>
          </div>
          <Button onClick={handleValidate} fullWidth disabled={!input}>
            Validate PAN
          </Button>
        </div>
      </Card>

      {validated && result && (
        <>
          {/* Step-by-step */}
          <Card variant="default" padding="lg">
            <h2 className="text-base font-semibold text-[#0F172A] mb-4">Validation Steps</h2>
            <div className="space-y-3">
              {structureSteps.map((step, i) => {
                const passed = step.check(upper)
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0">
                      {passed
                        ? <Check size={16} className="text-[#16A34A]" />
                        : <X size={16} className="text-[#DC2626]" />
                      }
                    </span>
                    <div>
                      <p className={['text-sm font-medium', passed ? 'text-[#15803D]' : 'text-[#DC2626]'].join(' ')}>
                        {step.label}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5 font-mono">
                        {step.detail(upper)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Result card */}
          {result.isValid && (
            <Card variant="foam" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#0F172A]">PAN Details</h2>
                <Badge variant="success">Valid Format</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#64748B]">PAN Number</p>
                  <p className="font-mono font-semibold text-[#0F172A]">{result.pan}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Entity / Holder Type</p>
                  <p className="font-medium text-[#0F172A]">{result.holderType}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Type Code</p>
                  <p className="font-mono font-medium text-[#2563EB]">{result.holderTypeChar}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Name Initial (5th char)</p>
                  <p className="font-mono font-medium text-[#0F172A]">{result.firstName}</p>
                </div>
              </div>
            </Card>
          )}

          {!result.isValid && (
            <Card variant="blush" padding="md">
              <p className="text-sm text-[#991B1B] font-medium">Invalid PAN format</p>
              <p className="text-xs text-[#DC2626] mt-1">
                A valid PAN follows the pattern: AAAAA0000A (e.g. ABCDE1234F).
              </p>
            </Card>
          )}
        </>
      )}

      {/* PAN entity type reference */}
      <Card variant="default" padding="md">
        <h2 className="text-base font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
          <Info size={16} className="text-[#2563EB]" />
          PAN Entity Types Reference
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PAN_ENTITY_TYPES).map(([char, label]) => (
            <div key={char} className="flex items-center gap-2 text-sm">
              <span className="font-mono font-bold text-[#2563EB] w-5">{char}</span>
              <span className="text-[#374151]">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQ */}
      <Card variant="highlight" padding="md">
        <h2 className="text-base font-semibold text-[#92400E] mb-2">Why no live PAN verification?</h2>
        <p className="text-sm text-[#78350F]">
          PAN verification against the NSDL/CBDT database requires a paid API licence and is not
          included in this free tool. This tool performs format validation only. For live PAN
          verification, visit the official Income Tax e-Filing portal.
        </p>
      </Card>
    </div>
  )
}

export default PANValidator
