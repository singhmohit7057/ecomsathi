import { supabase } from '@/supabase/client'
import type { Database } from '@/types/supabase'
import {
  parseFlipkartOrderFile,
  parseFlipkartPaymentFile,
  parseFlipkartReturnFile,
  parseMyntraOrderFile,
  parseMyntraReturnFile,
  parseMyntraCancellationFile,
  parseMyntraReturnDeliveryFile,
  parseMyntraSpfFile,
} from '@/modules/reconciliation/utils/csvParser'

// ─── Table row / insert type aliases ─────────────────────────────────────────
type Order = Database['public']['Tables']['orders']['Row']
type Settlement = Database['public']['Tables']['settlements']['Row']
type ReconciliationReport = Database['public']['Tables']['reconciliation_reports']['Row']

type OrderInsert = Database['public']['Tables']['orders']['Insert']
type SettlementInsert = Database['public']['Tables']['settlements']['Insert']
type ReconciliationReportInsert = Database['public']['Tables']['reconciliation_reports']['Insert']

// ─── Exported type aliases ─────────────────────────────────────────────────
export type ReconciliationImportType = 'orders' | 'settlements'
export type ExportFormat = 'csv' | 'xlsx'

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

export interface FlipkartImportResult {
  orders_inserted: number
  payments_inserted: number
  returns_inserted: number
  matched: number
  unmatched: number
  total_revenue: number
  total_fees: number
  total_refunds: number
  discrepancy_amount: number
  report_id: string
  errors: string[]
}

// ─── Parse and import a CSV file as orders or settlements ────────────────────
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

  const errors: string[] = []

  if (type === 'orders') {
    const records: OrderInsert[] = rows
      .map((row, idx) => {
        if (!row.order_id) {
          errors.push(`Row ${idx + 2}: missing order_id`)
          return null
        }
        if (!row.order_date) {
          errors.push(`Row ${idx + 2}: missing order_date`)
          return null
        }
        return {
          org_id: orgId,
          marketplace_id: marketplaceId,
          order_id: row.order_id,
          order_date: row.order_date,
          total_amount: row.amount ? parseFloat(row.amount) : 0,
          status: row.status || 'pending',
          sku: row.sku || null,
          raw_data: row,
        } satisfies OrderInsert
      })
      .filter((r): r is OrderInsert => r !== null)

    if (records.length > 0) {
      const { error } = await supabase
        .from('orders')
        .insert(records)
      if (error && !error.message.includes('duplicate')) throw new Error(`importCSV orders failed: ${error.message}`)
    }
    return { inserted: records.length, errors }
  }

  // type === 'settlements'
  const settlementRecords: SettlementInsert[] = rows
    .map((row, idx) => {
      if (!row.settlement_id && !row.transaction_id) {
        errors.push(`Row ${idx + 2}: missing settlement_id or transaction_id`)
        return null
      }
      if (!row.settlement_date && !row.date) {
        errors.push(`Row ${idx + 2}: missing settlement_date`)
        return null
      }
      return {
        org_id: orgId,
        settlement_id: row.settlement_id || row.transaction_id,
        settlement_date: row.settlement_date || row.date,
        amount: row.amount ? parseFloat(row.amount) : 0,
        status: 'pending' as const,
      } as SettlementInsert
    })
    .filter((r): r is SettlementInsert => r !== null)

  if (settlementRecords.length > 0) {
    const { error } = await supabase
      .from('settlements')
      .insert(settlementRecords)
    if (error && !error.message.includes('duplicate')) throw new Error(`importCSV settlements failed: ${error.message}`)
  }

  return { inserted: settlementRecords.length, errors }
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

// ─── Fetch a single report ───────────────────────────────────────────────────
export async function getReport(
  id: string,
): Promise<ReconciliationReport & { reportData: ReconciliationReportData }> {
  const { data, error } = await supabase
    .from('reconciliation_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`getReport failed: ${error.message}`)

  // Reconstruct ReconciliationReportData from the flat schema columns
  const reportData: ReconciliationReportData = {
    matched: data.matched_orders,
    unmatched_orders: data.unmatched_orders,
    missing_payments: data.unmatched_orders,
    excess_payments: 0,
    total_orders_amount: data.total_revenue,
    total_settlements_amount: data.total_revenue - data.discrepancy_amount,
    discrepancy: data.discrepancy_amount,
    details: [],
  }

  return { ...data, reportData }
}

// ─── Export a report as CSV or XLSX Blob ─────────────────────────────────────
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
    // SheetJS not installed — fall back to CSV
    const csvLines = [headers.join(','), ...rows.map((r) => r.join(','))]
    return new Blob([csvLines.join('\n')], { type: 'text/csv' })
  }
}

// ─── Paginated returns list (orders with status LIKE 'return_%') ─────────────
export async function getReturns(
  orgId: string,
  filters: {
    marketplaceId?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    pageSize?: number
  } = {},
): Promise<PaginatedResult<Order>> {
  const { marketplaceId, dateFrom, dateTo, page = 1, pageSize = 30 } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)
    .like('status', 'return_%')

  if (marketplaceId) query = query.eq('marketplace_id', marketplaceId)
  if (dateFrom) query = query.gte('order_date', dateFrom)
  if (dateTo) query = query.lte('order_date', dateTo)

  const { data, error, count } = await query
    .order('order_date', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`getReturns failed: ${error.message}`)
  return { data: data ?? [], total: count ?? 0, page, pageSize }
}

