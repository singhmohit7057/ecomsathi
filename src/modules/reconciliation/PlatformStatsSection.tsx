// ============================================================
// EcomSathi — Platform Stats Section
// Per-platform order analytics for the reconciliation dashboard
// ============================================================

import React, { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Truck,
  IndianRupee,
  AlertCircle,
  RefreshCw,
  PackageOpen,
} from 'lucide-react'
import { Badge } from '@/components/common'
import { getPlatformStats } from '@/services/reconciliationService'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformStatsSectionProps {
  orgId: string
  dateFrom: string // 'YYYY-MM-DD'
  dateTo: string   // 'YYYY-MM-DD'
}

interface OrderDetail {
  order_id: string
  order_date: string | null
  status: string
  sku: string | null
  total_amount: number
  settlement_amount: number | null
  marketplace_fee: number | null
  gst_amount: number | null
  shipping_amount: number | null
  sale_amount: number | null
  my_share: number | null
  commission: number | null
  commission_rate: number | null
  tcs: number | null
  tds: number | null
  gst_on_mp_fees: number | null
  reverse_shipping_fee: number | null
  return_type: string | null
  return_reason: string | null
  item_return_status: string | null
  final_amount: number | null
  discount: number | null
  coupon_discount: number | null
  cancellation_reason: string | null
}

