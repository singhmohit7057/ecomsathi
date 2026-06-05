import React, { useState, useEffect, useCallback } from 'react'
import { Filter, Calendar } from 'lucide-react'
import { Badge, Pagination } from '@/components/common'
import * as reconService from '@/services/reconciliationService'
import type { Order } from '@/types'
import toast from 'react-hot-toast'

interface ReturnsTableProps {
  orgId: string
}

type MarketplaceFilter = 'all' | 'amazon' | 'flipkart' | 'myntra' | 'meesho'

const PAGE_SIZE = 30

const MARKETPLACE_TABS: { key: MarketplaceFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'amazon', label: 'Amazon' },
  { key: 'flipkart', label: 'Flipkart' },
  { key: 'myntra', label: 'Myntra' },
  { key: 'meesho', label: 'Meesho' },
]

function returnStatusVariant(
  status: string,
): 'success' | 'error' | 'warning' | 'default' | 'info' {
  const s = status.toLowerCase()
  if (s.includes('complete') || s.includes('approved') || s.includes('refund')) return 'success'
  if (s.includes('reject') || s.includes('denied')) return 'error'
  if (s.includes('initiat') || s.includes('pending') || s.includes('transit')) return 'warning'
  return 'default'
}

function stripReturnPrefix(status: string): string {
  return status.startsWith('return_') ? status.slice(7) : status
}

function getReturnId(order: Order): string {
  const raw = order.raw_data as Record<string, unknown> | null
  if (raw?.return_id) return String(raw.return_id)
  return order.order_id ?? order.id
}

function getOrderItemId(order: Order): string {
  const raw = order.raw_data as Record<string, unknown> | null
  if (raw?.order_item_id) return String(raw.order_item_id)
  return '—'
}

function getReturnDate(order: Order): string {
  const raw = order.raw_data as Record<string, unknown> | null
  const d = raw?.return_requested_date ?? raw?.return_date ?? order.order_date
  if (!d) return '—'
  return new Date(String(d)).toLocaleDateString('en-IN')
}

function getReturnReason(order: Order): string {
  const raw = order.raw_data as Record<string, unknown> | null
  if (raw?.return_reason) return String(raw.return_reason)
  return '—'
}

function getReturnResult(order: Order): string {
  const raw = order.raw_data as Record<string, unknown> | null
  if (raw?.return_result) return String(raw.return_result)
  return '—'
}

const SkeletonRows: React.FC = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="border-b border-[#F1F5F9]">
        {Array.from({ length: 8 }).map((__, j) => (
          <td key={j} className="px-4 py-3">
            <div className="h-3.5 bg-[#E2E8F0] rounded animate-pulse w-24" />
          </td>
        ))}
      </tr>
    ))}
  </>
)

const ReturnsTable: React.FC<ReturnsTableProps> = ({ orgId }) => {
  const [returns, setReturns] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [marketplace, setMarketplace] = useState<MarketplaceFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true)
      const result = await reconService.getReturns(orgId, {
        marketplaceId: marketplace !== 'all' ? marketplace : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setReturns(result.data)
      setTotal(result.total)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load returns')
    } finally {
      setLoading(false)
    }
  }, [orgId, marketplace, dateFrom, dateTo, page])

  useEffect(() => {
    void fetchReturns()
  }, [fetchReturns])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-lg font-bold text-[#0F172A]">Returns</h2>
        <div className="flex items-center gap-2 ml-auto">
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

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
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

          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
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

      <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
        {!loading && (
          <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <span className="text-xs text-[#64748B]">
              {total.toLocaleString('en-IN')} returns total
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                {[
                  'Return ID',
                  'Order Item ID',
                  'Marketplace',
                  'SKU',
                  'Return Date',
                  'Return Status',
                  'Return Reason',
                  'Return Result',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#94A3B8]">
                    No returns found
                  </td>
                </tr>
              ) : (
                returns.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-[#0F172A]">{getReturnId(row)}</td>
                    <td className="px-4 py-3 font-mono text-[#64748B]">{getOrderItemId(row)}</td>
                    <td className="px-4 py-3 capitalize text-[#64748B]">{row.marketplace_id}</td>
                    <td className="px-4 py-3 font-mono text-[#64748B]">{row.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                      {getReturnDate(row)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={returnStatusVariant(row.status)} size="sm">
                        {stripReturnPrefix(row.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#64748B] max-w-[180px] truncate">
                      {getReturnReason(row)}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{getReturnResult(row)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

export default ReturnsTable
