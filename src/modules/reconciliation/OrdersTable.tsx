// ============================================================
// EcomSathi — Reconciliation Orders Table
// ============================================================

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Download, Flag, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { Button, Badge, Pagination } from '@/components/common'
import type { Column } from '@/components/common'
import { Table } from '@/components/common'
import * as reconService from '@/services/reconciliationService'
import type { Order } from '@/types'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrdersTableProps {
  orgId: string
}

type StatusFilter = 'all' | 'pending' | 'matched' | 'unmatched' | 'disputed'
type MarketplaceFilter = 'all' | 'amazon' | 'flipkart' | 'myntra' | 'meesho'

const PAGE_SIZE = 30

// ─── Status badge helper ──────────────────────────────────────────────────────

function statusVariant(
  status: string,
): 'success' | 'error' | 'warning' | 'default' | 'info' {
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

// ─── Expanded Row ─────────────────────────────────────────────────────────────

const ExpandedOrderRow: React.FC<{ order: Order }> = ({ order }) => {
  const raw = order.raw_data as Record<string, unknown>

  return (
    <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-5 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <p className="text-xs text-[#94A3B8] mb-0.5">Order ID</p>
          <p className="font-medium text-[#0F172A]">{order.order_id}</p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-0.5">Marketplace</p>
          <p className="font-medium text-[#0F172A] capitalize">{order.marketplace_id}</p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-0.5">Order Amount</p>
          <p className="font-medium text-[#0F172A]">
            ₹{order.total_amount?.toFixed(2) ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-0.5">Settlement Amount</p>
          <p className="font-medium text-[#16A34A]">
            {order.settlement_amount != null
              ? `₹${order.settlement_amount.toFixed(2)}`
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-0.5">Marketplace Fee</p>
          <p className="text-[#0F172A]">
            {order.marketplace_fee != null ? `₹${order.marketplace_fee.toFixed(2)}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-0.5">GST Amount</p>
          <p className="text-[#0F172A]">
            {order.gst_amount != null ? `₹${order.gst_amount.toFixed(2)}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-0.5">Shipping</p>
          <p className="text-[#0F172A]">
            {order.shipping_amount != null ? `₹${order.shipping_amount.toFixed(2)}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-0.5">SKU</p>
          <p className="text-[#0F172A]">{order.sku ?? '—'}</p>
        </div>
      </div>

      {/* Raw data preview */}
      {raw && Object.keys(raw).length > 0 && (
        <details className="mt-1">
          <summary className="text-xs text-[#2563EB] cursor-pointer hover:underline">
            Show raw data
          </summary>
          <pre className="mt-2 text-xs text-[#64748B] bg-white border border-[#E2E8F0] rounded p-3 overflow-x-auto max-h-36">
            {JSON.stringify(raw, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

// ─── Main Table ───────────────────────────────────────────────────────────────

const OrdersTable: React.FC<OrdersTableProps> = ({ orgId }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [marketplace, setMarketplace] = useState<MarketplaceFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const result = await reconService.getOrders(orgId, {
        marketplaceId: marketplace !== 'all' ? marketplace : undefined,
        status: status !== 'all' ? status : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setOrders(result.data)
      setTotal(result.total)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [orgId, marketplace, status, dateFrom, dateTo, page])

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  // Client-side search filter
  const filteredOrders = orders.filter(
    (o) =>
      !search ||
      o.order_id?.toLowerCase().includes(search.toLowerCase()) ||
      o.sku?.toLowerCase().includes(search.toLowerCase()),
  )

  // ── Bulk export CSV ──────────────────────────────────────────────────────
  const handleBulkExport = async () => {
    setBulkLoading(true)
    try {
      const selected = filteredOrders.filter((o) => selectedIds.has(o.id))
      const headers = [
        'Order ID',
        'Marketplace',
        'Date',
        'SKU',
        'Amount',
        'Settlement Amount',
        'Status',
      ]
      const rows = selected.map((o) => [
        o.order_id,
        o.marketplace_id,
        o.order_date,
        o.sku ?? '',
        o.total_amount?.toFixed(2) ?? '',
        o.settlement_amount?.toFixed(2) ?? '',
        o.status,
      ])
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-export-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${selected.length} orders exported`)
    } catch {
      toast.error('Export failed')
    } finally {
      setBulkLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)))
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const MARKETPLACE_TABS: { key: MarketplaceFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'amazon', label: 'Amazon' },
    { key: 'flipkart', label: 'Flipkart' },
    { key: 'myntra', label: 'Myntra' },
    { key: 'meesho', label: 'Meesho' },
  ]

  const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'matched', label: 'Matched' },
    { value: 'unmatched', label: 'Unmatched' },
    { value: 'disputed', label: 'Disputed' },
    { value: 'pending', label: 'Pending' },
  ]

  const columns: Column<Order>[] = [
    {
      key: 'select',
      header: '',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => toggleSelect(row.id)}
          className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      width: 'w-10',
    },
    {
      key: 'order_id',
      header: 'Order ID',
      render: (row) => (
        <span className="font-mono text-sm text-[#0F172A]">{row.order_id}</span>
      ),
    },
    {
      key: 'marketplace_id',
      header: 'Marketplace',
      render: (row) => (
        <span className="capitalize text-[#64748B] text-sm">{row.marketplace_id}</span>
      ),
    },
    {
      key: 'order_date',
      header: 'Date',
      render: (row) => (
        <span className="text-sm text-[#64748B]">
          {row.order_date
            ? new Date(row.order_date).toLocaleDateString('en-IN')
            : '—'}
        </span>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (row) => (
        <span className="text-sm text-[#64748B] font-mono">{row.sku ?? '—'}</span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (row) => (
        <span className="text-sm font-medium text-[#0F172A]">
          ₹{row.total_amount?.toFixed(2) ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'settlement_amount',
      header: 'Settlement',
      render: (row) => (
        <span
          className={`text-sm font-medium ${
            row.settlement_amount != null ? 'text-[#16A34A]' : 'text-[#94A3B8]'
          }`}
        >
          {row.settlement_amount != null ? `₹${row.settlement_amount.toFixed(2)}` : '—'}
        </span>
      ),
    },
    {
      key: 'expand',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setExpandedRow(expandedRow === row.id ? null : row.id)
          }}
          className="text-[#94A3B8] hover:text-[#2563EB]"
        >
          {expandedRow === row.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      ),
      width: 'w-8',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-lg font-bold text-[#0F172A]">Orders</h2>
        <div className="flex items-center gap-2 ml-auto">
          {selectedIds.size > 0 && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void handleBulkExport()}
                loading={bulkLoading}
                leftIcon={<Download size={14} />}
              >
                Export ({selectedIds.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Flag size={14} />}
                onClick={() => toast('Mark disputed coming soon', { icon: 'ℹ️' })}
              >
                Mark Disputed
              </Button>
            </>
          )}
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

      {/* Filters row */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              type="text"
              placeholder="Search order ID, SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter)
              setPage(1)
            }}
            className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Date range */}
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

          {(search || status !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearch('')
                setStatus('all')
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
        {/* Select all row */}
        {filteredOrders.length > 0 && (
          <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                selectedIds.size === filteredOrders.length && filteredOrders.length > 0
              }
              onChange={toggleSelectAll}
              className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-xs text-[#64748B]">
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : `${total.toLocaleString('en-IN')} orders total`}
            </span>
          </div>
        )}

        {/* Render rows with optional expansion */}
        {loading ? (
          <Table columns={columns} data={[]} loading rowKey={(_, i) => i} />
        ) : (
          <div>
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-[#94A3B8]">
                <p className="text-sm">No orders found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={String(col.key)}
                        className={`px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide ${col.width ?? ''}`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr
                        className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                        onClick={() =>
                          setExpandedRow(expandedRow === order.id ? null : order.id)
                        }
                      >
                        {columns.map((col) => (
                          <td key={String(col.key)} className={`px-4 py-3 ${col.width ?? ''}`}>
                            {col.render ? col.render(order) : String(order[col.key as keyof Order] ?? '—')}
                          </td>
                        ))}
                      </tr>
                      {expandedRow === order.id && (
                        <tr>
                          <td colSpan={columns.length} className="p-0">
                            <ExpandedOrderRow order={order} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
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

export default OrdersTable
