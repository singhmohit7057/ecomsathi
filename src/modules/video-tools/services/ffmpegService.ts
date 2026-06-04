/**
 * ffmpegService.ts
 * ─────────────────────────────────────────────────────────────
 * Wrapper around @ffmpeg/ffmpeg v0.12.x (WebAssembly).
 *
 * Requirements:
 *   npm install @ffmpeg/ffmpeg @ffmpeg/util
 *
 * vite.config.ts must exclude these from dep-optimizer:
 *   optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] }
 *
 * Dev server must send COOP/COEP headers for SharedArrayBuffer:
 *   Cross-Origin-Opener-Policy: same-origin
 *   Cross-Origin-Embedder-Policy: require-corp
 * (already set in the project's vite.config.ts)
 * ─────────────────────────────────────────────────────────────
 */

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import type { ProcessingOptions, VideoFormat } from '../types'

const CDN_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

let ffmpegInstance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const ff = new FFmpeg()
    await ff.load({
      coreURL: await toBlobURL(`${CDN_BASE}/ffmpeg-core.js`,   'text/javascript'),
      wasmURL: await toBlobURL(`${CDN_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    ffmpegInstance = ff
    return ff
  })()

  return loadPromise
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer())
}

function outputName(inputName: string, suffix: string, ext: string): string {
  const base = inputName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
  return `${base}_${suffix}.${ext}`
}

function qualityToCRF(quality: 'high' | 'medium' | 'low'): number {
  return { high: 18, medium: 26, low: 34 }[quality]
}

function formatToMime(format: VideoFormat): string {
  const map: Record<VideoFormat, string> = {
    mp4:  'video/mp4',
    mov:  'video/quicktime',
    avi:  'video/x-msvideo',
    webm: 'video/webm',
    mkv:  'video/x-matroska',
  }
  return map[format] ?? 'video/mp4'
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FFmpegProgressEvent {
  progress: number   // 0–1
  time: number       // microseconds
}

export interface FFmpegTask {
  result: Uint8Array
  outputName: string
  mimeType: string
}

// ─── Compress Video ───────────────────────────────────────────────────────────

export async function compressVideo(
  file: File,
  opts: ProcessingOptions = {},
  onProgress?: (p: FFmpegProgressEvent) => void,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inExt = (file.name.split('.').pop() ?? 'mp4').toLowerCase()
  const inName  = `in_compress.${inExt}`
  const outName = `out_compress.mp4`
  const crf = qualityToCRF(opts.quality ?? 'medium')

  const cb = onProgress
    ? (e: { progress: number; time: number }) => onProgress(e)
    : null
  if (cb) ff.on('progress', cb)

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))
    await ff.exec([
      '-i', inName,
      '-c:v', 'libx264',
      '-crf', String(crf),
      '-preset', 'ultrafast',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outName,
    ])
    const data = await ff.readFile(outName) as Uint8Array
    try { await ff.deleteFile(inName) }  catch { /* ok */ }
    try { await ff.deleteFile(outName) } catch { /* ok */ }
    return { result: data, outputName: outputName(file.name, 'compressed', 'mp4'), mimeType: 'video/mp4' }
  } finally {
    if (cb) ff.off('progress', cb)
  }
}

// ─── Resize Video ─────────────────────────────────────────────────────────────

export async function resizeVideo(
  file: File,
  width: number,
  height: number,
  onProgress?: (p: FFmpegProgressEvent) => void,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inExt  = (file.name.split('.').pop() ?? 'mp4').toLowerCase()
  const inName  = `in_resize.${inExt}`
  const outName = `out_resize.mp4`

  // ensure even dimensions (required by libx264)
  const w = width  % 2 === 0 ? width  : width  - 1
  const h = height % 2 === 0 ? height : height - 1
  const scale = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black`

  const cb = onProgress
    ? (e: { progress: number; time: number }) => onProgress(e)
    : null
  if (cb) ff.on('progress', cb)

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))
    await ff.exec([
      '-i', inName,
      '-vf', scale,
      '-c:v', 'libx264',
      '-crf', '22',
      '-preset', 'ultrafast',
      '-c:a', 'copy',
      '-movflags', '+faststart',
      outName,
    ])
    const data = await ff.readFile(outName) as Uint8Array
    try { await ff.deleteFile(inName) }  catch { /* ok */ }
    try { await ff.deleteFile(outName) } catch { /* ok */ }
    return {
      result: data,
      outputName: outputName(file.name, `${w}x${h}`, 'mp4'),
      mimeType: 'video/mp4',
    }
  } finally {
    if (cb) ff.off('progress', cb)
  }
}

// ─── Convert Video Format ─────────────────────────────────────────────────────

