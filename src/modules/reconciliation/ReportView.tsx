// ============================================================
// EcomSathi — Reconciliation Report Detail View
// ============================================================

import React, { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Percent,
} from 'lucide-react'
import { Button, Badge } from '@/components/common'
import * as reconService from '@/services/reconciliationService'
import type { ReconciliationReportData } from '@/services/reconciliationService'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportViewProps {
  reportId: string
  orgId: string
  onBack: () => void
}

type ReportDetail = Awaited<ReturnType<typeof reconService.getReport>>

// ─── Stats Card ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string
  value: string
  icon: React.ReactNode
  color: string
  sub?: string
}> = ({ label, value, icon, color, sub }) => (
  <div className={`rounded-xl border p-4 ${color}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium opacity-70">{label}</span>
      {icon}
    </div>
    <p className="text-xl font-bold">{value}</p>
    {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
  </div>
)

// ─── Main Report View ─────────────────────────────────────────────────────────

const ReportView: React.FC<ReportViewProps> = ({ reportId, orgId: _orgId, onBack }) => {
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingCsv, setExportingCsv] = useState(false)
  const [exportingXlsx, setExportingXlsx] = useState(false)
  const [activeSection, setActiveSection] = useState<
    'matched' | 'unmatched' | 'fees' | 'gst'
  >('matched')

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true)
      const data = await reconService.getReport(reportId)
      setReport(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }, [reportId])

  useEffect(() => {
    void fetchReport()
  }, [fetchReport])

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const setLoading2 = format === 'csv' ? setExportingCsv : setExportingXlsx
    setLoading2(true)
    try {
      const blob = await reconService.exportReport(reportId, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reconciliation-report-${reportId.slice(0, 8)}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setLoading2(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-[#F1F5F9] rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#F1F5F9] rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-[#F1F5F9] rounded-xl" />
      </div>
    )
  }

  if (!report) return null

  const rd: ReconciliationReportData = report.reportData
  const matchRate =
    rd.matched + rd.unmatched_orders > 0
      ? Math.round((rd.matched / (rd.matched + rd.unmatched_orders)) * 100)
      : 0

  const matchedDetails = rd.details.filter((d) => d.settlement_id !== null)
  const unmatchedDetails = rd.details.filter((d) => d.settlement_id === null)

  // Fee audit: group by category (simplistic: one row per order)
  const feeAuditRows = matchedDetails.slice(0, 50).map((d) => ({
    orderId: d.order_id,
    orderAmount: d.order_amount,
    settlementAmount: d.settlement_amount ?? 0,
    impliedFee: d.order_amount - (d.settlement_amount ?? d.order_amount),
    expectedFee: d.order_amount * 0.02,
  }))

  // GST validation: 18% on fee
  const gstRows = matchedDetails.slice(0, 50).map((d) => {
    const fee = d.order_amount - (d.settlement_amount ?? d.order_amount)
    const expectedGst = fee * 0.18
    return {
      orderId: d.order_id,
      fee,
      expectedGst,
      status: fee > 0 && expectedGst > 0 ? 'ok' : 'no_fee',
    }
  })

  const SECTIONS: { key: typeof activeSection; label: string }[] = [
    { key: 'matched', label: `Matched (${matchedDetails.length})` },
    { key: 'unmatched', label: `Unmatched (${unmatchedDetails.length})` },
    { key: 'fees', label: 'Fee Audit' },
    { key: 'gst', label: 'GST Validation' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] text-sm"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <div className="sm:ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            loading={exportingCsv}
            leftIcon={<Download size={14} />}
            onClick={() => void handleExport('csv')}
          >
            CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            loading={exportingXlsx}
            leftIcon={<FileText size={14} />}
            onClick={() => void handleExport('xlsx')}
          >
            Excel
          </Button>
        </div>
      </div>

      {/* Report meta */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] capitalize">
          {report.marketplace_id} Reconciliation Report
        </h2>
        <p className="text-sm text-[#64748B] mt-0.5">
          {report.date_from} – {report.date_to} &bull;{' '}
          <Badge
            variant={
              report.status === 'completed'
                ? 'success'
                : report.status === 'failed'
                ? 'error'
                : 'warning'
            }
            size="sm"
          >
            {report.status}
          </Badge>
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={(rd.matched + rd.unmatched_orders).toLocaleString('en-IN')}
          icon={<FileText size={16} />}
          color="bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A5F]"
        />
        <StatCard
          label="Match Rate"
          value={`${matchRate}%`}
          icon={<Percent size={16} />}
          color="bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D]"
          sub={`${rd.matched} of ${rd.matched + rd.unmatched_orders} matched`}
        />
        <StatCard
          label="Discrepancy"
          value={`₹${rd.discrepancy.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={<TrendingDown size={16} />}
          color="bg-[#FFFBEB] border-[#FDE68A] text-[#78350F]"
          sub="Order vs settlement delta"
        />
        <StatCard
          label="Fees Paid"
          value={`₹${(rd.total_orders_amount - rd.total_settlements_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={16} />}
          color="bg-[#FDF4FF] border-[#E9D5FF] text-[#4C1D95]"
          sub="Implied from settlement delta"
        />
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit overflow-x-auto">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === s.key
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Matched pairs table */}
      {activeSection === 'matched' && (
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Settlement ID</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Order Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Settled</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Delta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {matchedDetails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                      No matched pairs
                    </td>
                  </tr>
                ) : (
                  matchedDetails.slice(0, 100).map((d) => {
                    const delta = d.order_amount - (d.settlement_amount ?? 0)
                    return (
                      <tr key={d.order_id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-2.5 font-mono text-xs text-[#0F172A]">{d.order_id}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-[#64748B]">
                          {d.settlement_id}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[#0F172A]">
                          ₹{d.order_amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[#16A34A]">
                          ₹{(d.settlement_amount ?? 0).toFixed(2)}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-medium ${
                            Math.abs(delta) < 0.5 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                          }`}
                        >
                          {delta >= 0 ? '+' : ''}₹{delta.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant={
                              d.status === 'matched'
                                ? 'success'
                                : d.status === 'excess_payment'
                                ? 'info'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {d.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unmatched orders */}
      {activeSection === 'unmatched' && (
        <div className="space-y-3">
          {unmatchedDetails.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl">
              <CheckCircle2 size={20} className="text-[#16A34A]" />
              <span className="text-[#15803D] font-medium">All orders are matched!</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl">
                <XCircle size={16} className="text-[#DC2626]" />
                <span className="text-sm text-[#991B1B]">
                  {unmatchedDetails.length} orders have no matching settlement
                </span>
              </div>

              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Order ID</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Order Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unmatchedDetails.slice(0, 100).map((d) => (
                      <tr key={d.order_id} className="border-b border-[#F1F5F9] hover:bg-[#FEF2F2]/40">
                        <td className="px-4 py-2.5 font-mono text-xs text-[#0F172A]">
                          {d.order_id}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[#DC2626] font-medium">
                          ₹{d.order_amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                toast('Investigation tools coming in next update', { icon: 'ℹ️' })
                              }
                              className="text-xs text-[#2563EB] hover:underline"
                            >
                              Investigate
                            </button>
                            <button
                              onClick={() =>
                                toast('Dispute raised (demo)', { icon: '⚠️' })
                              }
                              className="text-xs text-[#D97706] hover:underline"
                            >
                              Raise Dispute
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Fee audit */}
      {activeSection === 'fees' && (
        <div className="space-y-3">
          <p className="text-sm text-[#64748B]">
            Comparing implied fees (order amount - settlement) with expected 2% platform fee estimate.
          </p>
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Order ID</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Order Amt</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Settlement</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Implied Fee</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Expected (2%)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Diff</th>
                </tr>
              </thead>
              <tbody>
                {feeAuditRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#94A3B8]">No data</td>
                  </tr>
                ) : (
                  feeAuditRows.map((r) => {
                    const diff = r.impliedFee - r.expectedFee
                    const flagged = Math.abs(diff) > 10
                    return (
                      <tr
                        key={r.orderId}
                        className={`border-b border-[#F1F5F9] ${flagged ? 'bg-[#FFFBEB]' : 'hover:bg-[#F8FAFC]'}`}
                      >
                        <td className="px-4 py-2.5 font-mono text-xs">{r.orderId}</td>
                        <td className="px-4 py-2.5 text-right">₹{r.orderAmount.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right text-[#16A34A]">
                          ₹{r.settlementAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[#64748B]">
                          ₹{r.impliedFee.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[#94A3B8]">
                          ₹{r.expectedFee.toFixed(2)}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-medium ${flagged ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
                          {flagged && <AlertTriangle size={12} className="inline mr-1" />}
                          {diff >= 0 ? '+' : ''}₹{diff.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GST validation */}
      {activeSection === 'gst' && (
        <div className="space-y-3">
          <p className="text-sm text-[#64748B]">
            Estimated GST at 18% on marketplace fee.
          </p>
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Order ID</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Implied Fee</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Expected GST (18%)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Validation</th>
                </tr>
              </thead>
              <tbody>
                {gstRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[#94A3B8]">No data</td>
                  </tr>
                ) : (
                  gstRows.map((r) => (
                    <tr key={r.orderId} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="px-4 py-2.5 font-mono text-xs">{r.orderId}</td>
                      <td className="px-4 py-2.5 text-right">₹{r.fee.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right text-[#64748B]">
                        ₹{r.expectedGst.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.status === 'ok' ? (
                          <span className="flex items-center gap-1 text-[#16A34A] text-xs">
                            <CheckCircle2 size={12} />
                            Estimated OK
                          </span>
                        ) : (
                          <span className="text-[#94A3B8] text-xs">No fee to validate</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportView
