/**
 * Format raw byte count into a human-readable string.
 * e.g. 1536 → "1.5 KB", 2097152 → "2.0 MB"
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(decimals)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(decimals)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(decimals)} GB`
}

/**
 * Format duration in seconds → "mm:ss" or "hh:mm:ss"
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Map quality label to a CRF value for ffmpeg.
 * Lower CRF = better quality / larger file.
 */
export function qualityToCRF(quality: 'high' | 'medium' | 'low'): number {
  return { high: 18, medium: 26, low: 34 }[quality]
}
