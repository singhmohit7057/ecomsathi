// ============================================================
// EcomSathi — Reconciliation CSV/Excel Parser Utilities
// ============================================================

import type { Order } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedData {
  [key: string]: string | number | null
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ─── Marketplace signature column sets ───────────────────────────────────────

const AMAZON_SIGNATURE_COLS = ['settlement-id', 'transaction-type', 'order-id', 'fulfillment-id']
const FLIPKART_SIGNATURE_COLS = ['order id', 'sub order id', 'fsn', 'commission']
const MYNTRA_SIGNATURE_COLS = ['order no', 'awb', 'selling price', 'commission amount']
const MEESHO_SIGNATURE_COLS = ['order id', 'sub order id', 'commission', 'tds', 'reverse shipping']

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

// ─── Parse file (CSV or XLSX) ─────────────────────────────────────────────────

export async function parseMarketplaceFile(
  file: File,
  _marketplace: string,
): Promise<ParsedData[]> {
  const XLSX = await import('xlsx')

  const isXlsx =
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.name.endsWith('.xlsx') ||
    file.name.endsWith('.xls') ||
    file.type === 'application/vnd.ms-excel'

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, raw: false })

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('File has no sheets')

  const sheet = workbook.Sheets[sheetName]
  const rawRows: Record<string, string | number | boolean | Date | null>[] = XLSX.utils.sheet_to_json(
    sheet,
    { defval: null, raw: !isXlsx },
  )

  // Normalize keys: lowercase + trim
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

// ─── Normalize helpers ────────────────────────────────────────────────────────

function toFloat(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined || val === '') return null
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? null : n
}

function toStr(val: string | number | null | undefined): string | null {
  if (val === null || val === undefined) return null
  return String(val).trim() || null
}

// ─── Amazon row normalizer ────────────────────────────────────────────────────

export function normalizeAmazonRow(row: ParsedData): Partial<Order> {
  return {
    order_id: toStr(row['order-id'] ?? row['order_id']),
    order_date: toStr(row['posted-date'] ?? row['posted_date'] ?? row['settlement-start-date']),
    total_amount: toFloat(row['amount'] ?? row['price-of-items-sold']),
    settlement_amount: toFloat(row['total-amount'] ?? row['amount']),
    marketplace_fee: toFloat(row['item-related-fee-amount']),
    gst_amount: toFloat(row['other-transaction-fee-amount']),
    sku: toStr(row['sku']),
    status: 'pending',
    raw_data: row,
  }
}

// ─── Flipkart row normalizer ──────────────────────────────────────────────────

export function normalizeFlipkartRow(row: ParsedData): Partial<Order> {
  return {
    order_id: toStr(row['order id'] ?? row['order_id']),
    order_date: toStr(row['order date'] ?? row['order_date']),
    total_amount: toFloat(row['gross amount'] ?? row['gross_amount']),
    settlement_amount: toFloat(row['settlement amount'] ?? row['settlement_amount']),
    marketplace_fee: toFloat(row['commission']),
    gst_amount: toFloat(
      row['tax on commission'] ?? row['tax_on_commission'],
    ),
    shipping_amount: toFloat(row['shipping charges'] ?? row['shipping_charges']),
    sku: toStr(row['fsn']),
    status: 'pending',
    raw_data: row,
  }
}

// ─── Myntra row normalizer ────────────────────────────────────────────────────

export function normalizeMyntraRow(row: ParsedData): Partial<Order> {
  return {
    order_id: toStr(row['order no'] ?? row['order_no']),
    order_date: toStr(row['order date'] ?? row['order_date']),
    total_amount: toFloat(row['selling price'] ?? row['selling_price']),
    settlement_amount: toFloat(row['settlement amount'] ?? row['settlement_amount']),
    marketplace_fee: toFloat(row['commission amount'] ?? row['commission_amount']),
    gst_amount: toFloat(row['gst amount'] ?? row['gst_amount']),
    shipping_amount: toFloat(row['shipping amount'] ?? row['shipping_amount']),
    sku: toStr(row['sku']),
    status: 'pending',
    raw_data: row,
  }
}

// ─── Meesho row normalizer ────────────────────────────────────────────────────

export function normalizeMeeshoRow(row: ParsedData): Partial<Order> {
  const commission = toFloat(row['commission']) ?? 0
  const tds = toFloat(row['tds']) ?? 0
  const delivery = toFloat(row['delivery charges'] ?? row['delivery_charges']) ?? 0
  const returnCharges = toFloat(row['return charges'] ?? row['return_charges']) ?? 0
  const reverseShipping = toFloat(row['reverse shipping'] ?? row['reverse_shipping']) ?? 0
  const totalDeductions = commission + tds + delivery + returnCharges + reverseShipping

  return {
    order_id: toStr(row['order id'] ?? row['order_id']),
    order_date: toStr(row['order date'] ?? row['order_date']),
    total_amount: toFloat(row['selling price'] ?? row['selling_price']),
    settlement_amount: toFloat(row['total payment'] ?? row['total_payment']),
    marketplace_fee: totalDeductions > 0 ? totalDeductions : null,
    gst_amount: null,
    shipping_amount: toFloat(row['delivery charges'] ?? row['delivery_charges']),
    sku: toStr(row['sku']),
    status: 'pending',
    raw_data: row,
  }
}

// ─── Row validator ────────────────────────────────────────────────────────────

export function validateRow(
  row: ParsedData,
  marketplace: string,
): ValidationResult {
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
      if (
        row['gross amount'] !== null &&
        isNaN(parseFloat(String(row['gross amount'] ?? row['gross_amount'] ?? '')))
      ) {
        errors.push('Invalid Gross Amount')
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
