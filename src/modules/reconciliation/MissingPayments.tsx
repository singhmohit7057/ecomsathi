// ============================================================
// EcomSathi — Missing Payment Detection
// ============================================================

import React, { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Download, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { Button, Badge } from '@/components/common'
import * as reconService from '@/services/reconciliationService'
import type { Order } from '@/types'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MissingPaymentsProps {
  orgId: string
}

type CutoffDays = 15 | 30 | 45
type MarketplaceFilter = 'all' | 'amazon' | 'flipkart' | 'myntra' | 'meesho'

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 0
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function urgencyVariant(days: number): 'error' | 'warning' | 'default' {
  if (days >= 45) return 'error'
  if (days >= 30) return 'warning'
  return 'default'
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MissingPayments: React.FC<MissingPaymentsProps> = ({ orgId }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cutoff, setCutoff] = useState<CutoffDays>(15)
  const [marketplace, setMarketplace] = useState<MarketplaceFilter>('all')
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
  const [exporting, setExporting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchMissing = useCallback(async () => {
    try {
      setLoading(true)
      const data = await reconService.detectMissingPayments(
        orgId,
        marketplace !== 'all' ? marketplace : '',
      )
      setOrders(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to detect missing payments')
    } finally {
      setLoading(false)
    }
  }, [orgId, marketplace, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetchMissing()
  }, [fetchMissing])

  // Filter by cutoff and exclude resolved
  const filtered = orders.filter((o) => {
    if (resolvedIds.has(o.id)) return false
    const days = daysSince(o.order_date)
    return days >= cutoff
  })

  const totalExpectedAmount = filtered.reduce((s, o) => s + (o.total_amount ?? 0), 0)

  const handleMarkResolved = (orderId: string) => {
    setResolvedIds((prev) => new Set([...prev, orderId]))
    toast.success('Marked as resolved')
  }

  const handleRaiseDispute = (order: Order) => {
    toast(`Dispute raised for order ${order.order_id} (demo)`, { icon: '⚠️' })
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const headers = [
        'Order ID',
        'Marketplace',
        'Order Date',
        'Days Pending',
        'Expected Amount',
        'Status',
      ]
      const rows = filtered.map((o) => [
        o.order_id,
        o.marketplace_id,
        o.order_date ?? '',
        String(daysSince(o.order_date)),
        (o.total_amount ?? 0).toFixed(2),
        o.status,
      ])
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `missing-payments-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${filtered.length} orders exported`)
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const CUTOFF_OPTIONS: { value: CutoffDays; label: string }[] = [
    { value: 15, label: '15 days' },
    { value: 30, label: '30 days' },
    { value: 45, label: '45 days' },
  ]

  const MARKETPLACE_TABS: { key: MarketplaceFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'amazon', label: 'Amazon' },
    { key: 'flipkart', label: 'Flipkart' },
    { key: 'myntra', label: 'Myntra' },
    { key: 'meesho', label: 'Meesho' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">Missing Payments</h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Orders shipped but not yet settled
          </p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B]"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          {filtered.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              loading={exporting}
              leftIcon={<Download size={14} />}
              onClick={() => void handleExport()}
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Cutoff selector */}
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#64748B]" />
          <span className="text-sm text-[#64748B]">Pending more than:</span>
          <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-0.5">
            {CUTOFF_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setCutoff(o.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  cutoff === o.value
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Marketplace tabs */}
        <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-0.5">
          {MARKETPLACE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setMarketplace(t.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                marketplace === t.key
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-[#FFFBEB] border border-[#FCD34D] rounded-xl">
          <AlertTriangle size={20} className="text-[#D97706] shrink-0" />
          <div>
            <p className="font-semibold text-[#92400E]">
              {filtered.length} orders pending settlement
            </p>
            <p className="text-sm text-[#B45309]">
              Total expected: ₹
              {totalExpectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Marketplace</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Ship Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Days Pending</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Expected Amt</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-[#F1F5F9]">
                      {Array(6)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                          </td>
                        ))}
                    </tr>
                  ))}
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-[#16A34A] opacity-60" />
                    <p className="text-sm text-[#64748B]">
                      No missing payments for {cutoff}+ day window
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const days = daysSince(order.order_date)
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs text-[#0F172A]">
                          {order.order_id}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="capitalize text-[#64748B] text-sm">
                          {order.marketplace_id}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#64748B]">
                        {order.order_date
                          ? new Date(order.order_date).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant={urgencyVariant(days)} size="sm">
                          {days}d
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-[#D97706]">
                        ₹{(order.total_amount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMarkResolved(order.id)}
                            className="flex items-center gap-1 text-xs text-[#16A34A] hover:underline"
                          >
                            <CheckCircle2 size={12} />
                            Resolved
                          </button>
                          <button
                            onClick={() => handleRaiseDispute(order)}
                            className="text-xs text-[#D97706] hover:underline"
                          >
                            Dispute
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-[#94A3B8]">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#FCA5A5] mr-1" />
          45+ days (critical)
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#FCD34D] mr-1" />
          30-44 days (warning)
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#E2E8F0] mr-1" />
          15-29 days
        </span>
      </div>
    </div>
  )
}

export default MissingPayments
