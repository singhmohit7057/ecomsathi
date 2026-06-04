// ============================================================
// PDF Service — client-side (pdf-lib) for all ops
// Only compress + OCR call the backend server.
// ============================================================

import { PDFDocument, degrees, rgb, StandardFonts, PageSizes } from 'pdf-lib'

const BACKEND_URL =
  import.meta.env.VITE_PROCESSING_API_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  'http://localhost:3001'

// ─── helpers ─────────────────────────────────────────────────────────────────

function blobToResult(blob: Blob, filename: string) {
  return { url: URL.createObjectURL(blob), filename, size: blob.size }
}

function uint8ToResult(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  return blobToResult(blob, filename)
}

async function post(endpoint: string, formData: FormData): Promise<Blob> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      (body as { message?: string; error?: string }).message ??
        (body as { error?: string }).error ??
        `Server error ${res.status}`,
    )
  }
  return res.blob()
}

/** Parse a range string like "1-3,5,7-9" into 0-indexed page indices */
function parseRanges(input: string, pageCount: number): number[] {
  const indices = new Set<number>()
  input.split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number)
      for (let i = Math.max(1, a); i <= Math.min(pageCount, b); i++) indices.add(i - 1)
    } else {
      const n = Number(part)
      if (n >= 1 && n <= pageCount) indices.add(n - 1)
    }
  })
  return Array.from(indices).sort((a, b) => a - b)
}

// ─── MERGE ────────────────────────────────────────────────────────────────────

export async function mergePDFs(files: File[]) {
  const merged = await PDFDocument.create()
  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const doc = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    pages.forEach(p => merged.addPage(p))
  }
  const out = await merged.save()
  return uint8ToResult(out, 'merged.pdf')
}

// ─── SPLIT ────────────────────────────────────────────────────────────────────

export async function splitPDF(
  file: File,
  mode: string,
  ranges?: string,
  everyN?: number,
) {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes)
  const total = src.getPageCount()

  // Build list of page-index groups
  let groups: number[][] = []

  if (mode === 'individual') {
    groups = src.getPageIndices().map(i => [i])
  } else if (mode === 'every-n' && everyN && everyN > 0) {
    for (let i = 0; i < total; i += everyN) {
      groups.push(src.getPageIndices().slice(i, i + everyN))
    }
  } else {
    // ranges mode — each comma-separated token becomes one PDF
    const tokens = (ranges ?? '').split(',').map(s => s.trim()).filter(Boolean)
    groups = tokens.map(token => {
      if (token.includes('-')) {
        const [a, b] = token.split('-').map(Number)
        const result: number[] = []
        for (let i = Math.max(1, a); i <= Math.min(total, b); i++) result.push(i - 1)
        return result
      }
      const n = Number(token)
      return (n >= 1 && n <= total) ? [n - 1] : []
    }).filter(g => g.length > 0)
    if (groups.length === 0) groups = [src.getPageIndices()]
  }

  if (groups.length === 1) {
    // Single output — return as PDF directly
    const out = await PDFDocument.create()
    const pages = await out.copyPages(src, groups[0])
    pages.forEach(p => out.addPage(p))
    return uint8ToResult(await out.save(), 'split.pdf')
  }

  // Multiple outputs — zip them
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  for (let i = 0; i < groups.length; i++) {
    const out = await PDFDocument.create()
    const pages = await out.copyPages(src, groups[i])
    pages.forEach(p => out.addPage(p))
    zip.file(`part_${String(i + 1).padStart(2, '0')}.pdf`, await out.save())
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  return blobToResult(zipBlob, 'split.zip')
}

// ─── CROP ─────────────────────────────────────────────────────────────────────

export async function cropPDF(
  file: File,
  left: number,
  top: number,
  right: number,
  bottom: number,
  pages: string,
) {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  const total = doc.getPageCount()

  const targetIndices = pages.toLowerCase() === 'all'
    ? doc.getPageIndices()
    : parseRanges(pages, total)

  const targetSet = new Set(targetIndices)

  doc.getPages().forEach((page, i) => {
    if (!targetSet.has(i)) return
    const { x, y, width, height } = page.getMediaBox()
    page.setCropBox(
      x + left,
      y + bottom,
      width - left - right,
      height - top - bottom,
    )
  })

  return uint8ToResult(await doc.save(), 'cropped.pdf')
}

// ─── OCR ──────────────────────────────────────────────────────────────────────
// OCR requires server-side Tesseract — calls backend

export async function ocrPDF(file: File, lang: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('lang', lang)
  const blob = await post('/api/pdf/ocr', fd)
  return blobToResult(blob, 'ocr-output.pdf')
}

// ─── COMPRESS ─────────────────────────────────────────────────────────────────
// Compression requires server-side Ghostscript — calls backend

export async function compressPDF(file: File, level: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('level', level)
  const blob = await post('/api/pdf/compress', fd)
  return blobToResult(blob, 'compressed.pdf')
}

// ─── REMOVE PASSWORD ──────────────────────────────────────────────────────────

export async function removePassword(file: File, password: string) {
  const bytes = await file.arrayBuffer()
  try {
    const doc = await PDFDocument.load(bytes, { password })
    // Re-save without encryption
    const out = await doc.save()
    return uint8ToResult(out, 'unlocked.pdf')
  } catch {
    throw new Error('Incorrect password. Please check and try again.')
  }
}

// ─── ROTATE ───────────────────────────────────────────────────────────────────

export async function rotatePDF(file: File, angle: number, pages: string) {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  const total = doc.getPageCount()

  const targetIndices = pages.toLowerCase() === 'all'
    ? doc.getPageIndices()
    : parseRanges(pages, total)

  const targetSet = new Set(targetIndices)
  doc.getPages().forEach((page, i) => {
    if (!targetSet.has(i)) return
    page.setRotation(degrees((page.getRotation().angle + angle) % 360))
  })

  return uint8ToResult(await doc.save(), 'rotated.pdf')
}