export async function convertVideo(
  file: File,
  targetFormat: VideoFormat,
  opts: ProcessingOptions = {},
  onProgress?: (p: FFmpegProgressEvent) => void,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inExt  = (file.name.split('.').pop() ?? 'mp4').toLowerCase()
  const inName  = `in_convert.${inExt}`
  const outName = `out_convert.${targetFormat}`
  const mime    = formatToMime(targetFormat)
  const crf     = qualityToCRF(opts.quality ?? 'medium')

  const cb = onProgress
    ? (e: { progress: number; time: number }) => onProgress(e)
    : null
  if (cb) ff.on('progress', cb)

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))

    const args: string[] = ['-i', inName]

    if (targetFormat === 'webm') {
      args.push('-c:v', 'libvpx', '-crf', String(crf), '-b:v', '0', '-c:a', 'libopus')
    } else if (targetFormat === 'mp4' || targetFormat === 'mov') {
      args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', 'ultrafast', '-c:a', 'aac', '-b:a', '128k')
      if (targetFormat === 'mp4') args.push('-movflags', '+faststart')
    } else if (targetFormat === 'avi') {
      args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', 'ultrafast', '-c:a', 'mp3')
    } else {
      // mkv — copy streams when possible
      args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', 'ultrafast', '-c:a', 'aac')
    }

    args.push(outName)
    await ff.exec(args)
    const data = await ff.readFile(outName) as Uint8Array
    try { await ff.deleteFile(inName) }  catch { /* ok */ }
    try { await ff.deleteFile(outName) } catch { /* ok */ }
    return {
      result: data,
      outputName: outputName(file.name, 'converted', targetFormat),
      mimeType: mime,
    }
  } finally {
    if (cb) ff.off('progress', cb)
  }
}

// ─── Video to GIF (two-pass palettegen) ───────────────────────────────────────
//
// Two-pass approach is required for high-quality GIFs:
//   Pass 1 — generate optimal colour palette from the video frames
//   Pass 2 — apply that palette when writing the GIF
//
// This reliably works in FFmpeg.wasm where the single-pass split
// filtergraph (split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse)
// is often unsupported.

export async function videoToGif(
  file: File,
  opts: ProcessingOptions = {},
  onProgress?: (p: FFmpegProgressEvent) => void,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inExt   = (file.name.split('.').pop() ?? 'mp4').toLowerCase()
  const inName  = `in_gif.${inExt}`
  const palette = 'palette.png'
  const outName = `out_animated.gif`

  const fps      = opts.gifFps    ?? 10
  const gifWidth = opts.gifWidth  ?? 480
  const start    = opts.startTime ?? 0
  const end      = opts.endTime

  // ensure even width
  const w = gifWidth % 2 === 0 ? gifWidth : gifWidth - 1

  const cb = onProgress
    ? (e: { progress: number; time: number }) => onProgress(e)
    : null
  if (cb) ff.on('progress', cb)

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))

    // ── Pass 1: generate palette ──────────────────────────────
    const pass1: string[] = ['-i', inName]
    if (start > 0)            pass1.push('-ss', String(start))
    if (end !== undefined)    pass1.push('-to', String(end))
    pass1.push(
      '-vf', `fps=${fps},scale=${w}:-1:flags=lanczos,palettegen=max_colors=256:stats_mode=diff`,
      '-y', palette,
    )
    await ff.exec(pass1)

    // ── Pass 2: apply palette → GIF ───────────────────────────
    const pass2: string[] = ['-i', inName, '-i', palette]
    if (start > 0)            pass2.push('-ss', String(start))
    if (end !== undefined)    pass2.push('-to', String(end))
    pass2.push(
      '-lavfi', `fps=${fps},scale=${w}:-1:flags=lanczos [x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
      '-loop', '0',
      '-y', outName,
    )
    await ff.exec(pass2)

    const data = await ff.readFile(outName) as Uint8Array
    try { await ff.deleteFile(inName) }  catch { /* ok */ }
    try { await ff.deleteFile(palette) } catch { /* ok */ }
    try { await ff.deleteFile(outName) } catch { /* ok */ }
    return {
      result: data,
      outputName: outputName(file.name, 'animated', 'gif'),
      mimeType: 'image/gif',
    }
  } finally {
    if (cb) ff.off('progress', cb)
  }
}

// ─── Extract Single Thumbnail ─────────────────────────────────────────────────
// Note: ThumbnailGenerator uses the browser Canvas API (no FFmpeg needed).
// This is kept for programmatic use only.

export async function extractThumbnail(
  file: File,
  atSeconds = 1,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inExt  = (file.name.split('.').pop() ?? 'mp4').toLowerCase()
  const inName  = `in_thumb.${inExt}`
  const outName = `out_thumb.jpg`

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))
    await ff.exec([
      '-ss', String(atSeconds),
      '-i', inName,
      '-frames:v', '1',
      '-q:v', '2',
      '-y', outName,
    ])
    const data = await ff.readFile(outName) as Uint8Array
    try { await ff.deleteFile(inName) }  catch { /* ok */ }
    try { await ff.deleteFile(outName) } catch { /* ok */ }
    return { result: data, outputName: outputName(file.name, 'thumbnail', 'jpg'), mimeType: 'image/jpeg' }
  } catch {
    return { result: new Uint8Array(), outputName: 'thumbnail.jpg', mimeType: 'image/jpeg' }
  }
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export function toObjectURL(data: Uint8Array, mimeType: string): string {
  return URL.createObjectURL(new Blob([data], { type: mimeType }))
}

export function downloadBlob(data: Uint8Array, filename: string, mimeType: string): void {
  const url = toObjectURL(data, mimeType)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export { getFFmpeg }
