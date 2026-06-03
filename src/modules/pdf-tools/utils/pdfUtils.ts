// ============================================================
// PDF Tools — Shared Utilities
// ============================================================

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export function isImage(file: File): boolean {
  return file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i.test(file.name)
}

/** Parse a page-range string like "1,3-5,7" → [1,3,4,5,7] (1-indexed). */
export function parsePageRanges(input: string, maxPage: number): number[] {
  const pages = new Set<number>()
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean)
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number)
      const start = Math.max(1, a)
      const end = Math.min(maxPage, b)
      for (let i = start; i <= end; i++) pages.add(i)
    } else {
      const n = Number(part)
      if (n >= 1 && n <= maxPage) pages.add(n)
    }
  }
  return Array.from(pages).sort((a, b) => a - b)
}

/** Validate a page-range string. Returns error message or null. */
export function validatePageRanges(input: string, maxPage: number): string | null {
  if (!input.trim()) return 'Enter at least one page or range.'
  const pages = parsePageRanges(input, maxPage)
  if (pages.length === 0) return `No valid pages found. Enter numbers between 1 and ${maxPage}.`
  return null
}

export const ACCEPTED_PDF: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
}

export const ACCEPTED_IMAGES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

export const SITE_URL = 'https://ecomsathi.in'

/** Build canonical URL. */
export function canonical(path: string): string {
  return `${SITE_URL}${path}`
}
