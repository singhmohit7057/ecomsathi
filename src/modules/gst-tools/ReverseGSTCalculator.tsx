import React, { useState, useCallback } from 'react'
import { Divide, RefreshCw } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { GST_RATES } from './data/gstConstants'

type TransactionType = 'intra' | 'inter'

interface ReverseResult {
  inclusiveAmount: number
  baseAmount: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  gstRate: number
  cessRate: number
  transactionType: TransactionType
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(n)
}

export const ReverseGSTCalculator: React.FC = () => {
  const [amount, setAmount] = useState('')
  const [gstRate, setGstRate] = useState<number>(18)
  const [cessRate, setCessRate] = useState('')
  const [transactionType, setTransactionType] = useState<TransactionType>('intra')
  const [result, setResult] = useState<ReverseResult | null>(null)
  const [error, setError] = useState('')

  const calculate = useCallback(() => {
    const amtNum = parseFloat(amount)
    if (!amount || isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid positive amount.')
      setResult(null)
      return
    }
    const cess = parseFloat(cessRate) || 0
    if (cess < 0 || cess > 100) {
      setError('Cess rate must be between 0 and 100.')
      return
    }
    setError('')

    const base = round2(amtNum / (1 + (gstRate + cess) / 100))
    const totalGST = round2(base * gstRate / 100)
    const totalCess = round2(base * cess / 100)

    let cgst = 0, sgst = 0, igst = 0
    if (transactionType === 'intra') {
      cgst = round2(totalGST / 2)
      sgst = round2(totalGST / 2)
    } else {
      igst = totalGST
    }

    setResult({
      inclusiveAmount: round2(amtNum),
      baseAmount: base,
      cgst,
      sgst,
      igst,
      cess: totalCess,
      gstRate,
      cessRate: cess,
      transactionType,
    })
  }, [amount, gstRate, cessRate, transactionType])

  const reset = () => {
    setAmount('')
    setCessRate('')
    setResult(null)
    setError('')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Reverse GST Calculator</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Enter a GST-inclusive price to extract the base amount and tax breakdown.
        </p>
      </div>

      <Card variant="shadowed" padding="lg">
        <div className="space-y-5">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Transaction Type
            </label>
            <div className="flex gap-3">
              {(['intra', 'inter'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTransactionType(t)}
                  className={[
                    'flex-1 py-2.5 px-4 rounded-[6px] text-sm font-medium border transition-colors',
                    transactionType === t
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#374151] border-[#E2E8F0] hover:bg-[#F8FAFC]',
                  ].join(' ')}
                >
                  {t === 'intra' ? 'Intra-state (CGST + SGST)' : 'Inter-state (IGST)'}
                </button>
              ))}
            </div>
          </div>

          {/* GST-Inclusive Amount */}
          <Input
            label="GST-Inclusive Amount (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1180 (₹1000 + 18% GST)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          {/* GST Rate */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              GST Rate
            </label>
            <div className="flex flex-wrap gap-2">
              {GST_RATES.map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setGstRate(rate)}
                  className={[
                    'py-1.5 px-3 rounded-[6px] text-sm font-medium border transition-colors',
                    gstRate === rate
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#374151] border-[#E2E8F0] hover:bg-[#F8FAFC]',
                  ].join(' ')}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {/* CESS Rate */}
          <Input
            label="CESS Rate (%) — optional"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 12 for certain goods"
            value={cessRate}
            onChange={e => setCessRate(e.target.value)}
          />

          {error && (
            <p className="text-sm text-[#DC2626]">{error}</p>
          )}

          <div className="flex gap-3">
            <Button onClick={calculate} leftIcon={<Divide size={16} />} fullWidth>
              Extract GST
            </Button>
            <Button variant="ghost" onClick={reset} leftIcon={<RefreshCw size={16} />}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card variant="sky" padding="lg">
          <h2 className="text-base font-semibold text-[#0F172A] mb-4">GST Extraction Result</h2>
          <div className="space-y-3">
            <ResultRow label="GST-Inclusive Amount" value={formatINR(result.inclusiveAmount)} />
            <div className="border-t border-[#BAE6FD] pt-3">
              <ResultRow label="Base Amount (excl. GST)" value={formatINR(result.baseAmount)} bold />
            </div>
            {result.transactionType === 'intra' ? (
              <>
                <ResultRow label={`CGST @ ${result.gstRate / 2}%`} value={formatINR(result.cgst)} />
                <ResultRow label={`SGST @ ${result.gstRate / 2}%`} value={formatINR(result.sgst)} />
              </>
            ) : (
              <ResultRow label={`IGST @ ${result.gstRate}%`} value={formatINR(result.igst)} />
            )}
            {result.cessRate > 0 && (
              <ResultRow label={`CESS @ ${result.cessRate}%`} value={formatINR(result.cess)} />
            )}
            <div className="border-t border-[#BAE6FD] pt-3">
              <ResultRow
                label="Total Tax Component"
                value={formatINR(result.cgst + result.sgst + result.igst + result.cess)}
                bold
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

const ResultRow: React.FC<{
  label: string
  value: string
  bold?: boolean
}> = ({ label, value, bold }) => (
  <div className="flex justify-between items-center">
    <span className={['text-sm', bold ? 'font-semibold text-[#0F172A]' : 'text-[#475569]'].join(' ')}>
      {label}
    </span>
    <span className={['font-mono', bold ? 'text-base font-bold text-[#2563EB]' : 'text-sm text-[#0F172A]'].join(' ')}>
      {value}
    </span>
  </div>
)

export default ReverseGSTCalculator