interface PlatformStats {
  marketplace: string
  total_orders: number
  delivered: number
  cancelled: number
  returned: number
  rto: number
  total_revenue: number
  total_settlement: number
  total_fees: number
  total_tcs: number
  total_tds: number
  total_gst_on_fees: number
  total_reverse_shipping: number
  total_discounts: number
  net_payable: number
  return_reasons: { reason: string; count: number }[]
  orders: OrderDetail[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inr(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return dateStr
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function orderStatusVariant(
  status: string,
): 'success' | 'error' | 'warning' | 'default' {
  const s = status.toLowerCase()
  if (s === 'delivered') return 'success'
  if (s === 'cancelled') return 'error'
  if (s.startsWith('return')) return 'warning'
  if (s === 'rto') return 'default'
  return 'default'
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-[#F1F5F9] rounded animate-pulse ${className}`} />
)

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Tab bar skeleton */}
    <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit">
      {[1, 2, 3].map((i) => (
        <SkeletonBlock key={i} className="w-20 h-8" />
      ))}
    </div>
    {/* Summary cards skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonBlock key={i} className="h-24" />
      ))}
    </div>
    {/* Financial row skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonBlock key={i} className="h-16" />
      ))}
    </div>
    {/* Table skeleton */}
    <SkeletonBlock className="h-64" />
  </div>
)

// ─── Summary Stat Card ────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
  subtext?: string
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon,
  iconBg,
  subtext,
}) => (
  <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-[#1E293B_2px_2px_0px_0px]">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-[#64748B] font-medium leading-tight">{label}</p>
        <p className="text-xl font-bold text-[#0F172A] mt-1 truncate">{value}</p>
        {subtext && (
          <p className="text-xs text-[#94A3B8] mt-0.5">{subtext}</p>
        )}
      </div>
      <div className={`p-2 rounded-lg flex-shrink-0 ${iconBg}`}>{icon}</div>
    </div>
  </div>
)

// ─── Financial Mini Card ──────────────────────────────────────────────────────

interface FinancialCardProps {
  label: string
  value: number
}

const FinancialCard: React.FC<FinancialCardProps> = ({ label, value }) => (
  <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-[#1E293B_2px_2px_0px_0px]">
    <p className="text-xs text-[#64748B] font-medium">{label}</p>
    <p className="text-sm font-semibold text-[#0F172A] mt-0.5">
      ₹{inr(value)}
    </p>
  </div>
)

// ─── Return Reasons Chart (CSS only) ─────────────────────────────────────────

interface ReturnReasonsChartProps {
  reasons: { reason: string; count: number }[]
}

// Convert raw Flipkart reason codes to readable labels
function formatReturnReason(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bObd\b/, 'OBD')
    .replace(/\bRto\b/, 'RTO')
}

const ReturnReasonsChart: React.FC<ReturnReasonsChartProps> = ({ reasons }) => {
  const top = reasons.slice(0, 8)
  const maxCount = Math.max(...top.map((r) => r.count), 1)

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-[#1E293B_2px_2px_0px_0px]">
      <h4 className="text-sm font-semibold text-[#0F172A] mb-3">Return Reasons</h4>
      <div className="space-y-2.5">
        {top.map((r) => {
          const pct = Math.round((r.count / maxCount) * 100)
          const label = formatReturnReason(r.reason)
          return (
            <div key={r.reason} className="flex items-center gap-3">
              <span
                className="text-xs text-[#64748B] flex-shrink-0 w-48"
                title={r.reason}
              >
                {label}
              </span>
              <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D97706] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[#D97706] flex-shrink-0 w-6 text-right">
                {r.count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Per-Order Table ──────────────────────────────────────────────────────────

interface OrdersTableProps {
  orders: OrderDetail[]
}

const PlatformOrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
      {/* Table header */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-2">
        <h4 className="text-sm font-semibold text-[#0F172A]">Orders</h4>
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#F1F5F9] text-xs font-medium text-[#64748B]">
          {orders.length}
        </span>
      </div>

      {/* Scrollable table body */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        <table className="w-full text-xs min-w-[900px]">
          <thead
            className="bg-[#F8FAFC] border-b border-[#E2E8F0]"
            style={{ position: 'sticky', top: 0, zIndex: 1 }}
          >
            <tr>
              {[
                'Order ID',
                'Date',
                'SKU',
                'Status',
                'Sale Amt',
                'My Share',
                'Commission',
                'TCS',
                'TDS',
                'Return Reason',
              ].map((col) => (
                <th
                  key={col}
                  className="px-3 py-2.5 text-left font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const myShare = order.my_share ?? order.settlement_amount
              const commission = order.marketplace_fee ?? order.commission
              const returnReason = order.return_reason ?? order.cancellation_reason
              const bgClass = idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'

              return (
                <tr
                  key={`${order.order_id}-${idx}`}
                  className={`${bgClass} border-b border-[#F1F5F9] transition-colors hover:bg-[#EFF6FF]`}
                >
                  {/* Order ID */}
                  <td className="px-3 py-2.5">
                    <span
                      className="font-mono text-xs text-[#0F172A] cursor-pointer hover:text-[#2563EB]"
                      title={`Click to copy: ${order.order_id}`}
                      onClick={() => void navigator.clipboard.writeText(order.order_id)}
                    >
                      {order.order_id}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-3 py-2.5 text-[#64748B] whitespace-nowrap">
                    {formatDate(order.order_date)}
                  </td>
                  {/* SKU */}
                  <td className="px-3 py-2.5 text-[#64748B] font-mono">
                    {order.sku ?? '—'}
                  </td>
                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <Badge variant={orderStatusVariant(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </td>
                  {/* Sale Amt */}
                  <td className="px-3 py-2.5 text-right text-[#0F172A] font-medium whitespace-nowrap">
                    {order.sale_amount != null
                      ? `₹${inr(order.sale_amount)}`
                      : order.total_amount != null
                      ? `₹${inr(order.total_amount)}`
                      : '—'}
                  </td>
                  {/* My Share */}
                  <td className="px-3 py-2.5 text-right text-[#16A34A] font-medium whitespace-nowrap">
                    {myShare != null ? `₹${inr(myShare)}` : '—'}
                  </td>
                  {/* Commission */}
                  <td className="px-3 py-2.5 text-right text-[#64748B] whitespace-nowrap">
                    {commission != null ? `₹${inr(commission)}` : '—'}
                  </td>
                  {/* TCS */}
                  <td className="px-3 py-2.5 text-right text-[#64748B] whitespace-nowrap">
                    {order.tcs != null ? `₹${inr(order.tcs)}` : '—'}
                  </td>
                  {/* TDS */}
                  <td className="px-3 py-2.5 text-right text-[#64748B] whitespace-nowrap">
                    {order.tds != null ? `₹${inr(order.tds)}` : '—'}
                  </td>
                  {/* Return Reason */}
                  <td className="px-3 py-2.5 text-[#94A3B8]">
                    {returnReason ? (
                      <span title={returnReason} className="whitespace-nowrap">
                        {formatReturnReason(returnReason)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Platform Panel (single platform's full content) ─────────────────────────

interface PlatformPanelProps {
  stats: PlatformStats
}

const PlatformPanel: React.FC<PlatformPanelProps> = ({ stats }) => {
  const deliveredPct =
    stats.total_orders > 0
      ? Math.round((stats.delivered / stats.total_orders) * 100)
      : 0

  return (
    <div className="space-y-4 mt-4">
      {/* 1. Summary strip — 2×3 grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Total Orders"
          value={stats.total_orders.toLocaleString('en-IN')}
          icon={<ShoppingCart size={18} className="text-[#2563EB]" />}
          iconBg="bg-[#EFF6FF]"
        />
        <SummaryCard
          label="Delivered"
          value={stats.delivered.toLocaleString('en-IN')}
          icon={<CheckCircle2 size={18} className="text-[#16A34A]" />}
          iconBg="bg-[#F0FDF4]"
          subtext={`${deliveredPct}% of total`}
        />
        <SummaryCard
          label="Returns"
          value={stats.returned.toLocaleString('en-IN')}
          icon={<RotateCcw size={18} className="text-[#D97706]" />}
          iconBg="bg-[#FFFBEB]"
        />
        <SummaryCard
          label="Cancelled"
          value={stats.cancelled.toLocaleString('en-IN')}
          icon={<XCircle size={18} className="text-[#DC2626]" />}
          iconBg="bg-[#FEF2F2]"
        />
        <SummaryCard
          label="RTO"
          value={stats.rto.toLocaleString('en-IN')}
          icon={<Truck size={18} className="text-[#94A3B8]" />}
          iconBg="bg-[#F8FAFC]"
        />
        <SummaryCard
          label="Net Payable"
          value={`₹${inr(stats.net_payable)}`}
          icon={<IndianRupee size={18} className="text-[#16A34A]" />}
          iconBg="bg-[#F0FDF4]"
        />
      </div>

      {/* 2. Financial breakdown — 4 smaller cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FinancialCard label="Total Revenue" value={stats.total_revenue} />
        <FinancialCard label="Total Fees" value={stats.total_fees} />
        <FinancialCard
          label="TCS + TDS"
          value={stats.total_tcs + stats.total_tds}
        />
        <FinancialCard label="Discounts" value={stats.total_discounts} />
      </div>

      {/* 3. Return Reasons (only if returns > 0) */}
      {stats.returned > 0 && stats.return_reasons.length > 0 && (
        <ReturnReasonsChart reasons={stats.return_reasons} />
      )}

      {/* 4. Per-order table */}
      {stats.orders.length > 0 ? (
        <PlatformOrdersTable orders={stats.orders} />
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center shadow-[#1E293B_2px_2px_0px_0px]">
          <PackageOpen size={32} className="mx-auto mb-2 text-[#CBD5E1]" />
          <p className="text-sm text-[#94A3B8]">No orders found for this period</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PlatformStatsSection: React.FC<PlatformStatsSectionProps> = ({
  orgId,
  dateFrom,
  dateTo,
}) => {
  const [platforms, setPlatforms] = useState<PlatformStats[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getPlatformStats(orgId, dateFrom, dateTo)
      setPlatforms(result.platforms)
      if (result.platforms.length > 0) {
        setActiveTab((prev) =>
          result.platforms.some((p) => p.marketplace === prev)
            ? prev
            : result.platforms[0].marketplace,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platform stats')
    } finally {
      setLoading(false)
    }
  }, [orgId, dateFrom, dateTo])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[#1E293B_2px_2px_0px_0px]">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Stats</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Platform-wise order analytics
          </p>
        </div>
        <button
          onClick={() => void fetchStats()}
          disabled={loading}
          className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] disabled:opacity-40 transition-colors"
          title="Refresh"
          aria-label="Refresh platform stats"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 text-[#DC2626] text-sm py-4">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Empty — no platforms at all */}
      {!loading && !error && platforms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <PackageOpen size={36} className="text-[#CBD5E1] mb-3" />
          <p className="text-sm font-medium text-[#0F172A]">
            Import reports to see platform stats
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            No data imported for this period
          </p>
        </div>
      )}

      {/* Platform tabs + content */}
      {!loading && !error && platforms.length > 0 && (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit overflow-x-auto">
            {platforms.map((p) => (
              <button
                key={p.marketplace}
                onClick={() => setActiveTab(p.marketplace)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === p.marketplace
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {capitalize(p.marketplace)}
              </button>
            ))}
          </div>

          {/* Active platform panel */}
          {platforms
            .filter((p) => p.marketplace === activeTab)
            .map((p) => (
              <PlatformPanel key={p.marketplace} stats={p} />
            ))}
        </>
      )}
    </div>
  )
}

export default PlatformStatsSection
