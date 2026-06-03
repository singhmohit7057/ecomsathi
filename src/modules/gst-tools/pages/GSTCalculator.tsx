import { useState, useCallback } from 'react'
import { Card } from '@/components/common/Card'
import GSTToolLayout from '../components/GSTToolLayout'
import GSTCalculatorForm from '../components/GSTCalculatorForm'
import { ResultRow } from '../components/GSTResultCard'

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

function round2(n: number) { return Math.round(n * 100) / 100 }
function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n)
}

const FAQS = [
  {
    q: 'What is GST exclusive vs GST inclusive?',
    a: 'GST exclusive means the amount you enter does not include GST, and the calculator adds GST on top. GST inclusive means GST is already included in the amount, and the calculator extracts it.',
  },
  {
    q: 'What is the difference between CGST, SGST, and IGST?',
    a: 'For intra-state (same state) transactions, GST is split equally into CGST and SGST. For inter-state transactions, only IGST applies. The total tax rate is the same either way.',
  },
  {
    q: 'Which GST rate applies to my product?',
    a: 'GST rates in India are 0%, 5%, 12%, 18%, and 28%. Use the HSN Code Search or GST Rate Finder to find the applicable rate for your specific product.',
  },
  {
    q: 'What is CESS in GST?',
    a: "CESS is an additional tax levied on certain items like tobacco, pan masala, and coal over and above the regular GST rate. It's used to compensate states for revenue loss during GST transition.",
  },
]

const RELATED_TOOLS = [
  { label: 'Reverse GST Calculator', to: '/gst/reverse-calculator' },
  { label: 'GST Rate Finder',        to: '/gst/rate-finder' },
  { label: 'HSN Code Search',        to: '/gst/hsn-search' },
  { label: 'GST Verification',       to: '/gst/verification' },
]

export default function GSTCalculator() {
  const [amount, setAmount]               = useState('')
  const [gstRate, setGstRate]             = useState(18)
  const [cessRate, setCessRate]           = useState('')
  const [transactionType, setTransactionType] = useState<TransactionType>('intra')
  const [direction, setDirection]         = useState<Direction>('exclusive')
  const [result, setResult]               = useState<GSTResult | null>(null)
  const [error, setError]                 = useState('')

  const calculate = useCallback(() => {
    const amtNum = parseFloat(amount)
    if (!amount || isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid positive amount.')
      setResult(null)
      return
    }
    const cess = parseFloat(cessRate) || 0
    if (cess < 0 || cess > 100) { setError('Cess rate must be between 0 and 100.'); return }
    setError('')

    const base = direction === 'exclusive' ? amtNum : round2(amtNum / (1 + (gstRate + cess) / 100))
    const totalGST  = round2(base * gstRate / 100)
    const totalCess = round2(base * cess / 100)
    const cgst = transactionType === 'intra' ? round2(totalGST / 2) : 0
    const sgst = transactionType === 'intra' ? round2(totalGST / 2) : 0
    const igst = transactionType === 'inter' ? totalGST : 0

    setResult({
      baseAmount: round2(base), cgst, sgst, igst,
      cess: totalCess, total: round2(base + totalGST + totalCess),
      gstRate, cessRate: cess, transactionType,
    })
  }, [amount, gstRate, cessRate, transactionType, direction])

  const reset = () => { setAmount(''); setCessRate(''); setResult(null); setError('') }

  return (
    <GSTToolLayout
      title="GST Calculator"
      metaTitle="GST Calculator Online | Calculate CGST, SGST, IGST | EcomSathi"
      metaDescription="Free online GST calculator. Calculate CGST + SGST for intra-state or IGST for inter-state transactions. Supports GST exclusive and inclusive modes with cess."
      metaKeywords="GST calculator, GST calculator online, CGST SGST calculator, IGST calculator, GST tax calculator India"
      canonicalPath="/gst/calculator"
      crumbs={[{ label: 'GST Tools', to: '/gst' }, { label: 'GST Calculator' }]}
      relatedTools={RELATED_TOOLS}
      faqs={FAQS}
    >
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">GST Calculator</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Calculate CGST + SGST (intra-state) or IGST (inter-state) for any amount.
          </p>
        </div>

        <Card variant="shadowed" padding="lg">
          <GSTCalculatorForm
            amount={amount}
            onAmountChange={setAmount}
            gstRate={gstRate}
            onGstRateChange={setGstRate}
            cessRate={cessRate}
            onCessRateChange={setCessRate}
            transactionType={transactionType}
            onTransactionTypeChange={setTransactionType}
            direction={direction}
            onDirectionChange={setDirection}
            showDirection
            onCalculate={calculate}
            onReset={reset}
            error={error}
          />
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
    </GSTToolLayout>
  )
}
