// ============================================================
// EcomSathi — Reconciliation Settlements Table
// ============================================================

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Calendar, Link as LinkIcon } from 'lucide-react'
import { Badge, Pagination } from '@/components/common'
import * as reconService from '@/services/reconciliationService'
import type { Settlement } from '@/types'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettlementsTableProps {
  orgId: string
  onViewLinkedOrder?: (orderId: string) => void
}

type MarketplaceFilter = 'all' | 'amazon' | 'flipkart' | 'myntra' | 'meesho'

const PAGE_SIZE = 30

function statusVariant(
  status: string,
): 'success' | 'error' | 'warning' | 'default' {
  switch (status) {
    case 'matched':
      return 'success'
    case 'disputed':
      return 'error'
    case 'unmatched':
      return 'warning'
    default:
      return 'default'
  }
}

// ─── Main Table ───────────────────────────────────────────────────────────────

const SettlementsTable: React.FC<SettlementsTableProps> = ({
  orgId,
  onViewLinkedOrder,
}) => {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [marketplace, setMarketplace] = useState<MarketplaceFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true)
      const result = await reconService.getSettlements(orgId, {
        marketplaceId: marketplace !== 'all' ? marketplace : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setSettlements(result.data)
      setTotal(result.total)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load settlements')
    } finally {
      setLoading(false)
    }
  }, [orgId, marketplace, dateFrom, dateTo, page])

  useEffect(() => {
    void fetchSettlements()
  }, [fetchSettlements])

  const filteredSettlements = settlements.filter(
    (s) =>
      !search ||
      s.settlement_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.order_id?.toLowerCase().includes(search.toLowerCase()),
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const MARKETPLACE_TABS: { key: MarketplaceFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'amazon', label: 'Amazon' },
    { key: 'flipkart', label: 'Flipkart' },
    { key: 'myntra', label: 'Myntra' },
    { key: 'meesho', label: 'Meesho' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-lg font-bold text-[#0F172A]">Settlements</h2>
        <div className="ml-auto">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              showFilters
                ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                : 'border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
            }`}
          >
            <Filter size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Marketplace tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit">
        {MARKETPLACE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setMarketplace(t.key)
              setPage(1)
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              marketplace === t.key
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              type="text"
              placeholder="Search settlement ID, order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#94A3B8]" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setPage(1)
              }}
              className="text-sm border border-[#E2E8F0] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <span className="text-[#94A3B8]">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setPage(1)
              }}
              className="text-sm border border-[#E2E8F0] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {(search || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearch('')
                setDateFrom('')
                setDateTo('')
                setPage(1)
              }}
              className="text-xs text-[#DC2626] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Settlement ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Marketplace
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Orders Matched
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Linked Order
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-[#F1F5F9]">
                      {Array(7)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
                          </td>
                        ))}
                    </tr>
                  ))}
                </>
              ) : filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#94A3B8] text-sm">
                    No settlements found
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-[#0F172A]">
                        {s.settlement_id ?? s.id.slice(0, 8) + '…'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-[#64748B]">{s.marketplace_id}</span>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {s.settlement_date
                        ? new Date(s.settlement_date).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-[#0F172A]">
                        ₹{(s.amount ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {s.order_id ? (
                        <span className="font-mono text-xs">{s.order_id}</span>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(s.status ?? 'pending')} size="sm">
                        {s.status ?? 'pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {s.order_id && onViewLinkedOrder ? (
                        <button
                          onClick={() => onViewLinkedOrder(s.order_id!)}
                          className="flex items-center gap-1 text-[#2563EB] hover:underline text-xs"
                        >
                          <LinkIcon size={12} />
                          View Order
                        </button>
                      ) : (
                        <span className="text-[#94A3B8] text-xs">No link</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  )
}

export default SettlementsTable
