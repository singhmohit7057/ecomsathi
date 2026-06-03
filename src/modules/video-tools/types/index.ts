// ============================================================
// Video Tools — Shared Types
// ============================================================

export type VideoFormat = 'mp4' | 'mov' | 'avi' | 'webm' | 'mkv'

export type VideoQuality = 'high' | 'medium' | 'low'

export type ProcessingStatus = 'idle' | 'loading' | 'processing' | 'done' | 'error'

export interface VideoFile {
  file: File
  url: string
  name: string
  size: number
  type: string
  duration?: number
  width?: number
  height?: number
}

export interface ProcessingOptions {
  format?: VideoFormat
  quality?: VideoQuality
  crf?: number            // 0–51, lower = better quality
  width?: number
  height?: number
  fps?: number
  startTime?: number      // seconds
  endTime?: number        // seconds
  gifFps?: number
  gifWidth?: number
  thumbnailTime?: number  // seconds offset for thumbnail
  frameInterval?: number  // extract one frame every N seconds
  maxFrames?: number
}

export interface ProcessingResult {
  url: string
  name: string
  size: number
  mimeType: string
}

export interface VideoToolCardData {
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

export interface RelatedTool {
  label: string
  to: string
  description?: string
}
