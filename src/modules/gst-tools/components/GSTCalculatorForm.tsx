import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Calculator, RefreshCw } from 'lucide-react'
import { GST_RATES } from '../data/gstConstants'

type TransactionType = 'intra' | 'inter'
type Direction = 'exclusive' | 'inclusive'

interface GSTCalculatorFormProps {
  amount: string
  onAmountChange: (v: string) => void
  gstRate: number
  onGstRateChange: (v: number) => void
  cessRate: string
  onCessRateChange: (v: string) => void
  transactionType: TransactionType
  onTransactionTypeChange: (v: TransactionType) => void
  direction?: Direction
  onDirectionChange?: (v: Direction) => void
  showDirection?: boolean
  onCalculate: () => void
  onReset: () => void
  loading?: boolean
  error?: string
  amountLabel?: string
  submitLabel?: string
}

export default function GSTCalculatorForm({
  amount,
  onAmountChange,
  gstRate,
  onGstRateChange,
  cessRate,
  onCessRateChange,
  transactionType,
  onTransactionTypeChange,
  direction,
  onDirectionChange,
  showDirection = true,
  onCalculate,
  onReset,
  loading = false,
  error,
  amountLabel,
  submitLabel = 'Calculate GST',
}: GSTCalculatorFormProps) {
  const resolvedAmountLabel = amountLabel ?? (
    direction === 'inclusive' ? 'GST-Inclusive Amount (₹)' : 'Base Amount (₹)'
  )

  return (
    <div className="space-y-5">
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">Transaction Type</label>
        <div className="flex gap-3">
          {(['intra', 'inter'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onTransactionTypeChange(t)}
              className={[
                'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors',
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
      {showDirection && onDirectionChange && direction !== undefined && (
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Calculation Mode</label>
          <div className="flex gap-3">
            {(['exclusive', 'inclusive'] as const).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => onDirectionChange(d)}
                className={[
                  'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors',
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
      )}

      {/* Amount */}
      <Input
        label={resolvedAmountLabel}
        type="number"
        min="0"
        step="0.01"
        placeholder="e.g. 1000"
        value={amount}
        onChange={e => onAmountChange(e.target.value)}
      />

      {/* GST Rate */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">GST Rate</label>
        <div className="flex flex-wrap gap-2">
          {GST_RATES.map(rate => (
            <button
              key={rate}
              type="button"
              onClick={() => onGstRateChange(rate)}
              className={[
                'py-1.5 px-3 rounded-lg text-sm font-medium border transition-colors',
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

      {/* CESS */}
      <Input
        label="CESS Rate (%) — optional"
        type="number"
        min="0"
        step="0.1"
        placeholder="e.g. 12 for certain goods"
        value={cessRate}
        onChange={e => onCessRateChange(e.target.value)}
      />

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={onCalculate} loading={loading} leftIcon={<Calculator size={16} />} fullWidth>
          {submitLabel}
        </Button>
        <Button variant="ghost" onClick={onReset} leftIcon={<RefreshCw size={16} />}>
          Reset
        </Button>
      </div>
    </div>
  )
}
