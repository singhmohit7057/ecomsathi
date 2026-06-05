import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  CheckCircle2,
  AlertTriangle,
  Upload,
  ChevronRight,
  Loader2,
  FileText,
  X,
} from 'lucide-react'
import { Button } from '@/components/common'
import {
  parseMarketplaceFile,
  validateRow,
  detectMarketplace,
  normalizeAmazonRow,
  normalizeFlipkartRow,
  normalizeMyntraRow,
  normalizeMeeshoRow,
} from './utils/csvParser'
import type { ParsedData } from './utils/csvParser'
import * as reconService from '@/services/reconciliationService'
import type {
  ReconciliationImportType,
  FlipkartImportResult,
  MyntraImportResult,
} from '@/services/reconciliationService'
import type { Order } from '@/types'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type Marketplace = 'amazon' | 'flipkart' | 'myntra' | 'meesho'
type ReportType = ReconciliationImportType
type GenericStep = 1 | 2 | 3 | 4
type FlipkartStep = 1 | 2 | 3
type MyntraStep = 1 | 2 | 3

interface ImportWizardProps {
  orgId: string
  onComplete: () => void
  onCancel: () => void
}

interface ParsedPreview {
  rows: ParsedData[]
  validCount: number
  invalidCount: number
  headers: string[]
  errors: { rowIndex: number; messages: string[] }[]
}

// ─── Marketplace config ───────────────────────────────────────────────────────

const MARKETPLACES: { id: Marketplace; label: string; color: string }[] = [
  { id: 'amazon', label: 'Amazon', color: 'bg-[#FF9900]' },
  { id: 'flipkart', label: 'Flipkart', color: 'bg-[#2874F0]' },
  { id: 'myntra', label: 'Myntra', color: 'bg-[#FF3F6C]' },
  { id: 'meesho', label: 'Meesho', color: 'bg-[#9B59B6]' },
]

const REPORT_TYPES: { id: ReportType; label: string; desc: string }[] = [
  { id: 'orders', label: 'Orders Report', desc: 'Order-level data from the marketplace' },
  { id: 'settlements', label: 'Settlement Report', desc: 'Payment settlement data' },
]

const XLSX_ACCEPT = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
}

const CSV_ACCEPT = {
  'text/csv': ['.csv'],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prevMonth(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ current: number; total: number; labels: string[] }> = ({
  current,
  total,
  labels,
}) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
      <React.Fragment key={step}>
        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              step < current
                ? 'bg-[#2563EB] border-[#2563EB] text-white'
                : step === current
                ? 'bg-white border-[#2563EB] text-[#2563EB]'
                : 'bg-white border-[#E2E8F0] text-[#94A3B8]'
            }`}
          >
            {step < current ? <CheckCircle2 size={14} /> : step}
          </div>
          <span
            className={`text-[10px] whitespace-nowrap ${
              step === current ? 'text-[#2563EB] font-medium' : 'text-[#94A3B8]'
            }`}
          >
            {labels[step - 1]}
          </span>
        </div>
        {step < total && (
          <div
            className={`flex-1 h-0.5 mb-4 ${step < current ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
)

// ─── Single Flipkart drop zone ────────────────────────────────────────────────

interface FlipkartZoneProps {
  label: string
  hint: string
  file: File | null
  onDrop: (f: File) => void
  onRemove: () => void
}

