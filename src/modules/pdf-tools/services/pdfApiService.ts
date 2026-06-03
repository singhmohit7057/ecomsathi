// ============================================================
// PDF API Service — thin wrappers around backend endpoints
// ============================================================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://api.ecomsathi.in'

async function post(endpoint: string, formData: FormData): Promise<Blob> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, { method: 'POST', body: formData })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `Server error ${res.status}`)
  }
  return res.blob()
}

function blobToResult(blob: Blob, filename: string) {
  return { url: URL.createObjectURL(blob), filename, size: blob.size }
}

export async function mergePDFs(files: File[]) {
  const fd = new FormData()
  files.forEach((f) => fd.append('files', f))
  const blob = await post('/api/pdf/merge', fd)
  return blobToResult(blob, 'merged.pdf')
}

export async function splitPDF(file: File, mode: string, ranges?: string, everyN?: number) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('mode', mode)
  if (ranges) fd.append('ranges', ranges)
  if (everyN != null) fd.append('everyN', String(everyN))
  const blob = await post('/api/pdf/split', fd)
  return blobToResult(blob, 'split.zip')
}

export async function cropPDF(file: File, x: number, y: number, width: number, height: number, pages: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('x', String(x))
  fd.append('y', String(y))
  fd.append('width', String(width))
  fd.append('height', String(height))
  fd.append('pages', pages)
  const blob = await post('/api/pdf/crop', fd)
  return blobToResult(blob, 'cropped.pdf')
}

export async function ocrPDF(file: File, lang: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('lang', lang)
  const blob = await post('/api/pdf/ocr', fd)
  return blobToResult(blob, 'ocr-output.pdf')
}

export async function compressPDF(file: File, level: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('level', level)
  const blob = await post('/api/pdf/compress', fd)
  return blobToResult(blob, 'compressed.pdf')
}

export async function removePassword(file: File, password: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('password', password)
  const blob = await post('/api/pdf/remove-password', fd)
  return blobToResult(blob, 'unlocked.pdf')
}

export async function rotatePDF(file: File, angle: number, pages: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('angle', String(angle))
  fd.append('pages', pages)
  const blob = await post('/api/pdf/rotate', fd)
  return blobToResult(blob, 'rotated.pdf')
}

export async function extractPages(file: File, pages: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('pages', pages)
  const blob = await post('/api/pdf/extract-pages', fd)
  return blobToResult(blob, 'extracted.pdf')
}

export async function rearrangePages(file: File, order: number[]) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('order', JSON.stringify(order))
  const blob = await post('/api/pdf/rearrange', fd)
  return blobToResult(blob, 'rearranged.pdf')
}

export async function pdfToImages(file: File, format: string, dpi: number) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('format', format)
  fd.append('dpi', String(dpi))
  const blob = await post('/api/pdf/to-images', fd)
  return blobToResult(blob, 'pdf-images.zip')
}

export async function imagesToPDF(images: File[]) {
  const fd = new FormData()
  images.forEach((f) => fd.append('files', f))
  const blob = await post('/api/pdf/images-to-pdf', fd)
  return blobToResult(blob, 'images.pdf')
}

export async function watermarkPDF(
  file: File,
  text: string,
  position: string,
  opacity: number,
  fontSize: number,
  color: string,
  rotation: number,
) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('text', text)
  fd.append('position', position)
  fd.append('opacity', String(opacity))
  fd.append('fontSize', String(fontSize))
  fd.append('color', color)
  fd.append('rotation', String(rotation))
  const blob = await post('/api/pdf/watermark', fd)
  return blobToResult(blob, 'watermarked.pdf')
}

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
  const fd = new FormData()
  fd.append('file', file)
  fd.append('position', position)
  fd.append('startNumber', String(startNumber))
  fd.append('prefix', prefix)
  fd.append('suffix', suffix)
  fd.append('fontSize', String(fontSize))
  fd.append('color', color)
  fd.append('skipFirst', String(skipFirst))
  const blob = await post('/api/pdf/page-numbers', fd)
  return blobToResult(blob, 'numbered.pdf')
}
