import React, { useState, useCallback } from 'react'
import { Calculator, RefreshCw } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { GST_RATES } from './data/gstConstants'

type TransactionType = 'intra' | 'inter'
type Direction = 'exclusive' | 'inclusive'

interface GSTResult {
  baseAmount: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  total: number
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

export const GSTCalculator: React.FC = () => {
  const [amount, setAmount] = useState('')
  const [gstRate, setGstRate] = useState<number>(18)
  const [cessRate, setCessRate] = useState('')
  const [transactionType, setTransactionType] = useState<TransactionType>('intra')
  const [direction, setDirection] = useState<Direction>('exclusive')
  const [result, setResult] = useState<GSTResult | null>(null)
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

    let base: number
    if (direction === 'exclusive') {
      base = amtNum
    } else {
      // inclusive — strip out GST + cess
      base = round2(amtNum / (1 + (gstRate + cess) / 100))
    }

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
      baseAmount: round2(base),
      cgst,
      sgst,
      igst,
      cess: totalCess,
      total: round2(base + totalGST + totalCess),
      gstRate,
      cessRate: cess,
      transactionType,
    })
  }, [amount, gstRate, cessRate, transactionType, direction])

  const reset = () => {
    setAmount('')
    setCessRate('')
    setResult(null)
    setError('')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">GST Calculator</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Calculate CGST, SGST or IGST for any transaction amount.
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

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Calculation Mode
            </label>
            <div className="flex gap-3">
              {(['exclusive', 'inclusive'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={[
                    'flex-1 py-2.5 px-4 rounded-[6px] text-sm font-medium border transition-colors',
                    direction === d
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#374151] border-[#E2E8F0] hover:bg-[#F8FAFC]',
                  ].join(' ')}
                >
                  {d === 'exclusive' ? 'GST Exclusive (Add GST)' : 'GST Inclusive (Remove GST)'}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <Input
            label={direction === 'exclusive' ? 'Base Amount (₹)' : 'GST-Inclusive Amount (₹)'}
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1000"
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
            placeholder="e.g. 12 for soft drinks"
            value={cessRate}
            onChange={e => setCessRate(e.target.value)}
          />

          {error && (
            <p className="text-sm text-[#DC2626]">{error}</p>
          )}

          <div className="flex gap-3">
            <Button onClick={calculate} leftIcon={<Calculator size={16} />} fullWidth>
              Calculate GST
            </Button>
            <Button variant="ghost" onClick={reset} leftIcon={<RefreshCw size={16} />}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card variant="foam" padding="lg">
          <h2 className="text-base font-semibold text-[#0F172A] mb-4">GST Breakdown</h2>
          <div className="space-y-3">
            <ResultRow label="Base Amount" value={formatINR(result.baseAmount)} />
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
            <div className="border-t border-[#BBF7D0] pt-3">
              <ResultRow label="Total Amount" value={formatINR(result.total)} bold />
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
    <span className={['font-mono', bold ? 'text-base font-bold text-[#16A34A]' : 'text-sm text-[#0F172A]'].join(' ')}>
      {value}
    </span>
  </div>
)

export default GSTCalculator
