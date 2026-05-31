import { supabase } from '@/supabase/client'
import type { Database } from '@/types/supabase'

type Order = Database['public']['Tables']['marketplace_orders']['Row']
type Settlement = Database['public']['Tables']['marketplace_settlements']['Row']
type ReconciliationReport = Database['public']['Tables']['reconciliation_reports']['Row']

export type ReconciliationImportType = 'orders' | 'settlements'
export type ExportFormat = 'csv' | 'xlsx'

export interface OrderFilters {
  marketplaceId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface SettlementFilters {
  marketplaceId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ReconciliationReportData {
  matched: number
  unmatched_orders: number
  missing_payments: number
  excess_payments: number
  total_orders_amount: number
  total_settlements_amount: number
  discrepancy: number
  details: {
    order_id: string
    settlement_id: string | null
    order_amount: number
    settlement_amount: number | null
    status: 'matched' | 'missing_payment' | 'excess_payment' | 'partial'
  }[]
}

// ─── Parse and import a CSV file as orders or settlements ───────────────────
export async function importCSV(
  orgId: string,
  marketplaceId: string,
  type: ReconciliationImportType,
  file: File,
): Promise<{ inserted: number; errors: string[] }> {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) throw new Error('importCSV: file has no data rows')

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })

  const now = new Date().toISOString()
  const errors: string[] = []

  if (type === 'orders') {
    const records = rows
      .map((row, idx) => {
        if (!row.order_id) {
          errors.push(`Row ${idx + 2}: missing order_id`)
          return null
        }
        return {
          org_id: orgId,
          marketplace_id: marketplaceId,
          order_id: row.order_id,
          order_date: row.order_date || null,
          amount: row.amount ? parseFloat(row.amount) : null,
          status: row.status || 'pending',
          customer_name: row.customer_name || null,
          raw_data: row,
          created_at: now,
        }
      })
      .filter(Boolean)

    if (records.length > 0) {
      const { error } = await supabase
        .from('marketplace_orders')
        .upsert(records as Parameters<typeof supabase.from<'marketplace_orders'>>[0] extends never ? never : never[], {
          onConflict: 'org_id,marketplace_id,order_id',
        })
      if (error) throw new Error(`importCSV orders failed: ${error.message}`)
    }
    return { inserted: records.length, errors }
  }

  // type === 'settlements'
  const records = rows
    .map((row, idx) => {
      if (!row.settlement_id && !row.transaction_id) {
        errors.push(`Row ${idx + 2}: missing settlement_id or transaction_id`)
        return null
      }
      return {
        org_id: orgId,
        marketplace_id: marketplaceId,
        settlement_id: row.settlement_id || row.transaction_id,
        order_id: row.order_id || null,
        settlement_date: row.settlement_date || row.date || null,
        amount: row.amount ? parseFloat(row.amount) : null,
        type: row.type || 'payment',
        raw_data: row,
        created_at: now,
      }
    })
    .filter(Boolean)

  if (records.length > 0) {
    const { error } = await supabase
      .from('marketplace_settlements')
      .upsert(records as unknown[], { onConflict: 'org_id,marketplace_id,settlement_id' })
    if (error) throw new Error(`importCSV settlements failed: ${error.message}`)
  }

  return { inserted: records.length, errors }
}

// ─── Paginated order list ────────────────────────────────────────────────────
export async function getOrders(
  orgId: string,
  filters: OrderFilters = {},
): Promise<PaginatedResult<Order>> {
  const { marketplaceId, status, dateFrom, dateTo, page = 1, pageSize = 30 } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('marketplace_orders')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)

  if (marketplaceId) query = query.eq('marketplace_id', marketplaceId)
  if (status) query = query.eq('status', status)
  if (dateFrom) query = query.gte('order_date', dateFrom)
  if (dateTo) query = query.lte('order_date', dateTo)

  const { data, error, count } = await query
    .order('order_date', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`getOrders failed: ${error.message}`)
  return { data: data ?? [], total: count ?? 0, page, pageSize }
}

// ─── Paginated settlement list ───────────────────────────────────────────────
export async function getSettlements(
  orgId: string,
  filters: SettlementFilters = {},
): Promise<PaginatedResult<Settlement>> {
  const { marketplaceId, dateFrom, dateTo, page = 1, pageSize = 30 } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('marketplace_settlements')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)

  if (marketplaceId) query = query.eq('marketplace_id', marketplaceId)
  if (dateFrom) query = query.gte('settlement_date', dateFrom)
  if (dateTo) query = query.lte('settlement_date', dateTo)

  const { data, error, count } = await query
    .order('settlement_date', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`getSettlements failed: ${error.message}`)
  return { data: data ?? [], total: count ?? 0, page, pageSize }
}

