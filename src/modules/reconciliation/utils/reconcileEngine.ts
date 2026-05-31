// ============================================================
// EcomSathi — Reconciliation Engine
// ============================================================

import type { Order, Settlement } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatchResult {
  order: Order
  settlement: Settlement | null
  matchType: 'exact' | 'fuzzy' | 'unmatched'
}

export interface DiscrepancyItem {
  order_id: string
  order_amount: number
  settlement_amount: number | null
  expected_fee: number | null
  actual_fee: number | null
  fee_discrepancy: number | null
  flags: DiscrepancyFlag[]
}

export type DiscrepancyFlag =
  | 'missing_payment'
  | 'over_deduction'
  | 'under_settlement'
  | 'fee_discrepancy'
  | 'gst_mismatch'

export interface DiscrepancyReport {
  items: DiscrepancyItem[]
  totalDiscrepancyAmount: number
  totalFeeDiscrepancy: number
  missingPaymentCount: number
  overDeductionCount: number
}

export interface ReconciliationSummary {
  totalOrders: number
  matchedCount: number
  unmatchedOrderCount: number
  unmatchedSettlementCount: number
  exactMatchCount: number
  fuzzyMatchCount: number
  totalOrdersAmount: number
  totalSettlementsAmount: number
  discrepancyAmount: number
  matchedPairs: MatchResult[]
  unmatchedOrders: Order[]
  unmatchedSettlements: Settlement[]
  discrepancyReport: DiscrepancyReport
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DATE_WINDOW_DAYS = 3
const FEE_DISCREPANCY_THRESHOLD = 10 // INR — flag if fee diff > ₹10
const AMOUNT_FUZZY_TOLERANCE = 0.5 // ₹0.50 rounding tolerance

// ─── Date utilities ───────────────────────────────────────────────────────────

function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

function daysDiff(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)
}

// ─── Match orders to settlements ──────────────────────────────────────────────

export function matchOrdersToSettlements(
  orders: Order[],
  settlements: Settlement[],
): MatchResult[] {
  // Build maps for O(1) lookup
  const exactMap = new Map<string, Settlement>()
  const usedSettlements = new Set<string>()

  for (const s of settlements) {
    if (s.order_id) {
      exactMap.set(s.order_id.trim(), s)
    }
  }

  const results: MatchResult[] = []
  const unmatchedSettlementsById = new Map<string, Settlement>(
    settlements.map((s) => [s.id, s]),
  )

  for (const order of orders) {
    const key = order.order_id?.trim()

    // ── 1. Exact match on order_id ─────────────────────────────────────────
    if (key && exactMap.has(key)) {
      const settlement = exactMap.get(key)!
      usedSettlements.add(settlement.id)
      unmatchedSettlementsById.delete(settlement.id)
      results.push({ order, settlement, matchType: 'exact' })
      continue
    }

    // ── 2. Fuzzy match: amount within tolerance + date window ──────────────
    const orderDate = parseDate(order.order_date)
    const orderAmount = order.total_amount

    let fuzzyMatch: Settlement | null = null

    for (const s of settlements) {
      if (usedSettlements.has(s.id)) continue

      const settlementDate = parseDate(s.settlement_date)
      const amountClose =
        Math.abs((s.amount ?? 0) - orderAmount) <= AMOUNT_FUZZY_TOLERANCE

      const dateClose =
        !orderDate || !settlementDate || daysDiff(orderDate, settlementDate) <= DATE_WINDOW_DAYS

      if (amountClose && dateClose) {
        fuzzyMatch = s
        break
      }
    }

    if (fuzzyMatch) {
      usedSettlements.add(fuzzyMatch.id)
      unmatchedSettlementsById.delete(fuzzyMatch.id)
      results.push({ order, settlement: fuzzyMatch, matchType: 'fuzzy' })
      continue
    }

    // ── 3. No match ────────────────────────────────────────────────────────
    results.push({ order, settlement: null, matchType: 'unmatched' })
  }

  return results
}

// ─── Calculate discrepancies ──────────────────────────────────────────────────