const FlipkartZone: React.FC<FlipkartZoneProps> = ({ label, hint, file, onDrop, onRemove }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: XLSX_ACCEPT,
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) onDrop(accepted[0])
    },
  })

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors min-h-[148px] ${
        isDragActive
          ? 'border-[#2563EB] bg-[#EFF6FF]'
          : file
          ? 'border-[#16A34A] bg-[#F0FDF4]'
          : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB]'
      }`}
    >
      <input {...getInputProps()} />
      {file ? (
        <>
          <CheckCircle2 size={24} className="text-[#16A34A] shrink-0" />
          <p className="font-semibold text-sm text-[#0F172A] text-center break-all">{file.name}</p>
          <p className="text-xs text-[#64748B]">{fmtSize(file.size)}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="text-xs text-[#DC2626] hover:underline"
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <Upload size={22} className="text-[#94A3B8] shrink-0" />
          <p className="font-semibold text-sm text-[#0F172A] text-center">{label}</p>
          <p className="text-xs text-[#94A3B8] text-center">{hint}</p>
          <p className="text-[10px] text-[#CBD5E1]">.xlsx only</p>
        </>
      )}
    </div>
  )
}

// ─── Flipkart wizard (steps 2–3) ─────────────────────────────────────────────

const FlipkartWizard: React.FC<{
  orgId: string
  onComplete: () => void
  onCancel: () => void
  onBack: () => void
}> = ({ orgId, onComplete, onCancel, onBack }) => {
  const [fkStep, setFkStep] = useState<FlipkartStep>(2)
  const [ordersFile, setOrdersFile] = useState<File | null>(null)
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [returnsFile, setReturnsFile] = useState<File | null>(null)
  const [month, setMonth] = useState(prevMonth())
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<FlipkartImportResult | null>(null)

  const allUploaded = ordersFile !== null && paymentFile !== null && returnsFile !== null

  const handleImport = async () => {
    if (!ordersFile || !paymentFile || !returnsFile) return
    setImporting(true)
    setProgress(10)

    try {
      const timer = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 85))
      }, 400)

      const res = await reconService.importFlipkartReports(
        orgId,
        { orders: ordersFile, payment: paymentFile, returns: returnsFile },
        month,
      )

      clearInterval(timer)
      setProgress(100)
      setResult(res)
      toast.success('Flipkart reports imported successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
      setProgress(0)
    } finally {
      setImporting(false)
    }
  }

  const FK_LABELS = ['Select Marketplace', 'Upload Monthly Reports', 'Import & Reconcile']

  return (
    <>
      <StepIndicator current={fkStep} total={3} labels={FK_LABELS} />

      {fkStep === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FlipkartZone
              label="Order Report"
              hint="order_item_id, order_id, sku, order_date…"
              file={ordersFile}
              onDrop={setOrdersFile}
              onRemove={() => setOrdersFile(null)}
            />
            <FlipkartZone
              label="Payment Report"
              hint="NEFT ID, Order ID, Sale Amount, MP Fee…"
              file={paymentFile}
              onDrop={setPaymentFile}
              onRemove={() => setPaymentFile(null)}
            />
            <FlipkartZone
              label="Return Report"
              hint="return_id, order_item_id, return_status…"
              file={returnsFile}
              onDrop={setReturnsFile}
              onRemove={() => setReturnsFile(null)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#0F172A] shrink-0">Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button
              onClick={() => setFkStep(3)}
              disabled={!allUploaded}
              rightIcon={<ChevronRight size={16} />}
              fullWidth
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {fkStep === 3 && (
        <div className="space-y-5">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl">
                <CheckCircle2 size={28} className="text-[#16A34A]" />
                <p className="font-semibold text-[#15803D]">Import complete</p>
              </div>

<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    { label: 'Orders Imported', value: result.orders_inserted },
                    { label: 'Payments Imported', value: result.payments_inserted },
                    { label: 'Returns Imported', value: result.returns_inserted },
                    { label: 'Matched', value: result.matched },
                    { label: 'Unmatched', value: result.unmatched },
                    {
                      label: 'Total Revenue',
                      value: `₹${result.total_revenue.toFixed(2)}`,
                    },
                    { label: 'Total Fees', value: `₹${result.total_fees.toFixed(2)}` },
                    {
                      label: 'Discrepancy',
                      value: `₹${result.discrepancy_amount.toFixed(2)}`,
                      highlight: result.discrepancy_amount !== 0,
                    },
                  ] as { label: string; value: string | number; highlight?: boolean }[]
                ).map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-center"
                  >
                    <p
                      className={`text-lg font-bold ${
                        stat.highlight ? 'text-[#DC2626]' : 'text-[#0F172A]'
                      }`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={onCancel} fullWidth>
                  Close
                </Button>
                <Button onClick={onComplete} fullWidth>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-[#0F172A]">Import Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[#64748B]">Marketplace</span>
                    <p className="font-medium text-[#0F172A]">Flipkart</p>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Month</span>
                    <p className="font-medium text-[#0F172A]">{month}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Files</span>
                    <p className="font-medium text-[#0F172A]">3 files ready</p>
                  </div>
                </div>
              </div>

              {importing && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#64748B]">
                    <span>Importing…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setFkStep(2)}
                  disabled={importing}
                >
                  Back
                </Button>
                <Button
                  onClick={() => void handleImport()}
                  loading={importing}
                  disabled={importing}
                  fullWidth
                >
                  Import & Reconcile
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ─── Single Myntra drop zone ──────────────────────────────────────────────────

interface MyntraZoneProps {
  label: string
  required: boolean
  file: File | null
  onDrop: (f: File) => void
  onRemove: () => void
}

const MyntraZone: React.FC<MyntraZoneProps> = ({ label, required, file, onDrop, onRemove }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: CSV_ACCEPT,
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) onDrop(accepted[0])
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#0F172A]">{label}</span>
        {required ? (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FEE2E2] text-[#DC2626]">
            Required
          </span>
        ) : (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
            Optional
          </span>
        )}
      </div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : file
            ? 'border-[#16A34A] bg-[#F0FDF4]'
            : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB]'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center gap-1.5">
            <CheckCircle2 size={22} className="text-[#16A34A] shrink-0" />
            <p className="font-medium text-[#0F172A] text-sm break-all leading-snug">{file.name}</p>
            <p className="text-xs text-[#94A3B8]">{fmtSize(file.size)}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="text-xs text-[#DC2626] hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Upload size={20} className="text-[#94A3B8] shrink-0" />
            <p className="text-xs text-[#64748B]">
              {isDragActive ? 'Drop file here' : 'Drag & drop or click'}
            </p>
            <p className="text-[10px] text-[#CBD5E1]">.csv only</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Myntra wizard (steps 2–3) ────────────────────────────────────────────────

const MyntraWizard: React.FC<{
  orgId: string
  onComplete: () => void
  onCancel: () => void
  onBack: () => void
}> = ({ orgId, onComplete, onCancel, onBack }) => {
  const [mStep, setMStep] = useState<MyntraStep>(2)
  const [ordersFile, setOrdersFile] = useState<File | null>(null)
  const [returnsFile, setReturnsFile] = useState<File | null>(null)
  const [cancellationsFile, setCancellationsFile] = useState<File | null>(null)
  const [returnDeliveryFile, setReturnDeliveryFile] = useState<File | null>(null)
  const [spfFile, setSpfFile] = useState<File | null>(null)
  const [month, setMonth] = useState(prevMonth())
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<MyntraImportResult | null>(null)

  const filesSelectedCount = [ordersFile, returnsFile, cancellationsFile, returnDeliveryFile, spfFile].filter(
    Boolean,
  ).length

  const handleImport = async () => {
    if (!ordersFile || !returnsFile || !cancellationsFile) return
    setImporting(true)
    setProgress(10)

    try {
      const timer = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 85))
      }, 400)

      const res = await reconService.importMyntraReports(
        orgId,
        {
          orders: ordersFile,
          returns: returnsFile,
          cancellations: cancellationsFile,
          returnDelivery: returnDeliveryFile ?? undefined,
          spf: spfFile ?? undefined,
        },
        month,
      )

      clearInterval(timer)
      setProgress(100)
      setResult(res)
      toast.success('Myntra reports imported successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
      setProgress(0)
    } finally {
      setImporting(false)
    }
  }

  const MN_LABELS = ['Select Marketplace', 'Upload Monthly Reports', 'Import & Reconcile']

  return (
    <>
      <StepIndicator current={mStep} total={3} labels={MN_LABELS} />

      {mStep === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <MyntraZone
              label="Orders Report"
              required={true}
              file={ordersFile}
              onDrop={setOrdersFile}
              onRemove={() => setOrdersFile(null)}
            />
            <MyntraZone
              label="Returns Report"
              required={true}
              file={returnsFile}
              onDrop={setReturnsFile}
              onRemove={() => setReturnsFile(null)}
            />
            <MyntraZone
              label="Cancellations Report"
              required={true}
              file={cancellationsFile}
              onDrop={setCancellationsFile}
              onRemove={() => setCancellationsFile(null)}
            />
            <MyntraZone
              label="Return Delivery Report"
              required={false}
              file={returnDeliveryFile}
              onDrop={setReturnDeliveryFile}
              onRemove={() => setReturnDeliveryFile(null)}
            />
            <MyntraZone
              label="SPF Report"
              required={false}
              file={spfFile}
              onDrop={setSpfFile}
              onRemove={() => setSpfFile(null)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#0F172A] shrink-0">Report Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A]"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button
              onClick={() => setMStep(3)}
              disabled={!(ordersFile && returnsFile && cancellationsFile)}
              rightIcon={<ChevronRight size={16} />}
              fullWidth
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {mStep === 3 && (
        <div className="space-y-5">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl">
                <CheckCircle2 size={28} className="text-[#16A34A]" />
                <p className="font-semibold text-[#15803D]">Import complete</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    { label: 'Orders Imported', value: result.orders_inserted },
                    { label: 'Returns Inserted', value: result.returns_inserted },
                    { label: 'Cancellations', value: result.cancellations_inserted },
                    { label: 'Return Deliveries', value: result.return_deliveries_inserted },
                    { label: 'Matched', value: result.matched },
                    { label: 'Unmatched', value: result.unmatched },
                    { label: 'Total Revenue', value: `₹${result.total_revenue.toFixed(2)}` },
                    { label: 'Return Count', value: result.return_count },
                    { label: 'SPF Compensations', value: result.spf_count },
                  ] as { label: string; value: string | number }[]
                ).map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-center"
                  >
                    <p className="text-lg font-bold text-[#0F172A]">{stat.value}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={onCancel} fullWidth>
                  Close
                </Button>
                <Button onClick={onComplete} fullWidth>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-[#0F172A]">Import Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[#64748B]">Marketplace</span>
                    <p className="font-medium text-[#0F172A]">Myntra</p>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Month</span>
                    <p className="font-medium text-[#0F172A]">{month}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Files Selected</span>
                    <p className="font-medium text-[#0F172A]">{filesSelectedCount} file{filesSelectedCount !== 1 ? 's' : ''} ready</p>
                  </div>
                </div>
              </div>

              {importing && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#64748B]">
                    <span>Importing…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setMStep(2)}
                  disabled={importing}
                >
                  Back
                </Button>
                <Button
                  onClick={() => void handleImport()}
                  loading={importing}
                  disabled={importing}
                  fullWidth
                >
                  Import & Reconcile
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const ImportWizard: React.FC<ImportWizardProps> = ({ orgId, onComplete, onCancel }) => {
  const [step, setStep] = useState<GenericStep>(1)
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [reportType, setReportType] = useState<ReportType>('orders')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedPreview | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedData[]>([])
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<{ inserted: number; errors: string[] } | null>(
    null,
  )
  const [detectedMarketplace, setDetectedMarketplace] = useState<string | null>(null)

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const f = accepted[0]
      if (!f || !marketplace) return
      setFile(f)
      setParsing(true)
      setPreview(null)

      try {
        const rows = await parseMarketplaceFile(f, marketplace)
        setParsedRows(rows)

        const headers = rows.length > 0 ? Object.keys(rows[0]) : []
        const auto = detectMarketplace(headers)
        setDetectedMarketplace(auto)

        const validRows: ParsedData[] = []
        const errorRows: { rowIndex: number; messages: string[] }[] = []

        rows.forEach((row, idx) => {
          const result = validateRow(row, marketplace)
          if (result.valid) {
            validRows.push(row)
          } else {
            errorRows.push({ rowIndex: idx + 2, messages: result.errors })
          }
        })

        setPreview({
          rows,
          headers,
          validCount: validRows.length,
          invalidCount: errorRows.length,
          errors: errorRows,
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to parse file')
      } finally {
        setParsing(false)
      }
    },
    [marketplace],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: !marketplace || parsing,
  })

  function normalizeRows(rows: ParsedData[]): Partial<Order>[] {
    if (!marketplace) return []
    switch (marketplace) {
      case 'amazon':
        return rows.map(normalizeAmazonRow)
      case 'flipkart':
        return rows.map(normalizeFlipkartRow)
      case 'myntra':
        return rows.map(normalizeMyntraRow)
      case 'meesho':
        return rows.map(normalizeMeeshoRow)
    }
  }

  const handleImport = async () => {
    if (!file || !marketplace) return
    setImporting(true)
    setImportProgress(10)

    try {
      const progressTimer = setInterval(() => {
        setImportProgress((p) => Math.min(p + 15, 85))
      }, 400)

      const result = await reconService.importCSV(orgId, marketplace, reportType, file)

      clearInterval(progressTimer)
      setImportProgress(100)
      setImportResult(result)

      if (result.errors.length === 0) {
        toast.success(`${result.inserted} rows imported successfully`)
      } else {
        toast.success(`${result.inserted} rows imported (${result.errors.length} errors)`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
      setImportProgress(0)
    } finally {
      setImporting(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return marketplace !== null
    if (step === 2) return true
    if (step === 3) return file !== null && preview !== null && !parsing
    return true
  }

  const goNext = () => {
    if (step < 4) setStep((step + 1) as GenericStep)
  }

  const goBack = () => {
    if (step > 1) setStep((step - 1) as GenericStep)
  }

  const GENERIC_LABELS = [
    'Select Marketplace',
    'Select Report Type',
    'Upload File',
    'Confirm & Import',
  ]

  const isFlipkart = marketplace === 'flipkart'
  const isMyntra = marketplace === 'myntra'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-[#0F172A]">Import Marketplace Data</h2>
        <button onClick={onCancel} className="text-[#94A3B8] hover:text-[#64748B]">
          <X size={20} />
        </button>
      </div>

      {isFlipkart && step > 1 ? (
        <FlipkartWizard
          orgId={orgId}
          onComplete={onComplete}
          onCancel={onCancel}
          onBack={() => setStep(1)}
        />
      ) : isMyntra && step > 1 ? (
        <MyntraWizard
          orgId={orgId}
          onComplete={onComplete}
          onCancel={onCancel}
          onBack={() => setStep(1)}
        />
      ) : (
        <>
          <p className="text-sm text-[#64748B] mb-6">{GENERIC_LABELS[step - 1]}</p>
          <StepIndicator
            current={step}
            total={isMyntra || isFlipkart ? 3 : 4}
            labels={
              isMyntra || isFlipkart
                ? ['Select Marketplace', 'Upload Monthly Reports', 'Import & Reconcile']
                : GENERIC_LABELS
            }
          />

          {/* ── Step 1: Select Marketplace ──────────────────────────────── */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {MARKETPLACES.map((mp) => (
                <button
                  key={mp.id}
                  onClick={() => setMarketplace(mp.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    marketplace === mp.id
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${mp.color} flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-xs">{mp.label[0]}</span>
                  </div>
                  <span className="font-semibold text-[#0F172A]">{mp.label}</span>
                  {marketplace === mp.id && (
                    <CheckCircle2 size={18} className="ml-auto text-[#2563EB]" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Select Report Type ──────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-3">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setReportType(rt.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    reportType === rt.id
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <FileText
                    size={20}
                    className={reportType === rt.id ? 'text-[#2563EB]' : 'text-[#94A3B8]'}
                  />
                  <div>
                    <p className="font-semibold text-[#0F172A]">{rt.label}</p>
                    <p className="text-sm text-[#64748B]">{rt.desc}</p>
                  </div>
                  {reportType === rt.id && (
                    <CheckCircle2 size={18} className="ml-auto text-[#2563EB]" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── Step 3: Upload File ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-[#2563EB] bg-[#EFF6FF]'
                    : file
                    ? 'border-[#16A34A] bg-[#F0FDF4]'
                    : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB]'
                }`}
              >
                <input {...getInputProps()} />
                {parsing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="animate-spin text-[#2563EB]" />
                    <p className="text-sm text-[#64748B]">Parsing file…</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 size={32} className="text-[#16A34A]" />
                    <p className="font-medium text-[#0F172A]">{file.name}</p>
                    <p className="text-xs text-[#94A3B8]">{(file.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        setPreview(null)
                        setParsedRows([])
                      }}
                      className="text-xs text-[#DC2626] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={32} className="text-[#94A3B8]" />
                    <p className="font-medium text-[#0F172A]">
                      {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs text-[#94A3B8]">CSV, XLS, or XLSX — max 10 MB</p>
                  </div>
                )}
              </div>

              {detectedMarketplace && detectedMarketplace !== marketplace && (
                <div className="flex items-start gap-2 p-3 bg-[#FFFBEB] border border-[#FCD34D] rounded-lg text-sm">
                  <AlertTriangle size={16} className="text-[#D97706] shrink-0 mt-0.5" />
                  <span className="text-[#92400E]">
                    File looks like a{' '}
                    <span className="font-semibold capitalize">{detectedMarketplace}</span> report.
                    You selected{' '}
                    <span className="font-semibold capitalize">{marketplace}</span>.
                  </span>
                </div>
              )}

              {preview && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-[#16A34A]">{preview.validCount}</p>
                      <p className="text-xs text-[#166534]">Valid rows</p>
                    </div>
                    <div
                      className={`flex-1 rounded-lg p-3 text-center border ${
                        preview.invalidCount > 0
                          ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0]'
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold ${
                          preview.invalidCount > 0 ? 'text-[#DC2626]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {preview.invalidCount}
                      </p>
                      <p className="text-xs text-[#64748B]">Invalid rows</p>
                    </div>
                  </div>

                  <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                    <div className="bg-[#F8FAFC] px-3 py-2 border-b border-[#E2E8F0]">
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                        Detected Columns
                      </p>
                    </div>
                    <div className="p-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {preview.headers.slice(0, 20).map((h) => (
                        <span
                          key={h}
                          className="text-xs bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded-full"
                        >
                          {h}
                        </span>
                      ))}
                      {preview.headers.length > 20 && (
                        <span className="text-xs text-[#94A3B8]">
                          +{preview.headers.length - 20} more
                        </span>
                      )}
                    </div>
                  </div>

                  {preview.errors.length > 0 && (
                    <div className="border border-[#FCA5A5] rounded-lg overflow-hidden">
                      <div className="bg-[#FEF2F2] px-3 py-2 border-b border-[#FCA5A5]">
                        <p className="text-xs font-semibold text-[#991B1B]">
                          Error Rows (showing first 5)
                        </p>
                      </div>
                      <div className="divide-y divide-[#FEE2E2]">
                        {preview.errors.slice(0, 5).map((e) => (
                          <div key={e.rowIndex} className="px-3 py-2 flex items-start gap-2">
                            <span className="text-xs text-[#DC2626] font-medium shrink-0">
                              Row {e.rowIndex}
                            </span>
                            <span className="text-xs text-[#7F1D1D]">
                              {e.messages.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-[#E2E8F0] rounded-lg overflow-auto max-h-48">
                    <table className="w-full text-xs">
                      <thead className="bg-[#F8FAFC] sticky top-0">
                        <tr>
                          {preview.headers.slice(0, 6).map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left font-semibold text-[#64748B] whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 5).map((row, i) => {
                          const isInvalid = preview.errors.some((e) => e.rowIndex === i + 2)
                          return (
                            <tr
                              key={i}
                              className={isInvalid ? 'bg-[#FEF2F2]' : 'hover:bg-[#F8FAFC]'}
                            >
                              {preview.headers.slice(0, 6).map((h) => (
                                <td
                                  key={h}
                                  className="px-3 py-2 text-[#0F172A] whitespace-nowrap"
                                >
                                  {String(row[h] ?? '—').slice(0, 25)}
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Confirm & Import ────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              {importResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl">
                    <CheckCircle2 size={28} className="text-[#16A34A]" />
                    <div>
                      <p className="font-semibold text-[#15803D]">
                        {importResult.inserted} rows imported successfully
                      </p>
                      {importResult.errors.length > 0 && (
                        <p className="text-sm text-[#166534] mt-0.5">
                          {importResult.errors.length} rows skipped due to errors
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={onCancel} fullWidth>
                      Close
                    </Button>
                    <Button onClick={onComplete} fullWidth>
                      Run Reconciliation
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                    <h3 className="font-semibold text-[#0F172A]">Import Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-[#64748B]">Marketplace</span>
                        <p className="font-medium text-[#0F172A] capitalize">{marketplace}</p>
                      </div>
                      <div>
                        <span className="text-[#64748B]">Report Type</span>
                        <p className="font-medium text-[#0F172A] capitalize">{reportType}</p>
                      </div>
                      <div>
                        <span className="text-[#64748B]">File</span>
                        <p className="font-medium text-[#0F172A] truncate">{file?.name}</p>
                      </div>
                      <div>
                        <span className="text-[#64748B]">Rows to Import</span>
                        <p className="font-medium text-[#16A34A]">
                          {preview?.validCount ?? 0} valid rows
                        </p>
                      </div>
                    </div>

                    {marketplace && preview && (
                      <div>
                        <p className="text-xs text-[#94A3B8] mb-1.5">Mapped Fields Preview</p>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {normalizeRows(parsedRows.slice(0, 1)).map((row, _) =>
                            Object.entries(row)
                              .filter(([, v]) => v !== null && v !== undefined)
                              .slice(0, 6)
                              .map(([k, v]) => (
                                <div key={k} className="flex gap-1">
                                  <span className="text-[#94A3B8]">{k}:</span>
                                  <span className="text-[#0F172A] truncate">{String(v)}</span>
                                </div>
                              )),
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {importing && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-[#64748B]">
                        <span>Importing…</span>
                        <span>{importProgress}%</span>
                      </div>
                      <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={goBack} disabled={importing}>
                      Back
                    </Button>
                    <Button
                      onClick={() => void handleImport()}
                      loading={importing}
                      disabled={importing || !preview || preview.validCount === 0}
                      fullWidth
                    >
                      Import {preview?.validCount ?? 0} Rows
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ─────────────────────────────────────────────── */}
          {step < 4 && (
            <div className="flex gap-3 mt-8">
              {step > 1 ? (
                <Button variant="ghost" onClick={goBack}>
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={goNext}
                disabled={!canProceed()}
                rightIcon={<ChevronRight size={16} />}
                fullWidth
              >
                {step === 3 ? 'Review & Import' : 'Continue'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ImportWizard