// ─── Match orders to settlements and persist a report ───────────────────────
export async function runReconciliation(
  orgId: string,
  marketplaceId: string,
  dateFrom: string,
  dateTo: string,
): Promise<ReconciliationReport & { reportData: ReconciliationReportData }> {
  // Fetch orders in range
  const { data: orders, error: ordErr } = await supabase
    .from('marketplace_orders')
    .select('*')
    .eq('org_id', orgId)
    .eq('marketplace_id', marketplaceId)
    .gte('order_date', dateFrom)
    .lte('order_date', dateTo)

  if (ordErr) throw new Error(`runReconciliation: orders fetch failed — ${ordErr.message}`)

  // Fetch settlements in range
  const { data: settlements, error: setErr } = await supabase
    .from('marketplace_settlements')
    .select('*')
    .eq('org_id', orgId)
    .eq('marketplace_id', marketplaceId)
    .gte('settlement_date', dateFrom)
    .lte('settlement_date', dateTo)

  if (setErr) throw new Error(`runReconciliation: settlements fetch failed — ${setErr.message}`)

  // Build lookup map: order_id -> settlement
  const settlementMap = new Map<string, Settlement>()
  for (const s of settlements ?? []) {
    if (s.order_id) settlementMap.set(s.order_id, s)
  }

  const details: ReconciliationReportData['details'] = []
  let matched = 0
  let unmatched_orders = 0
  let missing_payments = 0
  let excess_payments = 0
  let totalOrdersAmount = 0
  let totalSettlementsAmount = 0

  for (const order of orders ?? []) {
    const orderAmount = order.amount ?? 0
    totalOrdersAmount += orderAmount

    const settlement = order.order_id ? settlementMap.get(order.order_id) : undefined

    if (!settlement) {
      unmatched_orders++
      missing_payments++
      details.push({
        order_id: order.order_id ?? order.id,
        settlement_id: null,
        order_amount: orderAmount,
        settlement_amount: null,
        status: 'missing_payment',
      })
      continue
    }

    const settleAmount = settlement.amount ?? 0
    totalSettlementsAmount += settleAmount

    if (Math.abs(orderAmount - settleAmount) < 0.01) {
      matched++
      details.push({
        order_id: order.order_id ?? order.id,
        settlement_id: settlement.settlement_id ?? settlement.id,
        order_amount: orderAmount,
        settlement_amount: settleAmount,
        status: 'matched',
      })
    } else if (settleAmount > orderAmount) {
      excess_payments++
      details.push({
        order_id: order.order_id ?? order.id,
        settlement_id: settlement.settlement_id ?? settlement.id,
        order_amount: orderAmount,
        settlement_amount: settleAmount,
        status: 'excess_payment',
      })
    } else {
      details.push({
        order_id: order.order_id ?? order.id,
        settlement_id: settlement.settlement_id ?? settlement.id,
        order_amount: orderAmount,
        settlement_amount: settleAmount,
        status: 'partial',
      })
    }
  }

  const reportData: ReconciliationReportData = {
    matched,
    unmatched_orders,
    missing_payments,
    excess_payments,
    total_orders_amount: totalOrdersAmount,
    total_settlements_amount: totalSettlementsAmount,
    discrepancy: totalOrdersAmount - totalSettlementsAmount,
    details,
  }

  // Persist report
  const { data: report, error: repErr } = await supabase
    .from('reconciliation_reports')
    .insert({
      org_id: orgId,
      marketplace_id: marketplaceId,
      date_from: dateFrom,
      date_to: dateTo,
      report_data: reportData as unknown as Database['public']['Tables']['reconciliation_reports']['Insert']['report_data'],
      matched_count: matched,
      unmatched_count: unmatched_orders,
      total_orders: (orders ?? []).length,
      total_settlements: (settlements ?? []).length,
      status: 'completed',
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (repErr) throw new Error(`runReconciliation: report insert failed — ${repErr.message}`)

  return { ...report, reportData }
}

// ─── List reconciliation reports for an org ──────────────────────────────────
export async function getReports(orgId: string): Promise<ReconciliationReport[]> {
  const { data, error } = await supabase
    .from('reconciliation_reports')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getReports failed: ${error.message}`)
  return data ?? []
}

// ─── Fetch a single report with all detail data ──────────────────────────────
export async function getReport(
  id: string,
): Promise<ReconciliationReport & { reportData: ReconciliationReportData }> {
  const { data, error } = await supabase
    .from('reconciliation_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`getReport failed: ${error.message}`)
  return { ...data, reportData: data.report_data as unknown as ReconciliationReportData }
}

// ─── Export a report as CSV or XLSX Blob ────────────────────────────────────
export async function exportReport(id: string, format: ExportFormat): Promise<Blob> {
  const report = await getReport(id)
  const details = report.reportData.details

  const headers = [
    'Order ID',
    'Settlement ID',
    'Order Amount',
    'Settlement Amount',
    'Status',
  ]

  const rows = details.map((d) => [
    d.order_id,
    d.settlement_id ?? '',
    d.order_amount.toFixed(2),
    d.settlement_amount != null ? d.settlement_amount.toFixed(2) : '',
    d.status,
  ])

  if (format === 'csv') {
    const csvLines = [headers.join(','), ...rows.map((r) => r.join(','))]
    return new Blob([csvLines.join('\n')], { type: 'text/csv' })
  }

  // XLSX: use SheetJS if available, else fall back to CSV
  try {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reconciliation')
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    return new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  } catch {
    // SheetJS not installed — return CSV as fallback
    const csvLines = [headers.join(','), ...rows.map((r) => r.join(','))]
    return new Blob([csvLines.join('\n')], { type: 'text/csv' })
  }
}

// ─── Find orders with no matching settlement ─────────────────────────────────
export async function detectMissingPayments(
  orgId: string,
  marketplaceId: string,
): Promise<Order[]> {
  // Fetch all order_ids that have at least one settlement
  const { data: settlements, error: setErr } = await supabase
    .from('marketplace_settlements')
    .select('order_id')
    .eq('org_id', orgId)
    .eq('marketplace_id', marketplaceId)
    .not('order_id', 'is', null)

  if (setErr) throw new Error(`detectMissingPayments: settlements fetch failed — ${setErr.message}`)

  const settledOrderIds = new Set((settlements ?? []).map((s) => s.order_id as string))

  const { data: orders, error: ordErr } = await supabase
    .from('marketplace_orders')
    .select('*')
    .eq('org_id', orgId)
    .eq('marketplace_id', marketplaceId)

  if (ordErr) throw new Error(`detectMissingPayments: orders fetch failed — ${ordErr.message}`)

  return (orders ?? []).filter(
    (o) => o.order_id && !settledOrderIds.has(o.order_id),
  )
}