export function calculateDiscrepancies(
  matched: MatchResult[],
): DiscrepancyReport {
  const items: DiscrepancyItem[] = []
  let totalDiscrepancyAmount = 0
  let totalFeeDiscrepancy = 0
  let missingPaymentCount = 0
  let overDeductionCount = 0

  const GST_RATE_APPROX = 0.18

  for (const { order, settlement } of matched) {
    const orderAmount = order.total_amount
    const settlementAmount = settlement?.amount ?? null
    const actualFee = order.marketplace_fee ?? null
    const expectedFee = orderAmount * 0.02 // generic 2% estimate if not known

    const flags: DiscrepancyFlag[] = []

    // Missing payment
    if (!settlement) {
      flags.push('missing_payment')
      missingPaymentCount++
    }

    // Under-settlement
    if (
      settlementAmount !== null &&
      orderAmount > 0 &&
      settlementAmount < orderAmount - AMOUNT_FUZZY_TOLERANCE
    ) {
      flags.push('under_settlement')
    }

    // Over-deduction (settlement < 50% of order amount)
    if (
      settlementAmount !== null &&
      orderAmount > 0 &&
      settlementAmount < orderAmount * 0.5
    ) {
      flags.push('over_deduction')
      overDeductionCount++
    }

    // Fee discrepancy
    let feeDiscrepancy: number | null = null
    if (actualFee !== null) {
      feeDiscrepancy = Math.abs(actualFee - expectedFee)
      if (feeDiscrepancy > FEE_DISCREPANCY_THRESHOLD) {
        flags.push('fee_discrepancy')
        totalFeeDiscrepancy += feeDiscrepancy
      }
    }

    // GST mismatch heuristic
    const expectedGst = settlementAmount !== null ? settlementAmount * GST_RATE_APPROX : null
    const actualGst = order.gst_amount
    if (
      expectedGst !== null &&
      actualGst !== null &&
      Math.abs(actualGst - expectedGst) > FEE_DISCREPANCY_THRESHOLD
    ) {
      flags.push('gst_mismatch')
    }

    const discrepancy =
      settlementAmount !== null ? Math.abs(orderAmount - settlementAmount) : orderAmount

    totalDiscrepancyAmount += discrepancy

    items.push({
      order_id: order.order_id,
      order_amount: orderAmount,
      settlement_amount: settlementAmount,
      expected_fee: expectedFee,
      actual_fee: actualFee,
      fee_discrepancy: feeDiscrepancy,
      flags,
    })
  }

  return {
    items,
    totalDiscrepancyAmount,
    totalFeeDiscrepancy,
    missingPaymentCount,
    overDeductionCount,
  }
}

// ─── Generate full reconciliation summary ────────────────────────────────────

export function generateReport(
  results: MatchResult[],
  discrepancies: DiscrepancyReport,
): ReconciliationSummary {
  const matchedPairs = results.filter((r) => r.settlement !== null)
  const unmatchedOrders = results
    .filter((r) => r.settlement === null)
    .map((r) => r.order)

  const exactMatchCount = results.filter((r) => r.matchType === 'exact').length
  const fuzzyMatchCount = results.filter((r) => r.matchType === 'fuzzy').length

  const totalOrdersAmount = results.reduce((sum, r) => sum + r.order.total_amount, 0)
  const totalSettlementsAmount = matchedPairs.reduce(
    (sum, r) => sum + (r.settlement?.amount ?? 0),
    0,
  )

  return {
    totalOrders: results.length,
    matchedCount: matchedPairs.length,
    unmatchedOrderCount: unmatchedOrders.length,
    unmatchedSettlementCount: 0, // populated externally if needed
    exactMatchCount,
    fuzzyMatchCount,
    totalOrdersAmount,
    totalSettlementsAmount,
    discrepancyAmount: discrepancies.totalDiscrepancyAmount,
    matchedPairs,
    unmatchedOrders,
    unmatchedSettlements: [],
    discrepancyReport: discrepancies,
  }
}

// ─── Estimate missing payments ────────────────────────────────────────────────

export function estimateMissingPayments(
  orders: Order[],
  cutoffDays: number,
): Order[] {
  const now = new Date()

  return orders.filter((order) => {
    // Only consider orders with no settlement
    if (order.status === 'matched') return false

    const orderDate = parseDate(order.order_date)
    if (!orderDate) return false

    const daysElapsed = daysDiff(now, orderDate)
    return daysElapsed >= cutoffDays
  })
}
