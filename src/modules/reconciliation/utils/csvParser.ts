import type { Order } from '@/types'

type XlsxCellValue = string | number | boolean | Date | null | undefined

export interface ParsedData {
  [key: string]: string | number | null
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ─── Flipkart Order Report row ───────────────────────────────────────────────

export interface FlipkartOrderRow {
  order_item_id: string | null
  order_id: string | null
  fulfilment_source: string | null
  fulfilment_type: string | null
  order_date: string | null
  order_approval_date: string | null
  order_item_status: string | null
  sku: string | null
  fsn: string | null
  product_title: string | null
  quantity: number | null
  serial_no_imei: string | null
  delivery_logistics_partner: string | null
  pickup_logistics_partner: string | null
  delivery_tracking_id: string | null
  forward_logistics_form: string | null
  forward_logistics_form_no: string | null
  order_cancellation_date: string | null
  cancellation_reason: string | null
  cancellation_sub_reason: string | null
  order_return_approval_date: string | null
  return_id: string | null
  return_reason: string | null
  return_sub_reason: string | null
  procurement_dispatch_sla: string | null
  dispatch_after_date: string | null
  dispatch_by_date: string | null
  order_ready_for_dispatch_on_date: string | null
  dispatched_date: string | null
  dispatch_sla_breached: string | null
  seller_pickup_reattempts: string | null
  delivery_sla: string | null
  deliver_by_date: string | null
  order_delivery_date: string | null
  delivery_sla_breached: string | null
  order_service_completion_date: string | null
  service_by_date: string | null
  service_completion_sla: string | null
  service_sla_breached: string | null
}

// ─── Flipkart Payment Report row ─────────────────────────────────────────────

export interface FlipkartPaymentRow {
  neft_id: string | null
  neft_type: string | null
  payment_date: string | null
  bank_settlement_value: number | null
  input_gst_tcs_credits: number | null
  income_tax_tds_credits: number | null
  order_id: string | null
  order_item_id: string | null
  sale_amount: number | null
  total_offer_amount: number | null
  my_share: number | null
  marketplace_fee: number | null
  taxes: number | null
  offer_adjustments: number | null
  protection_fund: number | null
  refund: number | null
  tier: string | null
  commission_rate: number | null
  commission: number | null
  fixed_fee: number | null
  collection_fee: number | null
  pick_and_pack_fee: number | null
  shipping_fee: number | null
  reverse_shipping_fee: number | null
  tcs: number | null
  tds: number | null
  gst_on_mp_fees: number | null
  item_gst_rate: number | null
  order_date: string | null
  dispatch_date: string | null
  fulfilment_type: string | null
  seller_sku: string | null
  quantity: number | null
  product_sub_category: string | null
  additional_information: string | null  // 'REPLACEMENT_ITEM' | 'NA'
  return_type: string | null            // 'Customer Return' | 'Logistics Return' | 'NA'
  item_return_status: string | null
  invoice_id: string | null
  invoice_date: string | null
}

// ─── Flipkart Return Report row ───────────────────────────────────────────────

export interface FlipkartReturnRow {
  return_id: string | null
  order_item_id: string | null
  fulfilment_type: string | null
  return_requested_date: string | null
  return_approval_date: string | null
  return_status: string | null
  return_reason: string | null
  return_sub_reason: string | null
  return_type: string | null
  return_result: string | null
  return_expectation: string | null
  reverse_logistics_tracking_id: string | null
  sku: string | null
  fsn: string | null
  product_title: string | null
  quantity: number | null
  return_completion_type: string | null
  primary_pv_output: string | null
  detailed_pv_output: string | null
  final_condition_of_returned_product: string | null
  tech_visit_sla: string | null
  tech_visit_by_date: string | null
  tech_visit_completion_datetime: string | null
  tech_visit_completion_breach: string | null
  return_completion_sla: string | null
  return_complete_by_date: string | null
  return_completion_date: string | null
  return_completion_breach: string | null
  return_cancellation_date: string | null
  return_cancellation_reason: string | null
}

// ─── Marketplace signature column sets ───────────────────────────────────────

const AMAZON_SIGNATURE_COLS = ['settlement-id', 'transaction-type', 'order-id', 'fulfillment-id']
const FLIPKART_SIGNATURE_COLS = ['order id', 'sub order id', 'fsn', 'commission']
const MYNTRA_SIGNATURE_COLS = ['order no', 'awb', 'selling price', 'commission amount']
const MEESHO_SIGNATURE_COLS = ['order id', 'sub order id', 'commission', 'tds', 'reverse shipping']

// ─── Private helpers ──────────────────────────────────────────────────────────

function toFloat(val: XlsxCellValue): number | null {
  if (val === null || val === undefined || val === '') return null
  if (val instanceof Date) return null
  if (typeof val === 'boolean') return val ? 1 : 0
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? null : n
}

function toStr(val: XlsxCellValue): string | null {
  if (val === null || val === undefined) return null
  if (val instanceof Date) return val.toISOString().split('T')[0]
  const s = String(val).trim()
  return s === '' ? null : s
}

function toInt(val: XlsxCellValue): number | null {
  const f = toFloat(val)
  if (f === null) return null
  return Math.round(f)
}

function normalizeColName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Auto-detect marketplace from CSV headers ─────────────────────────────────

export function detectMarketplace(headers: string[]): string | null {
  const normalized = headers.map((h) => h.toLowerCase().trim())

  const score = (sigs: string[]) =>
    sigs.filter((s) => normalized.some((h) => h.includes(s.toLowerCase()))).length

  const scores: Record<string, number> = {
    amazon: score(AMAZON_SIGNATURE_COLS),
    flipkart: score(FLIPKART_SIGNATURE_COLS),
    myntra: score(MYNTRA_SIGNATURE_COLS),
    meesho: score(MEESHO_SIGNATURE_COLS),
  }

  const best = Object.entries(scores).reduce<[string, number] | null>((acc, [k, v]) => {
    if (!acc || v > acc[1]) return [k, v]
    return acc
  }, null)

  if (!best || best[1] === 0) return null
  return best[0]
}

// ─── Parse file (CSV or XLSX) — generic ──────────────────────────────────────

export async function parseMarketplaceFile(
  file: File,
  _marketplace: string,
): Promise<ParsedData[]> {
  const XLSX = await import('xlsx')

  const isXlsx =
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.name.endsWith('.xlsx') ||
    file.name.endsWith('.xls') ||
    file.type === 'application/vnd.ms-excel'

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, raw: false })

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('File has no sheets')

  const sheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, XlsxCellValue>>(sheet, {
    defval: null,
    raw: !isXlsx,
  })

  return rawRows.map((row) => {
    const normalized: ParsedData = {}
    for (const [key, val] of Object.entries(row)) {
      const normalizedKey = key.toLowerCase().trim()
      if (val instanceof Date) {
        normalized[normalizedKey] = val.toISOString().split('T')[0]
      } else if (typeof val === 'boolean') {
        normalized[normalizedKey] = val ? '1' : '0'
      } else {
        normalized[normalizedKey] = val as string | number | null
      }
    }
    return normalized
  })
}

