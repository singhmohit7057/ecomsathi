// ============================================================
// CSV / XLSX Processor for Bulk SKU Generation
// ============================================================

import type { BulkSKURow } from '../types'

export interface ParseResult {
  rows: BulkSKURow[]
  errors: string[]
  total: number
}

const EXPECTED_HEADERS = ['productName', 'brand', 'color', 'size', 'category']
const HEADER_ALIASES: Record<string, keyof BulkSKURow> = {
  'product name': 'productName',
  'product': 'productName',
  'productname': 'productName',
  'brand': 'brand',
  'colour': 'color',
  'color': 'color',
  'size': 'size',
  'category': 'category',
  'cat': 'category',
}

function normalizeHeader(h: string): keyof BulkSKURow | null {
  return HEADER_ALIASES[h.toLowerCase().trim()] ?? null
}

export function parseCSVText(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length < 2) {
    return { rows: [], errors: ['CSV must have a header row and at least one data row.'], total: 0 }
  }

  const headerLine = lines[0]
  const rawHeaders = headerLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  const headers = rawHeaders.map(normalizeHeader)

  if (!headers.some(Boolean)) {
    return {
      rows: [],
      errors: [`Could not recognize column headers. Expected: ${EXPECTED_HEADERS.join(', ')}`],
      total: 0,
    }
  }

  const rows: BulkSKURow[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i])
    const row: BulkSKURow = {
      productName: '',
      brand: '',
      color: '',
      size: '',
      category: '',
    }

    headers.forEach((key, colIdx) => {
      if (key && cells[colIdx] !== undefined) {
        (row as Record<string, string>)[key] = cells[colIdx].trim().replace(/^"|"$/g, '')
      }
    })

    if (!row.productName && !row.brand) {
      errors.push(`Row ${i + 1}: Skipped — no product name or brand`)
      continue
    }

    rows.push(row)
  }

  return { rows, errors, total: rows.length }
}

function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export function rowsToCSV(rows: BulkSKURow[]): string {
  const headers = ['productName', 'brand', 'color', 'size', 'category', 'generatedSKU']
  const lines = [headers.join(',')]
  for (const row of rows) {
    const cells = headers.map((h) => {
      const val = String((row as Record<string, unknown>)[h] ?? '')
      return val.includes(',') ? `"${val}"` : val
    })
    lines.push(cells.join(','))
  }
  return lines.join('\n')
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function generateSampleCSV(): string {
  return [
    'productName,brand,color,size,category',
    'T-Shirt,Nike,Black,M,Apparel',
    'Running Shoes,Adidas,Red,42,Footwear',
    'Backpack,Wildcraft,Blue,One Size,Bags',
  ].join('\n')
}