// ─── Myntra import ────────────────────────────────────────────────────────────

export interface MyntraImportResult {
  orders_inserted: number
  returns_inserted: number
  cancellations_inserted: number
  return_deliveries_inserted: number
  matched: number
  unmatched: number
  total_revenue: number
  total_discounts: number
  return_count: number
  rto_count: number
  spf_count: number   // number of SPF rows processed
  report_id: string
  errors: string[]
}

// Parses "2026-04-08 21:56:50.000" → "2026-04-08"
// Also handles "08-04-26" (DD-MM-YY) → "2026-04-08"
function parseDatePart(s: string | null): string {
  if (!s) return new Date().toISOString().split('T')[0]
  const iso = s.split(' ')[0] // strip time component
  if (iso.includes('-') && iso.length === 10) return iso
  // DD-MM-YY format
  const [d, m, y] = iso.split('-')
  if (d && m && y) return `20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  return new Date().toISOString().split('T')[0]
}

function normalizeOrderStatus(status: string | null | undefined): string {
  switch (status) {
    case 'C':   return 'cancelled'
    case 'F':   return 'failed'
    case 'RTO': return 'rto'
    case 'PK':  return 'packed'
    default:    return 'delivered'
  }
}

// ─── Private helper: last calendar day of a YYYY-MM month ────────────────────
function lastDayOfMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number)
  // new Date(year, mon, 0) = day 0 of month+1 = last day of month
  const last = new Date(year, mon, 0)
  const y = last.getFullYear()
  const m = String(last.getMonth() + 1).padStart(2, '0')
  const d = String(last.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Flipkart payment row → order status ─────────────────────────────────────
// Payment file is the ONLY real data source. Order and Return sheets are empty.
//
// Return Type values in payment file:
//   "Customer Return" = customer returned the item
//   "Logistics Return" = RTO / logistics couldn't deliver
//   "NA"              = no return, normal order
//
// Additional Information:
//   "REPLACEMENT_ITEM" = this is a replacement sent after return
//
// Item Return Status is always "Product Delivered" — not useful for classification.
function flipkartPaymentStatus(
  returnType: string | null,
  additionalInfo: string | null,
): string {
  const rt = (returnType ?? '').trim().toLowerCase()
  const addl = (additionalInfo ?? '').trim().toLowerCase()

  if (rt === 'logistics return') return 'rto'
  if (rt === 'customer return') return 'return'
  if (addl === 'replacement_item') return 'replacement'
  // "NA" or empty = delivered
  return 'delivered'
}

// ─── Flipkart 3-file import and reconciliation ───────────────────────────────
export async function importFlipkartReports(
  orgId: string,
  files: { orders: File; payment: File; returns: File },
  month: string, // 'YYYY-MM'  e.g. '2026-04'
): Promise<FlipkartImportResult> {
  const errors: string[] = []

  // ── 1. Parse all 3 files ──────────────────────────────────────────────────
  let orderRows: Awaited<ReturnType<typeof parseFlipkartOrderFile>> = []
  let paymentRows: Awaited<ReturnType<typeof parseFlipkartPaymentFile>> = []
  let returnRows: Awaited<ReturnType<typeof parseFlipkartReturnFile>> = []

  try {
    orderRows = await parseFlipkartOrderFile(files.orders)
  } catch (e) {
    throw new Error(
      `Failed to parse Flipkart Order file: ${e instanceof Error ? e.message : String(e)}`,
    )
  }

  try {
    paymentRows = await parseFlipkartPaymentFile(files.payment)
  } catch (e) {
    throw new Error(
      `Failed to parse Flipkart Payment file: ${e instanceof Error ? e.message : String(e)}`,
    )
  }

  try {
    returnRows = await parseFlipkartReturnFile(files.returns)
  } catch (e) {
    // Returns file is non-critical
    errors.push(
      `Failed to parse Flipkart Returns file: ${e instanceof Error ? e.message : String(e)}`,
    )
  }

  // ── 2. 3-way merge by order_id / order_item_id ───────────────────────────────
  //
  // All 3 files share order_id (Order + Payment) and order_item_id (all 3).
  // Join key: order_item_id (strips OI: prefix in parsers).
  //
  // Merged record = Order sheet (status, date, sku, reasons)
  //              + Payment sheet (amounts, fees, tcs, tds)
  //              + Return sheet  (return details, completion date)

  // Build lookup maps keyed by order_item_id (most granular shared key)
  const orderByItemId = new Map<string, typeof orderRows[number]>()
  for (const row of orderRows) {
    const key = (row.order_item_id ?? row.order_id ?? '').trim()
    if (key) orderByItemId.set(key, row)
  }

  // Payment: group ALL rows per order_item_id and sum bank_settlement_value.
  // Each order_item_id can have multiple payment rows (original sale + return deductions).
  // We want:
  //   sale_amount  = the MRP from the row where sale_amount > 0 (original sale row)
  //   settlement   = SUM of all bank_settlement_value rows for this item (net received)
  //   fees/tcs/tds = from the original sale row (positive bank value row)
  interface PaymentSummary {
    sale_amount: number
    settlement: number       // net = sum of all bank_settlement_value
    my_share: number
    marketplace_fee: number
    tcs: number
    tds: number
    gst_on_mp_fees: number
    commission: number
    commission_rate: number | null
    reverse_shipping_fee: number
    return_type: string | null
    neft_id: string | null
    payment_date: string | null
    seller_sku: string | null
    // The "best" single row (highest positive bank value) for non-aggregated fields
    bestRow: typeof paymentRows[number] | null
  }

  const paymentByItemId = new Map<string, PaymentSummary>()
  const paymentByOrderId = new Map<string, PaymentSummary>()

  for (const row of paymentRows) {
    const itemKey = (row.order_item_id ?? '').trim()
    const ordKey = (row.order_id ?? '').trim()

    const addToMap = (map: Map<string, PaymentSummary>, key: string) => {
      if (!key) return
      const existing = map.get(key)
      const bankVal = row.bank_settlement_value ?? 0
      const isBetterRow = !existing?.bestRow || bankVal > (existing.bestRow.bank_settlement_value ?? 0)

      if (!existing) {
        map.set(key, {
          sale_amount: row.sale_amount ?? 0,
          settlement: bankVal,
          my_share: row.my_share ?? 0,
          marketplace_fee: row.marketplace_fee ?? 0,
          tcs: row.tcs ?? 0,
          tds: row.tds ?? 0,
          gst_on_mp_fees: row.gst_on_mp_fees ?? 0,
          commission: row.commission ?? 0,
          commission_rate: row.commission_rate,
          reverse_shipping_fee: row.reverse_shipping_fee ?? 0,
          return_type: row.return_type,
          neft_id: row.neft_id,
          payment_date: row.payment_date,
          seller_sku: row.seller_sku,
          bestRow: row,
        })
      } else {
        // Accumulate settlement
        existing.settlement += bankVal
        // Use the row with highest sale_amount for the MRP
        if ((row.sale_amount ?? 0) > existing.sale_amount) {
          existing.sale_amount = row.sale_amount ?? 0
        }
        // Use the best row (highest bank value) for fee fields
        if (isBetterRow) {
          existing.marketplace_fee = row.marketplace_fee ?? existing.marketplace_fee
          existing.tcs = row.tcs ?? existing.tcs
          existing.tds = row.tds ?? existing.tds
          existing.gst_on_mp_fees = row.gst_on_mp_fees ?? existing.gst_on_mp_fees
          existing.commission = row.commission ?? existing.commission
          existing.commission_rate = row.commission_rate ?? existing.commission_rate
          existing.neft_id = row.neft_id ?? existing.neft_id
          existing.payment_date = row.payment_date ?? existing.payment_date
          existing.bestRow = row
        }
      }
    }

    addToMap(paymentByItemId, itemKey)
    addToMap(paymentByOrderId, ordKey)
  }

  // Return sheet: keyed by order_item_id (strips OI: in parser)
  const returnByItemId = new Map<string, typeof returnRows[number]>()
  for (const row of returnRows) {
    const key = (row.order_item_id ?? '').trim()
    if (key) returnByItemId.set(key, row)
  }

  const orderRecords: OrderInsert[] = []
  const seenOrderItemIds = new Set<string>()

  // Helper: normalize order_item_id from Order sheet (strips OI: already done in parser,
  // but Payment stores it as pure numeric e.g. "337190120268129100")
  function normalizeItemId(id: string | null): string {
    return (id ?? '').replace(/^OI:/i, '').trim()
  }

  // PRIMARY LOOP: Order sheet rows — 1 row per order_item_id
  for (const orderRow of orderRows) {
    const itemId = normalizeItemId(orderRow.order_item_id)
    const orderId = (orderRow.order_id ?? '').trim()
    if (!itemId && !orderId) continue
    const key = itemId || orderId
    if (seenOrderItemIds.has(key)) continue
    seenOrderItemIds.add(key)

    // Find matching payment row (try item_id first, then order_id)
    const payment = paymentByItemId.get(itemId) ?? paymentByOrderId.get(orderId) ?? null

    // Find matching return row
    const ret = returnByItemId.get(itemId) ?? null

    // Determine status: Order sheet is authoritative
    const rawStatus = (orderRow.order_item_status ?? '').toUpperCase().trim()
    const status =
      rawStatus === 'RETURNED'         ? 'return' :
      rawStatus === 'RETURN_REQUESTED' ? 'return_requested' :
      rawStatus === 'CANCELLED'        ? 'cancelled' :
      rawStatus === 'DELIVERED'        ? 'delivered' :
      rawStatus.toLowerCase()          || 'pending'

    // Amounts from aggregated payment summary:
    //   total_amount   = MRP (sale_amount from original sale row)
    //   settlement     = net bank_settlement_value (sum of all rows — positive minus deductions)
    //   marketplace_fee, tcs, tds from best row (highest bank value)
    const saleAmount = payment?.sale_amount ?? 0
    const netSettlement = payment?.settlement ?? null
    const mpFee = payment?.marketplace_fee ?? null
    const gst = payment?.gst_on_mp_fees ?? null
    const shipping = (payment?.bestRow as Record<string, unknown> | null | undefined)?.['shipping_fee'] as number | null ?? null

    // Return reason: Return sheet > Order sheet
    const returnReason = ret?.return_reason ?? orderRow.return_reason ?? null
    const returnSubReason = ret?.return_sub_reason ?? orderRow.return_sub_reason ?? null
    const cancellationReason = orderRow.cancellation_reason ?? null
    const cancellationSubReason = orderRow.cancellation_sub_reason ?? null

    orderRecords.push({
      org_id: orgId,
      marketplace_id: null,
      order_id: orderId || itemId,
      order_date: orderRow.order_date || orderRow.order_approval_date || new Date().toISOString().split('T')[0],
      status,
      total_amount: saleAmount,
      settlement_amount: netSettlement,
      marketplace_fee: mpFee,
      gst_amount: gst,
      shipping_amount: shipping,
      sku: orderRow.sku ?? payment?.seller_sku ?? null,
      raw_data: {
        _marketplace: 'flipkart',
        _order_item_id: itemId,
        order_item_status: orderRow.order_item_status,
        _return_reason: returnReason,
        _return_sub_reason: returnSubReason,
        _cancellation_reason: cancellationReason,
        _cancellation_sub_reason: cancellationSubReason,
        ...(ret ? {
          return_id: ret.return_id,
          return_type: ret.return_type,
          return_status: ret.return_status,
          return_result: ret.return_result,
          return_completion_date: ret.return_completion_date,
        } : {}),
        ...(payment ? {
          'Sale Amount (Rs.)': payment.sale_amount,
          'My share (Rs.)': payment.settlement,
          'Commission (Rs.)': payment.commission,
          commission_rate: payment.commission_rate,
          'TCS (Rs.)': payment.tcs,
          'TDS (Rs.)': payment.tds,
          'GST on MP Fees (Rs.)': payment.gst_on_mp_fees,
          'Reverse Shipping Fee (Rs.)': payment.reverse_shipping_fee,
          'Return Type': payment.return_type,
          neft_id: payment.neft_id,
          payment_date: payment.payment_date,
        } : {}),
      } as unknown as Database['public']['Tables']['orders']['Insert']['raw_data'],
    })
  }

  // FALLBACK: Payment items with no matching Order sheet row (Order sheet missing months)
  for (const [itemId, pmtSummary] of paymentByItemId.entries()) {
    if (seenOrderItemIds.has(itemId)) continue
    const orderId = (pmtSummary.bestRow?.order_id ?? '').trim()
    const key = itemId || orderId
    if (!key) continue
    seenOrderItemIds.add(itemId)
    if (orderId) seenOrderItemIds.add(orderId)

    const ret = returnByItemId.get(itemId) ?? null
    const returnReason = ret?.return_reason ?? null
    const returnSubReason = ret?.return_sub_reason ?? null
    const row = pmtSummary.bestRow!

    orderRecords.push({
      org_id: orgId,
      marketplace_id: null,
      order_id: orderId || itemId,
      order_date: row.order_date ?? new Date().toISOString().split('T')[0],
      status: flipkartPaymentStatus(row.return_type, row.additional_information),
      total_amount: pmtSummary.sale_amount,
      settlement_amount: pmtSummary.settlement,
      marketplace_fee: pmtSummary.marketplace_fee,
      gst_amount: pmtSummary.gst_on_mp_fees,
      shipping_amount: null,
      sku: pmtSummary.seller_sku ?? null,
      raw_data: {
        _marketplace: 'flipkart',
        _order_item_id: itemId,
        _return_reason: returnReason,
        _return_sub_reason: returnSubReason,
        ...(ret ? { return_type: ret.return_type, return_status: ret.return_status } : {}),
        'Sale Amount (Rs.)': row.sale_amount,
        'My share (Rs.)': row.my_share,
        'Commission (Rs.)': row.commission,
        commission_rate: row.commission_rate,
        'TCS (Rs.)': row.tcs,
        'TDS (Rs.)': row.tds,
        'GST on MP Fees (Rs.)': row.gst_on_mp_fees,
        'Reverse Shipping Fee (Rs.)': row.reverse_shipping_fee,
        'Return Type': row.return_type,
        neft_id: row.neft_id,
        payment_date: row.payment_date,
      } as unknown as Database['public']['Tables']['orders']['Insert']['raw_data'],
    })
  }

  let orders_inserted = 0
  if (orderRecords.length > 0) {
    const { error: ordErr } = await supabase
      .from('orders')
      .insert(orderRecords)
    if (ordErr && !ordErr.message.includes('duplicate')) {
      throw new Error(`orders insert failed — ${ordErr.message}`)
    }
    orders_inserted = orderRecords.length
  }

  // ── 3. Insert settlements from Payment report ─────────────────────────────
  const settlementRecords: SettlementInsert[] = []
  for (const row of paymentRows) {
    if (!row.order_id) {
      errors.push(`Payment row skipped: missing order_id`)
      continue
    }
    if (!row.neft_id || !row.order_item_id) {
      errors.push(
        `Payment row for order ${row.order_id}: missing neft_id or order_item_id — skipped`,
      )
      continue
    }
    if (!row.payment_date) {
      errors.push(`Payment row for order ${row.order_id}: missing payment_date — skipped`)
      continue
    }

    const settlementId = `${row.neft_id.trim()}_${row.order_item_id.trim()}`

    settlementRecords.push({
      org_id: orgId,
      settlement_id: settlementId,
      settlement_date: row.payment_date,
      amount: row.bank_settlement_value ?? 0,
      status: 'pending' as const,
    } as SettlementInsert)
  }

  let payments_inserted = 0
  if (settlementRecords.length > 0) {
    const { error: setErr } = await supabase
      .from('settlements')
      .insert(settlementRecords)
    if (setErr) {
      // Non-fatal: log and continue — settlements RLS may need migration 006 to be run
      errors.push(`Settlements insert skipped: ${setErr.message}`)
    } else {
      payments_inserted = settlementRecords.length
    }
  }

  const returns_inserted = 0 // returns are merged into orders via 3-way merge above

  // ── 4. Reconciliation — cross-join order rows against payment rows ─────────
  const settlementLookup = new Map<string, (typeof paymentRows)[number]>()
  for (const row of paymentRows) {
    if (row.order_id) settlementLookup.set(row.order_id, row)
  }

  let matched = 0
  let unmatched = 0
  let total_revenue = 0
  let total_fees = 0
  let total_refunds = 0
  let sumMyShare = 0

  for (const row of paymentRows) {
    const saleAmt = row.sale_amount ?? 0
    if (saleAmt > 0) total_revenue += saleAmt
    total_fees += row.marketplace_fee ?? 0
    const refundAmt = row.refund ?? 0
    if (refundAmt < 0) total_refunds += Math.abs(refundAmt)
    sumMyShare += row.my_share ?? 0
  }

  const discrepancy_amount = total_revenue - sumMyShare

  // Use payment rows as source of truth for match counting (Order sheet may be empty)
  const countSource = orderRows.length > 0 ? orderRows.map(r => r.order_id).filter(Boolean) : [...seenOrderIds]
  for (const orderId of countSource) {
    if (!orderId) continue
    const settlement = settlementLookup.get(orderId as string)
    if (settlement && (settlement.bank_settlement_value ?? 0) >= 0) {
      matched++
    } else {
      unmatched++
    }
  }

  // ── 7. Insert reconciliation report ───────────────────────────────────────
  const dateFrom = `${month}-01`
  const dateTo = lastDayOfMonth(month)

  const { data: reportRow, error: repErr } = await supabase
    .from('reconciliation_reports')
    .insert({
      org_id: orgId,
      marketplace_id: null,
      report_type: 'orders' as const,
      date_from: dateFrom,
      date_to: dateTo,
      total_orders: orderRecords.length,
      matched_orders: matched,
      unmatched_orders: unmatched,
      total_revenue,
      total_fees,
      discrepancy_amount,
      status: 'completed' as const,
    } satisfies ReconciliationReportInsert)
    .select('id')
    .single()

  if (repErr) {
    // Non-fatal: log and continue — RLS may need migration 006
    errors.push(`Report insert skipped: ${repErr.message}`)
  }

  // ── 8. Return ─────────────────────────────────────────────────────────────
  return {
    orders_inserted,
    payments_inserted,
    returns_inserted,
    matched,
    unmatched,
    total_revenue,
    total_fees,
    total_refunds,
    discrepancy_amount,
    report_id: reportRow?.id ?? '',
    errors,
  }
}

export async function importMyntraReports(
  orgId: string,
  files: {
    orders: File
    returns: File          // now required
    cancellations: File    // now required
    returnDelivery?: File
    spf?: File             // new: SPF compensation file
  },
  month: string, // 'YYYY-MM'
): Promise<MyntraImportResult> {
  const errors: string[] = []

  // ── 1. Parse files ──────────────────────────────────────────────────────────
  let orderRows: Awaited<ReturnType<typeof parseMyntraOrderFile>> = []
  let returnRows: Awaited<ReturnType<typeof parseMyntraReturnFile>> = []
  let cancellationRows: Awaited<ReturnType<typeof parseMyntraCancellationFile>> = []
  let returnDeliveryRows: Awaited<ReturnType<typeof parseMyntraReturnDeliveryFile>> = []
  let spfRows: Awaited<ReturnType<typeof parseMyntraSpfFile>> = []

  try {
    orderRows = await parseMyntraOrderFile(files.orders)
  } catch (e) {
    throw new Error(
      `Failed to parse Myntra Order file: ${e instanceof Error ? e.message : String(e)}`,
    )
  }

  // returns — required
  try {
    returnRows = await parseMyntraReturnFile(files.returns)
  } catch (e) {
    throw new Error(`Failed to parse Myntra Returns file: ${e instanceof Error ? e.message : String(e)}`)
  }

  // cancellations — required
  try {
    cancellationRows = await parseMyntraCancellationFile(files.cancellations)
  } catch (e) {
    throw new Error(`Failed to parse Myntra Cancellation file: ${e instanceof Error ? e.message : String(e)}`)
  }

  if (files.returnDelivery) {
    try {
      returnDeliveryRows = await parseMyntraReturnDeliveryFile(files.returnDelivery)
    } catch (e) {
      errors.push(
        `Failed to parse Myntra Return Delivery file: ${e instanceof Error ? e.message : String(e)}`,
      )
    }
  }

  if (files.spf) {
    try {
      spfRows = await parseMyntraSpfFile(files.spf)
    } catch (e) {
      errors.push(`SPF file parse failed: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // ── SPF lookup map: order_id -> total compensation ──────────────────────────
  const spfByOrderId = new Map<string, number>() // order_id -> spf_amount
  for (const row of spfRows) {
    if (row.order_id && row.final_spf_calculations) {
      spfByOrderId.set(row.order_id, (spfByOrderId.get(row.order_id) ?? 0) + row.final_spf_calculations)
    }
  }

  // ── 2. Insert orders ────────────────────────────────────────────────────────
  const orderRecords: OrderInsert[] = []
  for (const row of orderRows) {
    if (!row.order_release_id) {
      errors.push(`Myntra Order row skipped: missing order_release_id`)
      continue
    }
    orderRecords.push({
      org_id: orgId,
      marketplace_id: null,
      order_id: row.order_release_id,
      order_date: parseDatePart(row.created_on ?? null),
      status: normalizeOrderStatus(row.order_status),
      total_amount: row.final_amount ?? 0,
      settlement_amount: row.final_amount ?? 0,
      marketplace_fee: null,
      gst_amount: null,
      shipping_amount: row.shipping_charge ?? 0,
      sku: row.seller_sku_code ?? null,
      raw_data: {
        ...(row as unknown as Record<string, unknown>),
        spf_compensation: spfByOrderId.get(row.order_release_id ?? '') ?? null,
      } as unknown as Database['public']['Tables']['orders']['Insert']['raw_data'],
    })
  }

  let orders_inserted = 0
  if (orderRecords.length > 0) {
    const { error: ordErr } = await supabase
      .from('orders')
      .insert(orderRecords)
    if (ordErr && !ordErr.message.includes('duplicate')) {
      throw new Error(`orders insert failed — ${ordErr.message}`)
    }
    orders_inserted = orderRecords.length
  }

  // ── 3. Insert returns ───────────────────────────────────────────────────────
  const returnRecords: OrderInsert[] = []
  for (const row of returnRows) {
    const ordId = row.return_id || row.order_line_id
    if (!ordId) {
      errors.push(`Myntra Return row skipped: missing return_id and order_line_id`)
      continue
    }
    returnRecords.push({
      org_id: orgId,
      marketplace_id: null,
      order_id: ordId,
      order_date: parseDatePart(row.return_created_date ?? null),
      status: `return_${row.status?.toLowerCase() || 'pending'}`,
      total_amount: 0,
      settlement_amount: null,
      marketplace_fee: null,
      gst_amount: null,
      shipping_amount: null,
      sku: row.seller_sku_code ?? null,
      raw_data: row as unknown as Database['public']['Tables']['orders']['Insert']['raw_data'],
    })
  }

  let returns_inserted = 0
  if (returnRecords.length > 0) {
    const { error: retErr } = await supabase
      .from('orders')
      .insert(returnRecords)
    if (retErr && !retErr.message.includes('duplicate')) {
      errors.push(`Myntra Returns insert failed: ${retErr.message}`)
    } else {
      returns_inserted = returnRecords.length
    }
  }

  // ── 4. Insert cancellations ─────────────────────────────────────────────────
  const cancellationRecords: OrderInsert[] = []
  for (const row of cancellationRows) {
    if (!row.order_release_id) {
      errors.push(`Myntra Cancellation row skipped: missing order_release_id`)
      continue
    }
    cancellationRecords.push({
      org_id: orgId,
      marketplace_id: null,
      order_id: row.order_release_id,
      order_date: parseDatePart(row.order_creation_date ?? null),
      status: 'cancelled',
      total_amount: 0,
      settlement_amount: null,
      marketplace_fee: null,
      gst_amount: null,
      shipping_amount: null,
      sku: row.sku_code ?? null,
      raw_data: row as unknown as Database['public']['Tables']['orders']['Insert']['raw_data'],
    })
  }

  let cancellations_inserted = 0
  if (cancellationRecords.length > 0) {
    const { error: canErr } = await supabase
      .from('orders')
      .insert(cancellationRecords)
    if (canErr && !canErr.message.includes('duplicate')) {
      errors.push(`Myntra Cancellations insert failed: ${canErr.message}`)
    } else {
      cancellations_inserted = cancellationRecords.length
    }
  }

  // ── 5. Insert return deliveries ─────────────────────────────────────────────
  const returnDeliveryRecords: OrderInsert[] = []
  for (const row of returnDeliveryRows) {
    if (!row.order_line_id) {
      errors.push(`Myntra Return Delivery row skipped: missing order_line_id`)
      continue
    }
    returnDeliveryRecords.push({
      org_id: orgId,
      marketplace_id: null,
      order_id: row.order_line_id,
      order_date: parseDatePart(row.order_created_date ?? null),
      status: `return_${row.status?.toLowerCase().replace(/\s+/g, '_') || 'pending'}`,
      total_amount: 0,
      settlement_amount: null,
      marketplace_fee: null,
      gst_amount: null,
      shipping_amount: null,
      sku: row.seller_sku_code ?? null,
      raw_data: row as unknown as Database['public']['Tables']['orders']['Insert']['raw_data'],
    })
  }

  let return_deliveries_inserted = 0
  if (returnDeliveryRecords.length > 0) {
    const { error: rdErr } = await supabase
      .from('orders')
      .insert(returnDeliveryRecords)
    if (rdErr && !rdErr.message.includes('duplicate')) {
      errors.push(`Myntra Return Deliveries insert failed: ${rdErr.message}`)
    } else {
      return_deliveries_inserted = returnDeliveryRecords.length
    }
  }

  // ── 6. Reconciliation stats (from Orders rows only) ─────────────────────────
  let matched = 0
  let unmatched = 0
  let total_revenue = 0
  let total_discounts = 0

  for (const row of orderRows) {
    const isDelivered = row.order_status !== 'C' && row.order_status !== 'F' && row.order_status !== 'RTO'
    if (isDelivered) {
      matched++
      total_revenue += row.final_amount ?? 0
    } else {
      unmatched++
    }
    total_discounts += (row.discount ?? 0) + (row.coupon_discount ?? 0)
  }

  const return_count = returnRows.length
  const rto_count = returnRows.filter((r) => r.status === 'RTO').length

  // ── 7. Insert reconciliation report ─────────────────────────────────────────
  const dateFrom = `${month}-01`
  const dateTo = lastDayOfMonth(month)

  const { data: reportRow, error: repErr } = await supabase
    .from('reconciliation_reports')
    .insert({
      org_id: orgId,
      marketplace_id: null,
      report_type: 'orders' as const,
      date_from: dateFrom,
      date_to: dateTo,
      total_orders: orderRows.length,
      matched_orders: matched,
      unmatched_orders: unmatched,
      total_revenue,
      total_fees: 0,
      discrepancy_amount: 0,
      status: 'completed' as const,
    } satisfies ReconciliationReportInsert)
    .select('id')
    .single()

  if (repErr) {
    errors.push(`Report insert skipped: ${repErr.message}`)
  }

  // ── 8. Return ────────────────────────────────────────────────────────────────
  return {
    orders_inserted,
    returns_inserted,
    cancellations_inserted,
    return_deliveries_inserted,
    matched,
    unmatched,
    total_revenue,
    total_discounts,
    return_count,
    rto_count,
    spf_count: spfRows.length,
    report_id: reportRow?.id ?? '',
    errors,
  }
}

