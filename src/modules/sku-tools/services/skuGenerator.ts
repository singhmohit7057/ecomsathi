// ============================================================
// SKU Generator Service
// ============================================================

import type { SKUFormData, VariantSKUInput, VariantSKURow, Separator } from '../types'

function clean(val: string): string {
  return val.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

function abbrev(val: string, maxLen = 3): string {
  const cleaned = clean(val)
  return cleaned.slice(0, maxLen)
}

export function generateSingleSKU(data: SKUFormData): string {
  const parts: string[] = []

  if (data.prefix) parts.push(clean(data.prefix))
  if (data.brand) parts.push(abbrev(data.brand, 3))
  if (data.productName) parts.push(abbrev(data.productName, 3))
  if (data.category) parts.push(abbrev(data.category, 3))
  if (data.color) parts.push(abbrev(data.color, 3))
  if (data.size) parts.push(abbrev(data.size, 2))
  if (data.autoNumber) {
    parts.push(String(data.sequence).padStart(Math.max(data.skuLength - parts.join('').length - parts.length, 2), '0'))
  }
  if (data.suffix) parts.push(clean(data.suffix))

  return parts.filter(Boolean).join(data.separator)
}

export function generateVariantSKUs(input: VariantSKUInput): VariantSKURow[] {
  const rows: VariantSKURow[] = []
  const base = abbrev(input.productName || 'PROD', 3)
  const brandPart = input.brand ? abbrev(input.brand, 3) : ''

  const colors = input.colors.filter(Boolean)
  const sizes = input.sizes.filter(Boolean)
  const materials = input.materials.filter(Boolean)
  const genders = input.genders.filter(Boolean)

  const effectiveColors = colors.length ? colors : ['']
  const effectiveSizes = sizes.length ? sizes : ['']
  const effectiveMaterials = materials.length ? materials : ['']
  const effectiveGenders = genders.length ? genders : ['']

  for (const color of effectiveColors) {
    for (const size of effectiveSizes) {
      for (const material of effectiveMaterials) {
        for (const gender of effectiveGenders) {
          const parts = [brandPart, base]
          if (color) parts.push(abbrev(color, 3))
          if (size) parts.push(abbrev(size, 2))
          if (material) parts.push(abbrev(material, 3))
          if (gender) parts.push(abbrev(gender, 1))

          rows.push({
            sku: parts.filter(Boolean).join(input.separator),
            color,
            size,
            material,
            gender,
          })
        }
      }
    }
  }

  return rows
}

export function buildCustomSKU(
  pattern: string,
  fields: Record<string, string>,
  counter: number,
  separator: Separator,
): string {
  const year = new Date().getFullYear()
  return pattern
    .replace(/\{BRAND\}/gi, clean(fields.brand || 'BRD'))
    .replace(/\{CATEGORY\}/gi, clean(fields.category || 'CAT'))
    .replace(/\{COLOR\}/gi, clean(fields.color || 'BLK'))
    .replace(/\{SIZE\}/gi, clean(fields.size || 'M'))
    .replace(/\{PREFIX\}/gi, clean(fields.prefix || 'PRE'))
    .replace(/\{SUFFIX\}/gi, clean(fields.suffix || 'SFX'))
    .replace(/\{YEAR\}/gi, String(year))
    .replace(/\{AUTO_NUMBER:(\d+)\}/gi, (_m: string, d: string) => String(counter).padStart(parseInt(d, 10), '0'))
    .replace(/\{AUTO_NUMBER\}/gi, String(counter).padStart(4, '0'))
    .replace(/\{NUMBER:(\d+)\}/gi, (_m: string, d: string) => String(counter).padStart(parseInt(d, 10), '0'))
    .replace(/\{NUMBER\}/gi, String(counter).padStart(4, '0'))
}

export function validateSKU(sku: string): { valid: boolean; reason?: string } {
  if (!sku || sku.trim() === '') return { valid: false, reason: 'SKU is empty' }
  if (sku.length < 3) return { valid: false, reason: 'SKU too short (min 3 chars)' }
  if (sku.length > 50) return { valid: false, reason: 'SKU too long (max 50 chars)' }
  if (/\s/.test(sku)) return { valid: false, reason: 'SKU must not contain spaces' }
  return { valid: true }
}

export function deduplicateSKUs(skus: string[]): { duplicates: string[]; unique: string[] } {
  const seen = new Set<string>()
  const duplicates: string[] = []
  const unique: string[] = []
  for (const sku of skus) {
    if (seen.has(sku)) {
      duplicates.push(sku)
    } else {
      seen.add(sku)
      unique.push(sku)
    }
  }
  return { duplicates, unique }
}
