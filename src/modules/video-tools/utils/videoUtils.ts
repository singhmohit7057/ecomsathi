import type { VideoFile } from '../types'

// Accepted video MIME types
export const ACCEPTED_VIDEO_TYPES: Record<string, string[]> = {
  'video/mp4':       ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm':      ['.webm'],
  'video/x-matroska':['.mkv'],
}

export const ACCEPTED_MIME_LIST = Object.keys(ACCEPTED_VIDEO_TYPES)

export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

/**
 * Derive extension from MIME type.
 */
export function mimeToExtension(mime: string): string {
  const map: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',
    'video/x-matroska': 'mkv',
  }
  return map[mime] ?? 'mp4'
}

/**
 * Probe a video File for its dimensions and duration using an HTMLVideoElement.
 * Returns a partial VideoFile with metadata filled in.
 */
export async function probeVideoFile(file: File): Promise<VideoFile> {
  const url = URL.createObjectURL(file)
  return new Promise<VideoFile>((resolve) => {
    const vid = document.createElement('video')
    vid.preload = 'metadata'
    vid.onloadedmetadata = () => {
      resolve({
        file,
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        duration: vid.duration,
        width: vid.videoWidth,
        height: vid.videoHeight,
      })
      // Don't revoke yet — caller needs the URL for preview
    }
    vid.onerror = () => {
      resolve({ file, url, name: file.name, size: file.size, type: file.type })
    }
    vid.src = url
  })
}

/**
 * Capture a JPEG thumbnail from a video at the given time offset.
 * Returns a blob URL or null on failure.
 */
export async function captureThumbnail(
  videoUrl: string,
  atSeconds = 0,
  maxWidth = 640,
): Promise<string | null> {
  return new Promise((resolve) => {
    const vid = document.createElement('video')
    vid.crossOrigin = 'anonymous'
    vid.preload = 'metadata'
    vid.muted = true

    const onSeeked = () => {
      try {
        const scale = Math.min(1, maxWidth / (vid.videoWidth || maxWidth))
        const w = Math.round(vid.videoWidth * scale)
        const h = Math.round(vid.videoHeight * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(null); return }
        ctx.drawImage(vid, 0, 0, w, h)
        canvas.toBlob((blob) => {
          resolve(blob ? URL.createObjectURL(blob) : null)
        }, 'image/jpeg', 0.92)
      } catch {
        resolve(null)
      }
    }

    vid.onloadedmetadata = () => {
      vid.currentTime = Math.min(atSeconds, vid.duration - 0.01)
    }
    vid.onseeked = onSeeked
    vid.onerror = () => resolve(null)
    vid.src = videoUrl
  })
}

/**
 * Extract multiple frame thumbnails at regular intervals from a video.
 */
export async function extractFrames(
  videoUrl: string,
  count: number,
  maxWidth = 320,
): Promise<string[]> {
  return new Promise((resolve) => {
    const vid = document.createElement('video')
    vid.crossOrigin = 'anonymous'
    vid.preload = 'metadata'
    vid.muted = true
    const frames: string[] = []

    vid.onloadedmetadata = async () => {
      const duration = vid.duration
      const interval = duration / (count + 1)
      for (let i = 1; i <= count; i++) {
        const time = Math.min(i * interval, duration - 0.01)
        const url = await seekAndCapture(vid, time, maxWidth)
        if (url) frames.push(url)
      }
      resolve(frames)
    }
    vid.onerror = () => resolve([])
    vid.src = videoUrl
  })
}

async function seekAndCapture(
  vid: HTMLVideoElement,
  time: number,
  maxWidth: number,
): Promise<string | null> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      vid.removeEventListener('seeked', onSeeked)
      try {
        const scale = Math.min(1, maxWidth / (vid.videoWidth || maxWidth))
        const w = Math.round(vid.videoWidth * scale)
        const h = Math.round(vid.videoHeight * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(null); return }
        ctx.drawImage(vid, 0, 0, w, h)
        canvas.toBlob(
          (blob) => resolve(blob ? URL.createObjectURL(blob) : null),
          'image/jpeg',
          0.88,
        )
      } catch {
        resolve(null)
      }
    }
    vid.addEventListener('seeked', onSeeked)
    vid.currentTime = time
  })
}

/**
 * Normalise a filename — strip extension and add a new one.
 */
export function renameTo(originalName: string, newExtension: string): string {
  const base = originalName.replace(/\.[^.]+$/, '')
  return `${base}.${newExtension}`
}