// ─── Platform Stats ───────────────────────────────────────────────────────────

export interface OrderDetail {
  order_id: string
  order_date: string | null
  status: string
  sku: string | null
  total_amount: number
  settlement_amount: number | null
  marketplace_fee: number | null
  gst_amount: number | null
  shipping_amount: number | null
  // from raw_data (Flipkart payment fields)
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
  // from raw_data (Myntra fields)
  final_amount: number | null
  discount: number | null
  coupon_discount: number | null
  cancellation_reason: string | null
}

export interface PlatformStats {
  marketplace: string           // 'flipkart' | 'myntra' | 'amazon' | etc. — derived from raw_data._marketplace
  total_orders: number
  delivered: number
  cancelled: number
  returned: number
  rto: number
  total_revenue: number         // sum of total_amount for delivered
  total_settlement: number      // sum of settlement_amount for delivered
  total_fees: number            // sum of marketplace_fee
  total_tcs: number
  total_tds: number
  total_gst_on_fees: number
  total_reverse_shipping: number
  total_discounts: number
  net_payable: number           // total_settlement - total_fees - total_tcs - total_tds
  return_reasons: { reason: string; count: number }[]
  orders: OrderDetail[]
}

export interface AllPlatformStats {
  platforms: PlatformStats[]
  period: { from: string; to: string }
}

