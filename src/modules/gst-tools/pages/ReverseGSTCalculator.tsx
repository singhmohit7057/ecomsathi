import { useState, useCallback } from 'react'
import { Card } from '@/components/common/Card'
import GSTToolLayout from '../components/GSTToolLayout'
import GSTCalculatorForm from '../components/GSTCalculatorForm'
import { ResultRow } from '../components/GSTResultCard'

type TransactionType = 'intra' | 'inter'

interface ReverseResult {
  inclusiveAmount: number
  baseAmount: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  totalTax: number
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
    q: 'What is a reverse GST calculation?',
    a: "A reverse GST calculation extracts the original base amount and tax components from a GST-inclusive price. For example, if you paid ₹1,180 for an item with 18% GST, the reverse calculator tells you the base was ₹1,000 and GST was ₹180.",
  },
  {
    q: 'When would I use a reverse GST calculator?',
    a: "Use it when you have a GST-inclusive price (like a retail MRP) and need to know how much of that is tax. It's useful for filing GST returns, reconciling purchases, or when a supplier quotes a price with tax already included.",
  },
  {
    q: 'What is the formula for reverse GST calculation?',
    a: 'Base Amount = Inclusive Amount ÷ (1 + GST Rate / 100). For example, with 18% GST: Base = 1180 ÷ 1.18 = ₹1,000. The GST component is the difference: ₹1,180 - ₹1,000 = ₹180.',
  },
  {
    q: 'How do I split the GST into CGST and SGST?',
    a: 'For intra-state transactions, CGST and SGST are each half the total GST. For 18% GST, both CGST and SGST are 9% each. For inter-state transactions, only IGST (full 18%) applies.',
  },
]

const RELATED_TOOLS = [
  { label: 'GST Calculator',  to: '/gst/calculator' },
  { label: 'GST Rate Finder', to: '/gst/rate-finder' },
  { label: 'HSN Code Search', to: '/gst/hsn-search' },
  { label: 'GST Verification', to: '/gst/verification' },
]

export default function ReverseGSTCalculator() {
  const [amount, setAmount]               = useState('')
  const [gstRate, setGstRate]             = useState(18)
  const [cessRate, setCessRate]           = useState('')
  const [transactionType, setTransactionType] = useState<TransactionType>('intra')
  const [result, setResult]               = useState<ReverseResult | null>(null)
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

    const base      = round2(amtNum / (1 + (gstRate + cess) / 100))
    const totalGST  = round2(base * gstRate / 100)
    const totalCess = round2(base * cess / 100)
    const cgst = transactionType === 'intra' ? round2(totalGST / 2) : 0
    const sgst = transactionType === 'intra' ? round2(totalGST / 2) : 0
    const igst = transactionType === 'inter' ? totalGST : 0

    setResult({
      inclusiveAmount: round2(amtNum), baseAmount: base, cgst, sgst, igst,
      cess: totalCess, totalTax: round2(totalGST + totalCess),
      gstRate, cessRate: cess, transactionType,
    })
  }, [amount, gstRate, cessRate, transactionType])

  const reset = () => { setAmount(''); setCessRate(''); setResult(null); setError('') }

  return (
    <GSTToolLayout
      title="Reverse GST Calculator"
      metaTitle="Reverse GST Calculator Online | Extract GST from Inclusive Price | EcomSathi"
      metaDescription="Free reverse GST calculator. Enter a GST-inclusive price and extract the original base amount plus CGST, SGST, or IGST breakdown. Supports all GST slabs."
      metaKeywords="reverse GST calculator, extract GST from price, GST inclusive calculator, remove GST from amount"
      canonicalPath="/gst/reverse-calculator"
      crumbs={[{ label: 'GST Tools', to: '/gst' }, { label: 'Reverse GST Calculator' }]}
      faqs={FAQS}
    >
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Reverse GST Calculator</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Enter a GST-inclusive price to extract the base amount and tax breakdown.
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
            showDirection={false}
            onCalculate={calculate}
            onReset={reset}
            error={error}
            amountLabel="GST-Inclusive Amount (₹)"
            submitLabel="Extract GST"
          />
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
                <ResultRow label="Total Tax Component" value={formatINR(result.totalTax)} bold />
              </div>
            </div>
          </Card>
        )}
      </div>
    </GSTToolLayout>
  )
}