// ─── EXTRACT PAGES ────────────────────────────────────────────────────────────

export async function extractPages(file: File, pages: string) {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes)
  const indices = parseRanges(pages, src.getPageCount())
  if (indices.length === 0) throw new Error('No valid pages specified.')

  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, indices)
  copied.forEach(p => out.addPage(p))

  return uint8ToResult(await out.save(), 'extracted.pdf')
}

// ─── REARRANGE PAGES ──────────────────────────────────────────────────────────

export async function rearrangePages(file: File, order: number[]) {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes)
  const total = src.getPageCount()

  // order is 1-indexed from user
  const indices = order.map(n => n - 1).filter(i => i >= 0 && i < total)
  if (indices.length === 0) throw new Error('No valid page order specified.')

  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, indices)
  copied.forEach(p => out.addPage(p))

  return uint8ToResult(await out.save(), 'rearranged.pdf')
}

// ─── PDF TO IMAGES ────────────────────────────────────────────────────────────
// Requires pdfjs-dist for rendering — calls backend for multi-page ZIP

export async function pdfToImages(file: File, format: string, dpi: number) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('format', format)
  fd.append('dpi', String(dpi))
  const blob = await post('/api/pdf/to-images', fd)
  return blobToResult(blob, `pdf-images.zip`)
}

// ─── IMAGES TO PDF ────────────────────────────────────────────────────────────

export async function imagesToPDF(images: File[]) {
  const doc = await PDFDocument.create()

  for (const imgFile of images) {
    const bytes = await imgFile.arrayBuffer()
    const mime = imgFile.type.toLowerCase()

    let img
    if (mime === 'image/png' || imgFile.name.toLowerCase().endsWith('.png')) {
      img = await doc.embedPng(bytes)
    } else {
      // jpeg or webp — pdf-lib handles jpeg natively; webp convert via canvas
      if (mime === 'image/webp' || imgFile.name.toLowerCase().endsWith('.webp')) {
        const jpegBytes = await webpToJpeg(imgFile)
        img = await doc.embedJpg(jpegBytes)
      } else {
        img = await doc.embedJpg(bytes)
      }
    }

    const page = doc.addPage([img.width, img.height])
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
  }

  return uint8ToResult(await doc.save(), 'images.pdf')
}

async function webpToJpeg(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Could not convert WebP to JPEG')); return }
        blob.arrayBuffer().then(resolve).catch(reject)
      }, 'image/jpeg', 0.92)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image')) }
    img.src = url
  })
}

// ─── WATERMARK ────────────────────────────────────────────────────────────────

export async function watermarkPDF(
  file: File,
  text: string,
  position: string,
  opacity: number,
  fontSize: number,
  color: string,
  rotation: number,
) {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)

  // Parse hex color → rgb 0-1
  const r = parseInt(color.slice(1, 3), 16) / 255
  const g = parseInt(color.slice(3, 5), 16) / 255
  const b = parseInt(color.slice(5, 7), 16) / 255

  doc.getPages().forEach(page => {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)
    const textHeight = font.heightAtSize(fontSize)

    let x = width / 2 - textWidth / 2
    let y = height / 2 - textHeight / 2
    const pad = 30

    if (position === 'top-left')      { x = pad;                    y = height - textHeight - pad }
    if (position === 'top-center')    { x = width / 2 - textWidth / 2; y = height - textHeight - pad }
    if (position === 'top-right')     { x = width - textWidth - pad; y = height - textHeight - pad }
    if (position === 'bottom-left')   { x = pad;                    y = pad }
    if (position === 'bottom-center') { x = width / 2 - textWidth / 2; y = pad }
    if (position === 'bottom-right')  { x = width - textWidth - pad; y = pad }
    if (position === 'diagonal')      { x = width / 2 - textWidth / 2; y = height / 2 - textHeight / 2 }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity: opacity / 100,
      rotate: degrees(position === 'diagonal' ? 45 : rotation),
    })
  })

  return uint8ToResult(await doc.save(), 'watermarked.pdf')
}

// ─── PAGE NUMBERS ─────────────────────────────────────────────────────────────

export async function addPageNumbers(
  file: File,
  position: string,
  startNumber: number,
  prefix: string,
  suffix: string,
  fontSize: number,
  color: string,
  skipFirst: boolean,
) {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)

  const r = parseInt(color.slice(1, 3), 16) / 255
  const g = parseInt(color.slice(3, 5), 16) / 255
  const b = parseInt(color.slice(5, 7), 16) / 255

  doc.getPages().forEach((page, i) => {
    if (skipFirst && i === 0) return
    const { width, height } = page.getSize()
    const pageNum = startNumber + (skipFirst ? i : i)
    const label = `${prefix}${pageNum}${suffix}`
    const textWidth = font.widthOfTextAtSize(label, fontSize)
    const pad = 20

    let x = width / 2 - textWidth / 2
    let y = pad

    if (position === 'top-left')      { x = pad;                       y = height - pad - fontSize }
    if (position === 'top-center')    { x = width / 2 - textWidth / 2; y = height - pad - fontSize }
    if (position === 'top-right')     { x = width - textWidth - pad;   y = height - pad - fontSize }
    if (position === 'bottom-left')   { x = pad;                       y = pad }
    if (position === 'bottom-center') { x = width / 2 - textWidth / 2; y = pad }
    if (position === 'bottom-right')  { x = width - textWidth - pad;   y = pad }

    page.drawText(label, { x, y, size: fontSize, font, color: rgb(r, g, b) })
  })

  return uint8ToResult(await doc.save(), 'numbered.pdf')
}
