// ============================================================
// PDF Tools — Shared Types
// ============================================================

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export type CompressionLevel = 'light' | 'balanced' | 'maximum'

export type RotationAngle = 90 | 180 | 270

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'diagonal'

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right'

export interface PDFFile {
  file: File
  name: string
  size: number
  pageCount?: number
  thumbnail?: string
}

export interface PDFToolCardData {
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

export interface RelatedPDFTool {
  label: string
  to: string
  description?: string
}

export interface ProcessingResult {
  url: string
  filename: string
  size: number
  mimeType?: string
}

// Options
export interface MergeOptions {
  files: File[]
}

export interface SplitOptions {
  file: File
  mode: 'ranges' | 'every-n' | 'individual'
  ranges?: string
  everyN?: number
}

export interface CompressOptions {
  file: File
  level: CompressionLevel
}

export interface RotateOptions {
  file: File
  angle: RotationAngle
  pages: 'all' | number[]
}

export interface WatermarkOptions {
  file: File
  text: string
  position: WatermarkPosition
  opacity: number
  fontSize: number
  color: string
  rotation: number
}

export interface PageNumberOptions {
  file: File
  position: PageNumberPosition
  startNumber: number
  prefix: string
  suffix: string
  fontSize: number
  color: string
  skipFirst: boolean
}
