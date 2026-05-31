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
} from 'lucide-react'
import { Button, Badge } from '@/components/common'
import * as reconService from '@/services/reconciliationService'
import type { ReconciliationReportData } from '@/services/reconciliationService'

// ─── Types ────────────────────────────────────────────────────────────────────

type MarketplaceTab = 'all' | 'amazon' | 'flipkart' | 'myntra' | 'meesho'

interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtext?: string
}

interface DashboardProps {
  orgId: string
  onNewImport: () => void
  onViewReport: (reportId: string) => void
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color, subtext }) => (
  <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[#1E293B_2px_2px_0px_0px]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-[#64748B] font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#0F172A] mt-1">{value}</p>
        {subtext && <p className="text-xs text-[#94A3B8] mt-1">{subtext}</p>}
      </div>
      <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
    </div>
  </div>
)

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
  const [dateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [reports, setReports] = useState<Awaited<ReturnType<typeof reconService.getReports>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    void fetchReports()
  }, [fetchReports])

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
            readOnly
            className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[#94A3B8] bg-[#F8FAFC]"
          />
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Orders"
          value={totalOrders.toLocaleString('en-IN')}
          icon={<BarChart3 size={20} className="text-[#2563EB]" />}
          color="bg-[#EFF6FF]"
        />
        <StatsCard
          label="Matched Orders"
          value={matchedOrders.toLocaleString('en-IN')}
          icon={<CheckCircle2 size={20} className="text-[#16A34A]" />}
          color="bg-[#F0FDF4]"
          subtext={
            totalOrders > 0
              ? `${Math.round((matchedOrders / totalOrders) * 100)}% match rate`
              : undefined
          }
        />
        <StatsCard
          label="Unmatched"
          value={unmatchedOrders.toLocaleString('en-IN')}
          icon={<XCircle size={20} className="text-[#DC2626]" />}
          color="bg-[#FEF2F2]"
        />
        <StatsCard
          label="Discrepancy"
          value={`₹${discrepancyAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingDown size={20} className="text-[#D97706]" />}
          color="bg-[#FFFBEB]"
          subtext="Total amount mismatch"
        />
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
    </div>
  )
}

export default ReconciliationDashboard
