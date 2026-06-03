// ============================================================
// Image API Service — thin wrappers around backend endpoints
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

export async function removeBackground(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const blob = await post('/api/image/remove-background', fd)
  return blobToResult(blob, file.name.replace(/\.[^.]+$/, '') + '-no-bg.png')
}

export async function compressImage(file: File, quality: number, format: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('quality', String(quality))
  fd.append('format', format)
  const blob = await post('/api/image/compress', fd)
  return blobToResult(blob, file.name.replace(/\.[^.]+$/, '') + `-compressed.${format}`)
}

export async function resizeImage(file: File, width: number, height: number, maintainAspectRatio: boolean) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('width', String(width))
  fd.append('height', String(height))
  fd.append('maintainAspectRatio', String(maintainAspectRatio))
  const blob = await post('/api/image/resize', fd)
  const ext = file.name.split('.').pop() ?? 'jpg'
  return blobToResult(blob, file.name.replace(/\.[^.]+$/, '') + `-${width}x${height}.${ext}`)
}

export async function cropImage(file: File, x: number, y: number, width: number, height: number) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('x', String(x))
  fd.append('y', String(y))
  fd.append('width', String(width))
  fd.append('height', String(height))
  const blob = await post('/api/image/crop', fd)
  const ext = file.name.split('.').pop() ?? 'jpg'
  return blobToResult(blob, file.name.replace(/\.[^.]+$/, '') + `-cropped.${ext}`)
}

export async function convertFormat(file: File, targetFormat: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('format', targetFormat)
  const blob = await post('/api/image/convert', fd)
  return blobToResult(blob, file.name.replace(/\.[^.]+$/, '') + `.${targetFormat}`)
}

export async function addWatermark(
  file: File,
  text: string,
  position: string,
  opacity: number,
  fontSize: number,
  color: string,
) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('text', text)
  fd.append('position', position)
  fd.append('opacity', String(opacity))
  fd.append('fontSize', String(fontSize))
  fd.append('color', color)
  const blob = await post('/api/image/watermark', fd)
  const ext = file.name.split('.').pop() ?? 'jpg'
  return blobToResult(blob, file.name.replace(/\.[^.]+$/, '') + `-watermarked.${ext}`)
}

export async function whiteBackground(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const blob = await post('/api/image/white-background', fd)
  return blobToResult(blob, file.name.replace(/\.[^.]+$/, '') + '-white-bg.jpg')
}

export async function squareImage(file: File, size: number, bgColor: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('size', String(size))
  fd.append('bgColor', bgColor)
  const blob = await post('/api/image/square', fd)
  return blobToResult(blob, file.name.replace(/\.[^.]+$/, '') + `-${size}x${size}.jpg`)
}

export async function optimizeProduct(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const blob = await post('/api/image/optimize-product', fd)
  return blobToResult(blob, file.name.replace(/\.[^.]+$/, '') + '-optimized.jpg')
}