export async function getPlatformStats(
  orgId: string,
  dateFrom: string,   // 'YYYY-MM-DD'
  dateTo: string,     // 'YYYY-MM-DD'
): Promise<AllPlatformStats> {
  // ── 1. Fetch all orders in range ───────────────────────────────────────────
  const { data: rows, error } = await supabase
    .from('orders')
    .select('*')
    .eq('org_id', orgId)
    .gte('order_date', dateFrom)
    .lte('order_date', dateTo)
    .order('order_date', { ascending: false })
  if (error) throw new Error(`getPlatformStats failed: ${error.message}`)

  // ── 2. Helpers ─────────────────────────────────────────────────────────────
  function safeNum(v: unknown): number | null {
    if (v === null || v === undefined || v === 'NA' || v === '') return null
    const n = typeof v === 'number' ? v : parseFloat(String(v))
    return isNaN(n) ? null : n
  }
  function safeStr(v: unknown): string | null {
    if (v === null || v === undefined) return null
    const s = String(v).trim()
    return s === '' || s === 'NA' || s === 'null' ? null : s
  }

  function deriveMarketplace(raw: Record<string, unknown>): string {
    if (raw._marketplace) return String(raw._marketplace)
    if ('neft_id' in raw) return 'flipkart'
    if ('seller_id' in raw && 'final_amount' in raw) return 'myntra'
    return 'unknown'
  }

  // ── 3. Group rows by marketplace ───────────────────────────────────────────
  const groups = new Map<string, typeof rows>()
  for (const row of rows ?? []) {
    const raw = (row.raw_data ?? {}) as Record<string, unknown>
    const marketplace = deriveMarketplace(raw)
    if (!groups.has(marketplace)) groups.set(marketplace, [])
    groups.get(marketplace)!.push(row)
  }

  // ── 4. Compute stats per marketplace ──────────────────────────────────────
  const platforms: PlatformStats[] = []

  for (const [marketplace, mRows] of groups.entries()) {
    let delivered = 0
    let cancelled = 0
    let returned = 0
    let rto = 0
    let total_revenue = 0
    let total_settlement = 0
    let total_fees = 0
    let total_tcs = 0
    let total_tds = 0
    let total_gst_on_fees = 0
    let total_reverse_shipping = 0
    let total_discounts = 0
    const returnReasonMap = new Map<string, number>()
    const orderDetails: OrderDetail[] = []

    for (const row of mRows) {
      const raw = (row.raw_data ?? {}) as Record<string, unknown>
      const status = (row.status ?? '').toLowerCase()

      // Classify status — lowercase compare handles both old uppercase and new lowercase data
      const isRTO = status === 'rto' || status.includes('rto')
      const isReturn = status === 'return' || status === 'returned' || status === 'return_requested' || status.startsWith('return_') || status.startsWith('return ')
      const isCancelled = status === 'cancelled' || status === 'canceled' || status === 'failed' || status === 'f' || status.includes('cancel')
      const isReplacement = status === 'replacement'
      const isDelivered = !isReturn && !isRTO && !isCancelled && !isReplacement

      if (isRTO) rto++
      else if (isReturn) returned++
      else if (isCancelled) cancelled++
      else delivered++

      // Extract raw_data fields
      const sale_amount = safeNum(raw['sale_amount'] ?? raw['Sale Amount (Rs.)'])
      const my_share = safeNum(raw['my_share'] ?? raw['My share (Rs.)'])
      const commission = safeNum(raw['commission'] ?? raw['Commission (Rs.)'])
      const commission_rate = safeNum(raw['commission_rate'] ?? raw['Commission Rate (%)'])
      const tcs = safeNum(raw['tcs'] ?? raw['TCS (Rs.)'])
      const tds = safeNum(raw['tds'] ?? raw['TDS (Rs.)'])
      const gst_on_mp_fees = safeNum(raw['gst_on_mp_fees'] ?? raw['GST on MP Fees (Rs.)'])
      const reverse_shipping_fee = safeNum(raw['reverse_shipping_fee'] ?? raw['Reverse Shipping Fee (Rs.)'])
      const return_type = safeStr(raw['return_type'] ?? raw['Return Type'])
      // _return_reason is stored from Order sheet; return_reason as fallback from payment
      const return_reason = safeStr(raw['_return_reason'] ?? raw['return_reason'])
      const item_return_status = safeStr(raw['item_return_status'] ?? raw['Item Return Status'])
      const final_amount = safeNum(raw['final_amount'])
      const discount = safeNum(raw['discount'])
      const coupon_discount = safeNum(raw['coupon_discount'])
      const cancellation_reason = safeStr(raw['cancellation_reason'])

      // Aggregate totals
      if (isDelivered) {
        total_revenue += row.total_amount ?? 0
        if (row.settlement_amount != null) total_settlement += row.settlement_amount
      }
      if (row.marketplace_fee != null) total_fees += row.marketplace_fee
      if (tcs != null) total_tcs += tcs
      if (tds != null) total_tds += tds
      if (gst_on_mp_fees != null) total_gst_on_fees += gst_on_mp_fees
      if (isReturn && reverse_shipping_fee != null) total_reverse_shipping += reverse_shipping_fee
      if (discount != null) total_discounts += discount
      if (coupon_discount != null) total_discounts += coupon_discount

      // Return reasons
      if (isReturn && return_reason) {
        returnReasonMap.set(return_reason, (returnReasonMap.get(return_reason) ?? 0) + 1)
      }

      orderDetails.push({
        order_id: row.order_id ?? row.id,
        order_date: row.order_date,
        status: row.status ?? '',
        sku: row.sku,
        total_amount: row.total_amount ?? 0,
        settlement_amount: row.settlement_amount,
        marketplace_fee: row.marketplace_fee,
        gst_amount: row.gst_amount,
        shipping_amount: row.shipping_amount,
        sale_amount,
        my_share,
        commission,
        commission_rate,
        tcs,
        tds,
        gst_on_mp_fees,
        reverse_shipping_fee,
        return_type,
        return_reason,
        item_return_status,
        final_amount,
        discount,
        coupon_discount,
        cancellation_reason,
      })
    }

    const return_reasons = Array.from(returnReasonMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)

    const net_payable = total_settlement - total_fees - total_tcs - total_tds

    platforms.push({
      marketplace,
      total_orders: mRows.length,
      delivered,
      cancelled,
      returned,
      rto,
      total_revenue,
      total_settlement,
      total_fees,
      total_tcs,
      total_tds,
      total_gst_on_fees,
      total_reverse_shipping,
      total_discounts,
      net_payable,
      return_reasons,
      orders: orderDetails,
    })
  }

  return { platforms, period: { from: dateFrom, to: dateTo } }
}
