// ============================================================
// Image Tools — Shared Types
// ============================================================

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'

export type ImageFormat = 'jpeg' | 'png' | 'webp'

export type ResizeMode = 'contain' | 'cover' | 'fill' | 'inside' | 'outside'

export interface ImageFile {
  file: File
  name: string
  size: number
  width?: number
  height?: number
  url: string           // object URL for preview
}

export interface ProcessingResult {
  url: string
  filename: string
  size: number
  width?: number
  height?: number
  mimeType?: string
}

export interface ImageToolCardData {
  icon: React.ReactNode
  title: string
  description: string
  path: string
  accent: string
  badge?: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface RelatedImageTool {
  label: string
  to: string
  description?: string
}

// Options shapes
export interface ResizeOptions {
  width: number
  height: number
  maintainAspectRatio: boolean
  mode: ResizeMode
}

export interface CompressOptions {
  quality: number       // 1–100
  format: ImageFormat
}

export interface CropOptions {
  x: number
  y: number
  width: number
  height: number
}

export interface WatermarkOptions {
  text: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  opacity: number
  fontSize: number
  color: string
}
