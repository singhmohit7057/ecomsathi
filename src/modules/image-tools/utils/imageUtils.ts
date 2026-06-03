// ============================================================
// Image Tools — Shared Utilities
// ============================================================

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isImage(file: File): boolean {
  return (
    file.type.startsWith('image/') ||
    /\.(jpe?g|png|webp|gif|bmp|tiff?|avif|heic)$/i.test(file.name)
  )
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image dimensions'))
    }
    img.src = url
  })
}

/** Returns a human-readable aspect ratio string e.g. "16:9" */
export function getAspectRatioLabel(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const d = gcd(width, height)
  return `${width / d}:${height / d}`
}

export const ACCEPTED_IMAGES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png':  ['.png'],
  'image/webp': ['.webp'],
}

export const ACCEPTED_ALL_IMAGES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png':  ['.png'],
  'image/webp': ['.webp'],
  'image/gif':  ['.gif'],
  'image/bmp':  ['.bmp'],
}

export const SITE_URL = 'https://ecomsathi.in'

export function canonical(path: string): string {
  return `${SITE_URL}${path}`
}

/** Build a clean download filename: strip extension, add suffix + new ext */
export function buildFilename(original: string, suffix: string, ext: string): string {
  const base = original.replace(/\.[^.]+$/, '')
  return `${base}${suffix}.${ext}`
}