// ─── Flipkart SKU cleaner ─────────────────────────────────────────────────────
// Flipkart Order xlsx stores SKU as: """SKU:LMS-25-s""" — strip quotes and prefix
function cleanFlipkartSku(raw: XlsxCellValue): string | null {
  if (raw === null || raw === undefined) return null
  const s = String(raw).replace(/"/g, '').trim() // remove all quotes
  if (s.toUpperCase().startsWith('SKU:')) return s.slice(4).trim()
  return s || null
}

// ─── Flipkart Order Report parser ────────────────────────────────────────────

export async function parseFlipkartOrderFile(file: File): Promise<FlipkartOrderRow[]> {
  const XLSX = await import('xlsx')

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

  const sheetName = workbook.SheetNames.find((n) => n === 'Orders') ?? workbook.SheetNames[0]
  if (!sheetName) throw new Error('Flipkart Order file has no sheets')

  const sheet = workbook.Sheets[sheetName]

  // Flipkart Order xlsx files repaired by Excel often have a broken !ref
  // that only includes the header row (e.g. A1:AM1). Fix by computing the
  // actual range from all cells present in the sheet.
  const cellAddrs = Object.keys(sheet).filter(k => !k.startsWith('!'))
  if (cellAddrs.length > 0) {
    const decoded = cellAddrs.map(a => XLSX.utils.decode_cell(a))
    const maxRow = Math.max(...decoded.map(c => c.r))
    const maxCol = Math.max(...decoded.map(c => c.c))
    sheet['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxRow, c: maxCol } })
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, XlsxCellValue>>(sheet, {
    defval: null,
    cellDates: true,
  })

  return rawRows.map((row): FlipkartOrderRow => {
    const r: Record<string, XlsxCellValue> = {}
    for (const [k, v] of Object.entries(row)) {
      r[k.toLowerCase().replace(/\s+/g, '_')] = v
    }

    const g = (col: string): XlsxCellValue => r[col] ?? null

    return {
      order_item_id:                    toStr(g('order_item_id'))?.replace(/^OI:/i, '') ?? null,
      order_id:                         toStr(g('order_id')),
      fulfilment_source:                toStr(g('fulfilment_source')),
      fulfilment_type:                  toStr(g('fulfilment_type')),
      order_date:                       toStr(g('order_date')),
      order_approval_date:              toStr(g('order_approval_date')),
      order_item_status:                toStr(g('order_item_status')),
      sku:                              cleanFlipkartSku(g('sku')),
      fsn:                              toStr(g('fsn')),
      product_title:                    toStr(g('product_title')),
      quantity:                         toInt(g('quantity')),
      serial_no_imei:                   toStr(g('serial_no_imei')),
      delivery_logistics_partner:       toStr(g('delivery_logistics_partner')),
      pickup_logistics_partner:         toStr(g('pickup_logistics_partner')),
      delivery_tracking_id:             toStr(g('delivery_tracking_id')),
      forward_logistics_form:           toStr(g('forward_logistics_form')),
      forward_logistics_form_no:        toStr(g('forward_logistics_form_no')),
      order_cancellation_date:          toStr(g('order_cancellation_date')),
      cancellation_reason:              toStr(g('cancellation_reason')),
      cancellation_sub_reason:          toStr(g('cancellation_sub_reason')),
      order_return_approval_date:       toStr(g('order_return_approval_date')),
      return_id:                        toStr(g('return_id')),
      return_reason:                    toStr(g('return_reason')),
      return_sub_reason:                toStr(g('return_sub_reason')),
      procurement_dispatch_sla:         toStr(g('procurement_dispatch_sla')),
      dispatch_after_date:              toStr(g('dispatch_after_date')),
      dispatch_by_date:                 toStr(g('dispatch_by_date')),
      order_ready_for_dispatch_on_date: toStr(g('order_ready_for_dispatch_on_date')),
      dispatched_date:                  toStr(g('dispatched_date')),
      dispatch_sla_breached:            toStr(g('dispatch_sla_breached')),
      seller_pickup_reattempts:         toStr(g('seller_pickup_reattempts')),
      delivery_sla:                     toStr(g('delivery_sla')),
      deliver_by_date:                  toStr(g('deliver_by_date')),
      order_delivery_date:              toStr(g('order_delivery_date')),
      delivery_sla_breached:            toStr(g('delivery_sla_breached')),
      order_service_completion_date:    toStr(g('order_service_completion_date')),
      service_by_date:                  toStr(g('service_by_date')),
      service_completion_sla:           toStr(g('service_completion_sla')),
      service_sla_breached:             toStr(g('service_sla_breached')),
    }
  })
}

// ─── Flipkart Payment Report parser ──────────────────────────────────────────

export async function parseFlipkartPaymentFile(file: File): Promise<FlipkartPaymentRow[]> {
  const XLSX = await import('xlsx')

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

  const sheetName = workbook.SheetNames.find((n) => n === 'Orders') ?? workbook.SheetNames[0]
  if (!sheetName) throw new Error('Flipkart Payment file has no sheets')

  const sheet = workbook.Sheets[sheetName]

  const allRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    defval: null,
    header: 1,
  })

  if (allRows.length < 4) return []

  const headerRow = allRows[1] as XlsxCellValue[]

  const colIndexByKey: Record<string, number> = {}
  headerRow.forEach((cell, idx) => {
    if (cell !== null && cell !== undefined) {
      const key = normalizeColName(String(cell))
      if (key !== '') colIndexByKey[key] = idx
    }
  })

  const dataRows = allRows.slice(3)

  const byIdx = (row: XlsxCellValue[], idx: number): XlsxCellValue =>
    idx >= 0 && idx < row.length ? row[idx] : null

  return dataRows
    .filter((row) => {
      const arr = row as XlsxCellValue[]
      return arr.some((c) => c !== null && c !== undefined && String(c).trim() !== '')
    })
    .map((row): FlipkartPaymentRow => {
      const r = row as XlsxCellValue[]

      return {
        neft_id:                 toStr(byIdx(r, 0)),
        neft_type:               toStr(byIdx(r, 1)),
        payment_date:            toStr(byIdx(r, 2)),
        bank_settlement_value:   toFloat(byIdx(r, 3)),
        input_gst_tcs_credits:   toFloat(byIdx(r, 4)),
        income_tax_tds_credits:  toFloat(byIdx(r, 5)),
        order_id:                toStr(byIdx(r, 7))?.replace(/^OD/i, 'OD') ?? null, // keep as-is
        order_item_id:           toStr(byIdx(r, 8))?.replace(/^\s+|\s+$/g, '') ?? null,
        sale_amount:             toFloat(byIdx(r, 9)),
        total_offer_amount:      toFloat(byIdx(r, 10)),
        my_share:                toFloat(byIdx(r, 11)),
        marketplace_fee:         toFloat(byIdx(r, 13)),
        taxes:                   toFloat(byIdx(r, 14)),
        offer_adjustments:       toFloat(byIdx(r, 15)),
        protection_fund:         toFloat(byIdx(r, 16)),
        refund:                  toFloat(byIdx(r, 17)),
        tier:                    toStr(byIdx(r, 19)),
        commission_rate:         toFloat(byIdx(r, 20)),
        commission:              toFloat(byIdx(r, 21)),
        fixed_fee:               toFloat(byIdx(r, 22)),
        collection_fee:          toFloat(byIdx(r, 23)),
        pick_and_pack_fee:       toFloat(byIdx(r, 24)),
        shipping_fee:            toFloat(byIdx(r, 25)),
        reverse_shipping_fee:    toFloat(byIdx(r, 26)),
        tcs:                     toFloat(byIdx(r, 36)),
        tds:                     toFloat(byIdx(r, 37)),
        gst_on_mp_fees:          toFloat(byIdx(r, 38)),
        item_gst_rate:           toFloat(byIdx(r, 41)),
        order_date:              toStr(byIdx(r, 55)),
        dispatch_date:           toStr(byIdx(r, 56)),
        fulfilment_type:         toStr(byIdx(r, 57)),
        seller_sku:              toStr(byIdx(r, 58)),
        quantity:                toInt(byIdx(r, 59)),
        product_sub_category:    toStr(byIdx(r, 60)),
        additional_information:  toStr(byIdx(r, 61)),
        return_type:             toStr(byIdx(r, 62)),
        item_return_status:      toStr(byIdx(r, 64)),
        invoice_id:              toStr(byIdx(r, 66)),
        invoice_date:            toStr(byIdx(r, 67)),
      }
    })
}

// ─── Flipkart Return Report parser ────────────────────────────────────────────

export async function parseFlipkartReturnFile(file: File): Promise<FlipkartReturnRow[]> {
  const XLSX = await import('xlsx')

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

  const sheetName =
    workbook.SheetNames.find((n) => n === 'Returns') ?? workbook.SheetNames[0]
  if (!sheetName) throw new Error('Flipkart Return file has no sheets')

  const sheet = workbook.Sheets[sheetName]

  // Fix broken !ref from Excel-repaired files
  const cellAddrs2 = Object.keys(sheet).filter(k => !k.startsWith('!'))
  if (cellAddrs2.length > 0) {
    const decoded2 = cellAddrs2.map(a => XLSX.utils.decode_cell(a))
    const maxRow2 = Math.max(...decoded2.map(c => c.r))
    const maxCol2 = Math.max(...decoded2.map(c => c.c))
    sheet['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxRow2, c: maxCol2 } })
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, XlsxCellValue>>(sheet, {
    defval: null,
    cellDates: true,
  })

  return rawRows.map((row): FlipkartReturnRow => {
    const r: Record<string, XlsxCellValue> = {}
    for (const [k, v] of Object.entries(row)) {
      r[k.toLowerCase().replace(/\s+/g, '_')] = v
    }

    const g = (col: string): XlsxCellValue => r[col] ?? null

    return {
      return_id:                           toStr(g('return_id'))?.replace(/^RI:/i, '') ?? null,
      order_item_id:                       toStr(g('order_item_id'))?.replace(/^OI:/i, '') ?? null,
      fulfilment_type:                     toStr(g('fulfilment_type')),
      return_requested_date:               toStr(g('return_requested_date')),
      return_approval_date:                toStr(g('return_approval_date')),
      return_status:                       toStr(g('return_status')),
      return_reason:                       toStr(g('return_reason')),
      return_sub_reason:                   toStr(g('return_sub_reason')),
      return_type:                         toStr(g('return_type')),
      return_result:                       toStr(g('return_result')),
      return_expectation:                  toStr(g('return_expectation')),
      reverse_logistics_tracking_id:       toStr(g('reverse_logistics_tracking_id')),
      sku:                                 cleanFlipkartSku(g('sku')),
      fsn:                                 toStr(g('fsn')),
      product_title:                       toStr(g('product_title')),
      quantity:                            toInt(g('quantity')),
      return_completion_type:              toStr(g('return_completion_type')),
      primary_pv_output:                   toStr(g('primary_pv_output')),
      detailed_pv_output:                  toStr(g('detailed_pv_output')),
      final_condition_of_returned_product: toStr(g('final_condition_of_returned_product')),
      tech_visit_sla:                      toStr(g('tech_visit_sla')),
      tech_visit_by_date:                  toStr(g('tech_visit_by_date')),
      tech_visit_completion_datetime:      toStr(g('tech_visit_completion_datetime')),
      tech_visit_completion_breach:        toStr(g('tech_visit_completion_breach')),
      return_completion_sla:               toStr(g('return_completion_sla')),
      return_complete_by_date:             toStr(g('return_complete_by_date')),
      return_completion_date:              toStr(g('return_completion_date')),
      return_completion_breach:            toStr(g('return_completion_breach')),
      return_cancellation_date:            toStr(g('return_cancellation_date')),
      return_cancellation_reason:          toStr(g('return_cancellation_reason')),
    }
  })
}

// ─── Normalize helpers (used by normalize*Row) ────────────────────────────────

function parsedToFloat(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined || val === '') return null
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? null : n
}

function parsedToStr(val: string | number | null | undefined): string | null {
  if (val === null || val === undefined) return null
  return String(val).trim() || null
}

// ─── Amazon row normalizer ────────────────────────────────────────────────────

export function normalizeAmazonRow(row: ParsedData): Partial<Order> {
  return {
    order_id:          parsedToStr(row['order-id']          ?? row['order_id']),
    order_date:        parsedToStr(row['posted-date']        ?? row['posted_date'] ?? row['settlement-start-date']),
    total_amount:      parsedToFloat(row['amount']           ?? row['price-of-items-sold']) ?? 0,
    settlement_amount: parsedToFloat(row['total-amount']     ?? row['amount']),
    marketplace_fee:   parsedToFloat(row['item-related-fee-amount']),
    gst_amount:        parsedToFloat(row['other-transaction-fee-amount']),
    sku:               parsedToStr(row['sku']),
    status:            'pending',
    raw_data:          row,
  }
}

// ─── Flipkart row normalizer (generic — used by import wizard) ────────────────

export function normalizeFlipkartRow(row: ParsedData): Partial<Order> {
  const orderId =
    parsedToStr(row['order id'] ?? row['order_id'] ?? row['order id']) ?? null

  const orderDate =
    parsedToStr(
      row['order date']  ??
      row['order_date']  ??
      row['orderdate'],
    ) ?? null

  const saleAmount =
    parsedToFloat(
      row['sale amount (rs.)']   ??
      row['sale_amount']         ??
      row['gross amount']        ??
      row['gross_amount'],
    )

  const settlementAmount =
    parsedToFloat(
      row['bank settlement value (rs.) = sum(j:r)'] ??
      row['settlement amount']                       ??
      row['settlement_amount']                       ??
      row['my share (rs.)']                          ??
      row['my_share'],
    )

  const commission =
    parsedToFloat(
      row['commission (rs.)'] ??
      row['commission'],
    )

  const gstOnFees =
    parsedToFloat(
      row['gst on mp fees (rs.)'] ??
      row['tax on commission']     ??
      row['tax_on_commission'],
    )

  const shippingFee =
    parsedToFloat(
      row['shipping fee (rs.)'] ??
      row['shipping charges']   ??
      row['shipping_charges'],
    )

  const sku =
    parsedToStr(
      row['seller sku']  ??
      row['seller_sku']  ??
      row['fsn'],
    )

  return {
    order_id:          orderId          ?? undefined,
    order_date:        orderDate        ?? undefined,
    total_amount:      saleAmount       ?? 0,
    settlement_amount: settlementAmount,
    marketplace_fee:   commission,
    gst_amount:        gstOnFees,
    shipping_amount:   shippingFee,
    sku,
    status:            'pending',
    raw_data:          row,
  }
}

// ─── Myntra row normalizer ────────────────────────────────────────────────────

export function normalizeMyntraRow(row: ParsedData): Partial<Order> {
  return {
    order_id:          parsedToStr(row['order no']       ?? row['order_no']),
    order_date:        parsedToStr(row['order date']      ?? row['order_date']),
    total_amount:      parsedToFloat(row['selling price'] ?? row['selling_price']) ?? 0,
    settlement_amount: parsedToFloat(row['settlement amount'] ?? row['settlement_amount']),
    marketplace_fee:   parsedToFloat(row['commission amount'] ?? row['commission_amount']),
    gst_amount:        parsedToFloat(row['gst amount']    ?? row['gst_amount']),
    shipping_amount:   parsedToFloat(row['shipping amount'] ?? row['shipping_amount']),
    sku:               parsedToStr(row['sku']),
    status:            'pending',
    raw_data:          row,
  }
}

// ─── Meesho row normalizer ────────────────────────────────────────────────────

export function normalizeMeeshoRow(row: ParsedData): Partial<Order> {
  const commission      = parsedToFloat(row['commission']) ?? 0
  const tds             = parsedToFloat(row['tds']) ?? 0
  const delivery        = parsedToFloat(row['delivery charges'] ?? row['delivery_charges']) ?? 0
  const returnCharges   = parsedToFloat(row['return charges']   ?? row['return_charges']) ?? 0
  const reverseShipping = parsedToFloat(row['reverse shipping'] ?? row['reverse_shipping']) ?? 0
  const totalDeductions = commission + tds + delivery + returnCharges + reverseShipping

  return {
    order_id:          parsedToStr(row['order id']      ?? row['order_id']),
    order_date:        parsedToStr(row['order date']     ?? row['order_date']),
    total_amount:      parsedToFloat(row['selling price'] ?? row['selling_price']) ?? 0,
    settlement_amount: parsedToFloat(row['total payment'] ?? row['total_payment']),
    marketplace_fee:   totalDeductions > 0 ? totalDeductions : null,
    gst_amount:        null,
    shipping_amount:   parsedToFloat(row['delivery charges'] ?? row['delivery_charges']),
    sku:               parsedToStr(row['sku']),
    status:            'pending',
    raw_data:          row,
  }
}

// ─── Myntra CSV interfaces ────────────────────────────────────────────────────

export interface MyntraOrderRow {
  store_order_id: string | null
  order_release_id: string | null
  order_line_id: string | null
  seller_order_id: string | null
  order_id_fk: string | null
  created_on: string | null
  style_id: string | null
  seller_sku_code: string | null
  sku_id: string | null
  myntra_sku_code: string | null
  size: string | null
  brand: string | null
  style_name: string | null
  article_type: string | null
  order_status: string | null
  packet_id: string | null
  seller_packet_id: string | null
  courier_code: string | null
  order_tracking_number: string | null
  cancellation_reason: string | null
  packed_on: string | null
  shipped_on: string | null
  delivered_on: string | null
  cancelled_on: string | null
  rto_creation_date: string | null
  return_creation_date: string | null
  final_amount: number | null
  total_mrp: number | null
  discount: number | null
  coupon_discount: number | null
  shipping_charge: number | null
  city: string | null
  state: string | null
  zipcode: string | null
  seller_price: number | null
}

export interface MyntraReturnRow {
  myntra_sku_code: string | null
  seller_sku_code: string | null
  style_id: string | null
  sku_id: string | null
  brand: string | null
  order_created_date: string | null
  order_delivered_date: string | null
  return_created_date: string | null
  refunded_date: string | null
  order_rto_date: string | null
  is_refunded: string | null
  exchange_id: string | null
  order_id: string | null
  order_group_id: string | null
  order_line_id: string | null
  seller_order_id: string | null
  status: string | null
  store_packet_id: string | null
  seller_packet_id_fk: string | null
  quantity: number | null
  return_id: string | null
  return_mode: string | null
  return_reason: string | null
  return_status: string | null
  forward_tracking_number: string | null
  return_tracking_number: string | null
}

export interface MyntraCancellationRow {
  store_order_id: string | null
  order_release_id: string | null
  order_line_id: string | null
  seller_order_id: string | null
  order_id_fk: string | null
  cancellation_reason: string | null
  cancellation_type: string | null
  order_creation_date: string | null
  order_cancellation_date: string | null
  seller_packet_id: string | null
  store_packet_id: string | null
  order_status: string | null
  style_id: string | null
  sku_code: string | null
}

export interface MyntraReturnDeliveryRow {
  order_id: string | null
  order_group_id: string | null
  order_line_id: string | null
  seller_order_id: string | null
  order_created_date: string | null
  customer_delivered_date: string | null
  return_created_date: string | null
  rto_cancel_date: string | null
  myntra_sku_code: string | null
  seller_sku_code: string | null
  style_id: string | null
  brand: string | null
  courier_code: string | null
  type: string | null
  status: string | null
  store_packet_id: string | null
  seller_packet_id_fk: string | null
  return_id: string | null
  return_reason: string | null
  forward_tracking_number_1: string | null
  forward_tracking_number_2: string | null
  return_tracking_number: string | null
  deliver_to_seller_date: string | null
  gatepass_id: string | null
  gatepass_status: string | null
  gatepass_type: string | null
}

// ─── Myntra CSV helpers ───────────────────────────────────────────────────────

/**
 * Parse a single CSV line into an array of field values.
 * Handles quoted fields (which may contain commas or escaped quotes "").
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (inQuotes) {
      if (ch === '"') {
        // Peek ahead: "" is an escaped quote inside a quoted field
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++ // skip the second quote
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }

  fields.push(current)
  return fields
}

/**
 * Normalise a quoted-CSV header (e.g. `"seller id"`) into a snake_case key.
 * Strips surrounding quotes, trims whitespace, lowercases, replaces spaces with _.
 */
function quotedHeaderToKey(raw: string): string {
  return raw
    .replace(/^"|"$/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

/**
 * Read all non-empty lines from a CSV File, skipping a Windows-style BOM.
 */
async function readCsvLines(file: File): Promise<string[]> {
  const text = await file.text()
  return text
    .replace(/^﻿/, '') // strip BOM
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')
}

// ─── Myntra parsers ───────────────────────────────────────────────────────────

export async function parseMyntraOrderFile(file: File): Promise<MyntraOrderRow[]> {
  const lines = await readCsvLines(file)
  if (lines.length < 2) return []

  // Row 0: quoted headers like `"seller id", "warehouse id", ...`
  const rawHeaders = parseCSVLine(lines[0])
  const headers = rawHeaders.map(quotedHeaderToKey)

  const idx = (key: string): number => headers.indexOf(key)

  const g = (fields: string[], key: string): string => {
    const i = idx(key)
    return i >= 0 && i < fields.length ? fields[i].trim() : ''
  }

  const gStr = (fields: string[], key: string): string | null => {
    const v = g(fields, key)
    return v === '' ? null : v
  }

  const gNum = (fields: string[], key: string): number | null => {
    const v = g(fields, key)
    if (v === '') return null
    const n = parseFloat(v.replace(/[^0-9.-]/g, ''))
    return isNaN(n) ? null : n
  }

  return lines.slice(1).map((line): MyntraOrderRow => {
    const f = parseCSVLine(line)

    // strip Myntra's leading ' from store_order_id
    const rawStoreOrderId = g(f, 'store_order_id')
    const storeOrderId = rawStoreOrderId === '' ? null : rawStoreOrderId.replace(/^'/, '').trim() || null

    return {
      store_order_id:      storeOrderId,
      order_release_id:    gStr(f, 'order_release_id'),
      order_line_id:       gStr(f, 'order_line_id'),
      seller_order_id:     gStr(f, 'seller_order_id'),
      order_id_fk:         gStr(f, 'order_id_fk'),
      created_on:          gStr(f, 'created_on'),
      style_id:            gStr(f, 'style_id'),
      seller_sku_code:     gStr(f, 'seller_sku_code'),
      sku_id:              gStr(f, 'sku_id'),
      myntra_sku_code:     gStr(f, 'myntra_sku_code'),
      size:                gStr(f, 'size'),
      brand:               gStr(f, 'brand'),
      style_name:          gStr(f, 'style_name'),
      article_type:        gStr(f, 'article_type'),
      order_status:        gStr(f, 'order_status'),
      packet_id:           gStr(f, 'packet_id'),
      seller_packet_id:    gStr(f, 'seller_packet_id'),
      courier_code:        gStr(f, 'courier_code'),
      order_tracking_number: gStr(f, 'order_tracking_number'),
      cancellation_reason: gStr(f, 'cancellation_reason'),
      packed_on:           gStr(f, 'packed_on'),
      shipped_on:          gStr(f, 'shipped_on'),
      delivered_on:        gStr(f, 'delivered_on'),
      cancelled_on:        gStr(f, 'cancelled_on'),
      rto_creation_date:   gStr(f, 'rto_creation_date'),
      return_creation_date: gStr(f, 'return_creation_date'),
      final_amount:        gNum(f, 'final_amount'),
      total_mrp:           gNum(f, 'total_mrp'),
      discount:            gNum(f, 'discount'),
      coupon_discount:     gNum(f, 'coupon_discount'),
      shipping_charge:     gNum(f, 'shipping_charge'),
      city:                gStr(f, 'city'),
      state:               gStr(f, 'state'),
      zipcode:             gStr(f, 'zipcode'),
      seller_price:        gNum(f, 'seller_price'),
    }
  })
}

export async function parseMyntraReturnFile(file: File): Promise<MyntraReturnRow[]> {
  const lines = await readCsvLines(file)
  if (lines.length < 2) return []

  // Unquoted CSV — headers are already snake_case
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase())

  const idx = (key: string): number => headers.indexOf(key)

  const gStr = (fields: string[], key: string): string | null => {
    const i = idx(key)
    const v = i >= 0 && i < fields.length ? fields[i].trim() : ''
    return v === '' ? null : v
  }

  const gNum = (fields: string[], key: string): number | null => {
    const i = idx(key)
    const v = i >= 0 && i < fields.length ? fields[i].trim() : ''
    if (v === '') return null
    const n = parseFloat(v.replace(/[^0-9.-]/g, ''))
    return isNaN(n) ? null : n
  }

  return lines.slice(1).map((line): MyntraReturnRow => {
    const f = parseCSVLine(line)
    return {
      myntra_sku_code:        gStr(f, 'myntra_sku_code'),
      seller_sku_code:        gStr(f, 'seller_sku_code'),
      style_id:               gStr(f, 'style_id'),
      sku_id:                 gStr(f, 'sku_id'),
      brand:                  gStr(f, 'brand'),
      order_created_date:     gStr(f, 'order_created_date'),
      order_delivered_date:   gStr(f, 'order_delivered_date'),
      return_created_date:    gStr(f, 'return_created_date'),
      refunded_date:          gStr(f, 'refunded_date'),
      order_rto_date:         gStr(f, 'order_rto_date'),
      is_refunded:            gStr(f, 'is_refunded'),
      exchange_id:            gStr(f, 'exchange_id'),
      order_id:               gStr(f, 'order_id'),
      order_group_id:         gStr(f, 'order_group_id'),
      order_line_id:          gStr(f, 'order_line_id'),
      seller_order_id:        gStr(f, 'seller_order_id'),
      status:                 gStr(f, 'status'),
      store_packet_id:        gStr(f, 'store_packet_id'),
      seller_packet_id_fk:    gStr(f, 'seller_packet_id_fk'),
      quantity:               gNum(f, 'quantity'),
      return_id:              gStr(f, 'return_id'),
      return_mode:            gStr(f, 'return_mode'),
      return_reason:          gStr(f, 'return_reason'),
      return_status:          gStr(f, 'return_status'),
      forward_tracking_number: gStr(f, 'forward_tracking_number'),
      return_tracking_number: gStr(f, 'return_tracking_number'),
    }
  })
}

export async function parseMyntraCancellationFile(file: File): Promise<MyntraCancellationRow[]> {
  const lines = await readCsvLines(file)
  if (lines.length < 2) return []

  // Quoted CSV — same normalisation as Orders
  const rawHeaders = parseCSVLine(lines[0])
  const headers = rawHeaders.map(quotedHeaderToKey)

  const idx = (key: string): number => headers.indexOf(key)

  const g = (fields: string[], key: string): string => {
    const i = idx(key)
    return i >= 0 && i < fields.length ? fields[i].trim() : ''
  }

  const gStr = (fields: string[], key: string): string | null => {
    const v = g(fields, key)
    return v === '' ? null : v
  }

  return lines.slice(1).map((line): MyntraCancellationRow => {
    const f = parseCSVLine(line)

    const rawStoreOrderId = g(f, 'store_order_id')
    const storeOrderId = rawStoreOrderId === '' ? null : rawStoreOrderId.replace(/^'/, '').trim() || null

    return {
      store_order_id:        storeOrderId,
      order_release_id:      gStr(f, 'order_release_id'),
      order_line_id:         gStr(f, 'order_line_id'),
      seller_order_id:       gStr(f, 'seller_order_id'),
      order_id_fk:           gStr(f, 'order_id_fk'),
      cancellation_reason:   gStr(f, 'cancellation_reason'),
      cancellation_type:     gStr(f, 'cancellation_type'),
      order_creation_date:   gStr(f, 'order_creation_date'),
      order_cancellation_date: gStr(f, 'order_cancellation_date'),
      seller_packet_id:      gStr(f, 'seller_packet_id'),
      store_packet_id:       gStr(f, 'store_packet_id'),
      order_status:          gStr(f, 'order_status'),
      style_id:              gStr(f, 'style_id'),
      sku_code:              gStr(f, 'sku_code'),
    }
  })
}

export interface MyntraSpfRow {
  order_id: string | null
  seller_id: string | null
  issue_category: string | null    // 'DAMAGED_RETURN' etc
  final_spf_calculations: number | null   // compensation amount ₹
  nod_name: string | null
  utr_amount: number | null
  utr: string | null
  utr_date: string | null
}

export async function parseMyntraSpfFile(file: File): Promise<MyntraSpfRow[]> {
  const lines = await readCsvLines(file)
  if (lines.length < 2) return []

  // Unquoted CSV — headers: order_id,seller_id,issue_category,final_spf_calculations,nod_name,utr_amount,utr,utr_date
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase())

  const idx = (key: string): number => headers.indexOf(key)

  const gStr = (fields: string[], key: string): string | null => {
    const i = idx(key)
    const v = i >= 0 && i < fields.length ? fields[i].trim() : ''
    return v === '' ? null : v
  }

  const gNum = (fields: string[], key: string): number | null => {
    const i = idx(key)
    const v = i >= 0 && i < fields.length ? fields[i].trim() : ''
    if (v === '') return null
    const n = parseFloat(v.replace(/[^0-9.-]/g, ''))
    return isNaN(n) ? null : n
  }

  return lines.slice(1).map((line): MyntraSpfRow => {
    const f = parseCSVLine(line)
    return {
      order_id:                gStr(f, 'order_id'),
      seller_id:               gStr(f, 'seller_id'),
      issue_category:          gStr(f, 'issue_category'),
      final_spf_calculations:  gNum(f, 'final_spf_calculations'),
      nod_name:                gStr(f, 'nod_name'),
      utr_amount:              gNum(f, 'utr_amount'),
      utr:                     gStr(f, 'utr'),
      utr_date:                gStr(f, 'utr_date'),
    }
  })
}

export async function parseMyntraReturnDeliveryFile(file: File): Promise<MyntraReturnDeliveryRow[]> {
  const lines = await readCsvLines(file)
  if (lines.length < 2) return []

  // Unquoted CSV — headers are already snake_case
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase())

  const idx = (key: string): number => headers.indexOf(key)

  const gStr = (fields: string[], key: string): string | null => {
    const i = idx(key)
    const v = i >= 0 && i < fields.length ? fields[i].trim() : ''
    return v === '' ? null : v
  }

  return lines.slice(1).map((line): MyntraReturnDeliveryRow => {
    const f = parseCSVLine(line)
    return {
      order_id:                  gStr(f, 'order_id'),
      order_group_id:            gStr(f, 'order_group_id'),
      order_line_id:             gStr(f, 'order_line_id'),
      seller_order_id:           gStr(f, 'seller_order_id'),
      order_created_date:        gStr(f, 'order_created_date'),
      customer_delivered_date:   gStr(f, 'customer_delivered_date'),
      return_created_date:       gStr(f, 'return_created_date'),
      rto_cancel_date:           gStr(f, 'rto_cancel_date'),
      myntra_sku_code:           gStr(f, 'myntra_sku_code'),
      seller_sku_code:           gStr(f, 'seller_sku_code'),
      style_id:                  gStr(f, 'style_id'),
      brand:                     gStr(f, 'brand'),
      courier_code:              gStr(f, 'courier_code'),
      type:                      gStr(f, 'type'),
      status:                    gStr(f, 'status'),
      store_packet_id:           gStr(f, 'store_packet_id'),
      seller_packet_id_fk:       gStr(f, 'seller_packet_id_fk'),
      return_id:                 gStr(f, 'return_id'),
      return_reason:             gStr(f, 'return_reason'),
      forward_tracking_number_1: gStr(f, 'forward_tracking_number_1'),
      forward_tracking_number_2: gStr(f, 'forward_tracking_number_2'),
      return_tracking_number:    gStr(f, 'return_tracking_number'),
      deliver_to_seller_date:    gStr(f, 'deliver_to_seller_date'),
      gatepass_id:               gStr(f, 'gatepass_id'),
      gatepass_status:           gStr(f, 'gatepass_status'),
      gatepass_type:             gStr(f, 'gatepass_type'),
    }
  })
}

// ─── Row validator ─────────────────────────────────────────────────────────────

export function validateRow(row: ParsedData, marketplace: string): ValidationResult {
  const errors: string[] = []

  switch (marketplace.toLowerCase()) {
    case 'amazon': {
      if (!row['order-id'] && !row['order_id']) errors.push('Missing order-id')
      if (row['amount'] !== null && isNaN(parseFloat(String(row['amount'] ?? '')))) {
        errors.push('Invalid amount')
      }
      break
    }
    case 'flipkart': {
      if (!row['order id'] && !row['order_id']) errors.push('Missing Order ID')
      const grossVal = row['sale amount (rs.)'] ?? row['gross amount'] ?? row['gross_amount']
      if (grossVal !== null && isNaN(parseFloat(String(grossVal ?? '')))) {
        errors.push('Invalid Sale/Gross Amount')
      }
      break
    }
    case 'myntra': {
      if (!row['order no'] && !row['order_no']) errors.push('Missing Order No')
      if (
        row['selling price'] !== null &&
        isNaN(parseFloat(String(row['selling price'] ?? row['selling_price'] ?? '')))
      ) {
        errors.push('Invalid Selling Price')
      }
      break
    }
    case 'meesho': {
      if (!row['order id'] && !row['order_id']) errors.push('Missing order id')
      if (
        row['selling price'] !== null &&
        isNaN(parseFloat(String(row['selling price'] ?? row['selling_price'] ?? '')))
      ) {
        errors.push('Invalid selling price')
      }
      break
    }
    default:
      errors.push(`Unknown marketplace: ${marketplace}`)
  }

  return { valid: errors.length === 0, errors }
}
