// ============================================================
// SKU Tools — Shared Utilities
// ============================================================

import type { Separator } from '../types'

/** Sanitise a segment: uppercase, strip non-alphanumeric */
export function sanitiseSegment(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** Build a SKU from segments, removing empty parts */
export function buildSKU(segments: string[], separator: Separator): string {
  return segments.filter(Boolean).map(sanitiseSegment).filter(Boolean).join(separator)
}

/** Zero-pad a number to the given width */
export function padNumber(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

/** Check if a SKU already exists in a list (case-insensitive) */
export function isDuplicate(sku: string, existing: string[]): boolean {
  const upper = sku.toUpperCase()
  return existing.some((s) => s.toUpperCase() === upper)
}

/** Convert a CSV row object to a display-safe string */
export function rowToCSVLine(values: string[]): string {
  return values.map((v) => (v.includes(',') ? `"${v}"` : v)).join(',')
}

/** Parse a comma-separated string into trimmed, non-empty segments */
export function parseCSVCell(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export const SEPARATORS: { value: Separator; label: string }[] = [
  { value: '-', label: 'Hyphen  (A-B)' },
  { value: '_', label: 'Underscore  (A_B)' },
  { value: '/', label: 'Slash  (A/B)' },
  { value: '.', label: 'Dot  (A.B)' },
]

export const SITE_URL = 'https://ecomsathi.in'

export function canonical(path: string): string {
  return `${SITE_URL}${path}`
}
