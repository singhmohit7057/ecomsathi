// ============================================================
// EcomSathi — Reconciliation Dashboard
// ============================================================

import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Calendar,
  Trash2,
} from 'lucide-react'
import { Button, Badge } from '@/components/common'
import { supabase } from '@/supabase/client'
import * as reconService from '@/services/reconciliationService'
import type { ReconciliationReportData } from '@/services/reconciliationService'
import PlatformStatsSection from './PlatformStatsSection'

// ─── Types ────────────────────────────────────────────────────────────────────

type MarketplaceTab = 'all' | 'amazon' | 'flipkart' | 'myntra' | 'meesho'

interface DashboardProps {
  orgId: string
  onNewImport: () => void
  onViewReport: (reportId: string) => void
}

// ─── Monthly Bar Chart (CSS only) ─────────────────────────────────────────────

interface MonthBar {
  month: string
  matched: number
  unmatched: number
  total: number
}

const MonthlyChart: React.FC<{ data: MonthBar[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-[#94A3B8] text-sm">
        No data available
      </div>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1)

  return (
    <div className="flex items-end gap-2 h-36 pt-2">
      {data.map((bar) => {
        const totalHeight = Math.round((bar.total / maxTotal) * 100)
        const matchedPct = bar.total > 0 ? Math.round((bar.matched / bar.total) * 100) : 0
        const unmatchedPct = 100 - matchedPct

        return (
          <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end" style={{ height: '7rem' }}>
              <div
                className="w-full rounded-t overflow-hidden"
                style={{ height: `${totalHeight}%` }}
                title={`Matched: ${bar.matched} / Total: ${bar.total}`}
              >
                <div
                  className="w-full bg-[#2563EB]"
                  style={{ height: `${matchedPct}%` }}
                />
                <div
                  className="w-full bg-[#FCA5A5]"
                  style={{ height: `${unmatchedPct}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-[#94A3B8] truncate w-full text-center">
              {bar.month}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const ReconciliationDashboard: React.FC<DashboardProps> = ({
  orgId,
  onNewImport,
  onViewReport,
}) => {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('all')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [reports, setReports] = useState<Awaited<ReturnType<typeof reconService.getReports>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [quickStats, setQuickStats] = useState({
    total: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    revenue: 0,
    fees: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  const [clearing, setClearing] = useState(false)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await reconService.getReports(orgId)
      setReports(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  const clearAllData = useCallback(async () => {
    if (!window.confirm('This will delete ALL imported orders, settlements and reports for your account. This cannot be undone. Continue?')) return
    setClearing(true)
    try {
      await Promise.all([
        supabase.from('orders').delete().eq('org_id', orgId),
        supabase.from('settlements').delete().eq('org_id', orgId),
        supabase.from('reconciliation_reports').delete().eq('org_id', orgId),
      ])
      setReports([])
      setQuickStats({ total: 0, delivered: 0, cancelled: 0, returned: 0, revenue: 0, fees: 0 })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Clear failed')
    } finally {
      setClearing(false)
    }
  }, [orgId])

  useEffect(() => {
    void fetchReports()
  }, [fetchReports])

  // ── Quick stats — filtered by activeTab + date range ─────────────────────
  useEffect(() => {
    if (!orgId) return
    void (async () => {
      setStatsLoading(true)
      try {
        let query = supabase
          .from('orders')
          .select('status, total_amount, marketplace_fee, raw_data')
          .eq('org_id', orgId)
          .gte('order_date', dateFrom)
          .lte('order_date', dateTo)

        const { data } = await query

        if (data) {
          const rows =
            activeTab === 'all'
              ? data
              : data.filter(
                  (row) => (row.raw_data as any)?._marketplace === activeTab,
                )

          const total = rows.length
          const isReturn = (s: string | null) => {
            const v = (s ?? '').toLowerCase()
            return v === 'return' || v === 'returned' || v === 'return_requested' || v.startsWith('return_') || v.startsWith('return ') || v === 'rto' || v.includes('rto')
          }
          const isCancel = (s: string | null) => {
            const v = (s ?? '').toLowerCase()
            return v === 'cancelled' || v === 'canceled' || v === 'failed' || v === 'f' || v.includes('cancel')
          }
          const delivered = rows.filter(
            (r) => !isReturn(r.status) && !isCancel(r.status)
          ).length
          const cancelled = rows.filter((r) => isCancel(r.status)).length
          const returned = rows.filter((r) => isReturn(r.status)).length
          const revenue = rows.reduce((s, r) => s + (r.total_amount ?? 0), 0)
          const fees = rows.reduce((s, r) => s + (r.marketplace_fee ?? 0), 0)
          setQuickStats({ total, delivered, cancelled, returned, revenue, fees })
        }
      } catch { /* silent */ } finally {
        setStatsLoading(false)
      }
    })()
  }, [orgId, activeTab, dateFrom, dateTo])

  // ── Aggregate stats from reports ──────────────────────────────────────────
  const filteredReports = reports.filter((r) => {
    const tabMatch =
      activeTab === 'all' || r.marketplace_id?.toLowerCase() === activeTab
    const dateMatch = r.date_from >= dateFrom && r.date_to <= dateTo
    return tabMatch && dateMatch
  })

  const totalOrders = filteredReports.reduce((s, r) => s + (r.total_orders ?? 0), 0)
  const matchedOrders = filteredReports.reduce(
    (s, r) =>
      s + ((r as unknown as Record<string, number>)['matched_orders'] ??
           (r as unknown as Record<string, number>)['matched_count'] ?? 0),
    0,
  )
  const unmatchedOrders = filteredReports.reduce(
    (s, r) =>
      s + ((r as unknown as Record<string, number>)['unmatched_orders'] ??
           (r as unknown as Record<string, number>)['unmatched_count'] ?? 0),
    0,
  )

  const discrepancyAmount = filteredReports.reduce((s, r) => {
    const rd = r.report_data as unknown as ReconciliationReportData | null
    return s + (rd?.discrepancy ?? 0)
  }, 0)

  // ── Build monthly chart data ───────────────────────────────────────────────
  const monthlyMap = new Map<string, MonthBar>()
  for (const r of filteredReports) {
    const month = r.date_from?.slice(0, 7) ?? ''
    if (!month) continue
    const label = new Date(month + '-01').toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    })
    const existing = monthlyMap.get(month) ?? {
      month: label,
      matched: 0,
      unmatched: 0,
      total: 0,
    }
    const rr = r as unknown as Record<string, number>
    existing.matched += rr['matched_orders'] ?? rr['matched_count'] ?? 0
    existing.unmatched += rr['unmatched_orders'] ?? rr['unmatched_count'] ?? 0
    existing.total += r.total_orders ?? 0
    monthlyMap.set(month, existing)
  }

  const chartData = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .slice(-6)

  const MARKETPLACE_TABS: { key: MarketplaceTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'amazon', label: 'Amazon' },
    { key: 'flipkart', label: 'Flipkart' },
    { key: 'myntra', label: 'Myntra' },
    { key: 'meesho', label: 'Meesho' },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Reconciliation</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Match marketplace orders with settlement reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchReports()}
            className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B]"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => void clearAllData()}
            disabled={clearing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FCA5A5] text-[#DC2626] bg-white hover:bg-[#FEF2F2] text-sm font-medium transition-colors disabled:opacity-50"
            title="Clear all imported data"
          >
            <Trash2 size={14} />
            {clearing ? 'Clearing…' : 'Clear Data'}
          </button>
          <Button onClick={onNewImport} leftIcon={<Plus size={16} />}>
            New Import
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Marketplace tabs */}
        <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-1">
          {MARKETPLACE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 ml-auto">
          <Calendar size={16} className="text-[#64748B]" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <span className="text-[#94A3B8] text-sm">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
          {activeTab === 'all'
            ? 'All Platforms'
            : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{' '}
          — Order Summary
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Orders',   value: quickStats.total,      color: 'text-[#2563EB]',  bg: 'bg-[#EFF6FF]' },
            { label: 'Delivered',      value: quickStats.delivered,  color: 'text-[#16A34A]',  bg: 'bg-[#F0FDF4]' },
            { label: 'Cancelled',      value: quickStats.cancelled,  color: 'text-[#DC2626]',  bg: 'bg-[#FEF2F2]' },
            { label: 'Returned / RTO', value: quickStats.returned,   color: 'text-[#D97706]',  bg: 'bg-[#FFFBEB]' },
            { label: 'Total Revenue',  value: `₹${quickStats.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-[#0F172A]', bg: 'bg-[#F8FAFC]' },
            { label: 'Fees Deducted',  value: `₹${quickStats.fees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,    color: 'text-[#7C3AED]', bg: 'bg-[#FDF4FF]' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border border-[#E2E8F0] p-4 ${s.bg}`}>
              {statsLoading ? (
                <div className="h-7 w-16 bg-[#E2E8F0] rounded animate-pulse mb-1" />
              ) : (
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              )}
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart + Recent Reports ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-1 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[#1E293B_2px_2px_0px_0px]">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-1">Monthly Status</h3>
          <p className="text-xs text-[#94A3B8] mb-4">
            <span className="inline-block w-2 h-2 rounded-sm bg-[#2563EB] mr-1" />
            Matched&nbsp;
            <span className="inline-block w-2 h-2 rounded-sm bg-[#FCA5A5] mr-1 ml-2" />
            Unmatched
          </p>
          <MonthlyChart data={chartData} />
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[#1E293B_2px_2px_0px_0px]">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Recent Reports</h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[#F1F5F9] rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-[#DC2626] text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-[#94A3B8]">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No reports found</p>
              <p className="text-xs mt-1">Import your first CSV to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#94A3B8] border-b border-[#F1F5F9]">
                    <th className="pb-2 font-medium">Marketplace</th>
                    <th className="pb-2 font-medium">Period</th>
                    <th className="pb-2 font-medium text-right">Orders</th>
                    <th className="pb-2 font-medium text-right">Matched</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.slice(0, 8).map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-2.5 pr-3">
                        <span className="capitalize font-medium text-[#0F172A]">
                          {r.marketplace_id ?? '—'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-[#64748B]">
                        {r.date_from} – {r.date_to}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-[#0F172A]">
                        {(r.total_orders ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-[#16A34A]">
                        {(
                          (r as unknown as Record<string, number>)['matched_orders'] ??
                          (r as unknown as Record<string, number>)['matched_count'] ??
                          0
                        ).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge
                          variant={
                            r.status === 'completed'
                              ? 'success'
                              : r.status === 'failed'
                              ? 'error'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        <button
                          onClick={() => onViewReport(r.id)}
                          className="text-[#2563EB] hover:underline text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Platform Stats ── */}
      <PlatformStatsSection
        orgId={orgId}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </div>
  )
}

export default ReconciliationDashboard
