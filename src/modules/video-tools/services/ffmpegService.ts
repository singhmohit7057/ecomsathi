/**
 * ffmpegService.ts
 * ─────────────────────────────────────────────────────────────
 * Thin wrapper around @ffmpeg/ffmpeg (WebAssembly build).
 *
 * IMPORTANT — browser-side FFmpeg.wasm notes:
 * ─────────────────────────────────────────────────────────────
 * 1. @ffmpeg/ffmpeg must be installed:
 *      npm install @ffmpeg/ffmpeg @ffmpeg/util
 *
 * 2. The WASM core files (ffmpeg-core.js, ffmpeg-core.wasm) are
 *    served from a CDN here to avoid bundling 30MB into the app.
 *    For production, self-host or use a well-known CDN.
 *
 * 3. SharedArrayBuffer is required for multi-threading.
 *    Ensure the server sends these headers:
 *      Cross-Origin-Opener-Policy: same-origin
 *      Cross-Origin-Embedder-Policy: require-corp
 *
 * 4. If SharedArrayBuffer is unavailable (some browsers / hosts),
 *    a single-threaded build should be used instead.
 *
 * This service is a SINGLETON — load() is called once.
 * ─────────────────────────────────────────────────────────────
 */

import type { ProcessingOptions, VideoFormat } from '../types'

// Types only — runtime import via dynamic import below
type FFmpegInstance = {
  load: (opts: object) => Promise<void>
  writeFile: (name: string, data: Uint8Array) => Promise<void>
  readFile: (name: string) => Promise<Uint8Array | string>
  deleteFile: (name: string) => Promise<void>
  exec: (args: string[]) => Promise<number>
  on: (event: string, cb: (data: unknown) => void) => void
  off: (event: string, cb: (data: unknown) => void) => void
  terminate: () => void
}

const CDN_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

let ffmpegInstance: FFmpegInstance | null = null
let loadPromise: Promise<FFmpegInstance> | null = null

async function getFFmpeg(): Promise<FFmpegInstance> {
  if (ffmpegInstance) return ffmpegInstance
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg' as string) as { FFmpeg: new () => FFmpegInstance }
    const instance = new FFmpeg()
    await instance.load({
      coreURL: `${CDN_BASE}/ffmpeg-core.js`,
      wasmURL: `${CDN_BASE}/ffmpeg-core.wasm`,
    })
    ffmpegInstance = instance
    return instance
  })()

  return loadPromise
}

/** Read a File into Uint8Array */
async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer()
  return new Uint8Array(buf)
}

/** Build output filename */
function outputName(inputName: string, suffix: string, ext: string): string {
  const base = inputName.replace(/\.[^.]+$/, '')
  return `${base}_${suffix}.${ext}`
}

// ─── Quality → CRF ────────────────────────────────────────────────────────────

function qualityToCRF(quality: 'high' | 'medium' | 'low'): number {
  return { high: 18, medium: 26, low: 34 }[quality]
}

// ─── Public API ────────────────────────────────────────────────────────────────

export interface FFmpegProgressEvent {
  progress: number  // 0–1
  time: number      // microseconds processed
}

export interface FFmpegTask {
  result: Uint8Array
  outputName: string
  mimeType: string
}

// ── Convert video format ───────────────────────────────────────────────────────

export async function convertVideo(
  file: File,
  targetFormat: VideoFormat,
  opts: ProcessingOptions = {},
  onProgress?: (p: FFmpegProgressEvent) => void,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inName = `input.${file.name.split('.').pop() ?? 'mp4'}`
  const outExt = targetFormat
  const outName = outputName(file.name, 'converted', outExt)
  const mime = formatToMime(targetFormat)

  if (onProgress) ff.on('progress', onProgress as (d: unknown) => void)

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))
    const crf = qualityToCRF(opts.quality ?? 'medium')
    const args = ['-i', inName, '-crf', String(crf), '-preset', 'fast']
    if (targetFormat === 'webm') {
      args.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus')
    }
    args.push(outName)
    await ff.exec(args)
    const data = await ff.readFile(outName) as Uint8Array
    await ff.deleteFile(inName)
    await ff.deleteFile(outName)
    return { result: data, outputName: outName, mimeType: mime }
  } finally {
    if (onProgress) ff.off('progress', onProgress as (d: unknown) => void)
  }
}

// ── Compress video ─────────────────────────────────────────────────────────────

export async function compressVideo(
  file: File,
  opts: ProcessingOptions = {},
  onProgress?: (p: FFmpegProgressEvent) => void,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inExt = file.name.split('.').pop() ?? 'mp4'
  const inName = `input.${inExt}`
  const outName = outputName(file.name, 'compressed', inExt)
  const crf = qualityToCRF(opts.quality ?? 'medium')

  if (onProgress) ff.on('progress', onProgress as (d: unknown) => void)

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))
    await ff.exec([
      '-i', inName,
      '-c:v', 'libx264',
      '-crf', String(crf),
      '-preset', 'fast',
      '-c:a', 'aac',
      '-b:a', '128k',
      outName,
    ])
    const data = await ff.readFile(outName) as Uint8Array
    await ff.deleteFile(inName)
    await ff.deleteFile(outName)
    return { result: data, outputName: outName, mimeType: 'video/mp4' }
  } finally {
    if (onProgress) ff.off('progress', onProgress as (d: unknown) => void)
  }
}

// ── Resize video ───────────────────────────────────────────────────────────────

export async function resizeVideo(
  file: File,
  width: number,
  height: number,
  onProgress?: (p: FFmpegProgressEvent) => void,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inExt = file.name.split('.').pop() ?? 'mp4'
  const inName = `input.${inExt}`
  const outName = outputName(file.name, `${width}x${height}`, 'mp4')

  if (onProgress) ff.on('progress', onProgress as (d: unknown) => void)

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))
    // vf scale: keep aspect ratio, pad to exact box if needed
    const scale = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`
    await ff.exec([
      '-i', inName,
      '-vf', scale,
      '-c:v', 'libx264',
      '-crf', '22',
      '-preset', 'fast',
      '-c:a', 'copy',
      outName,
    ])
    const data = await ff.readFile(outName) as Uint8Array
    await ff.deleteFile(inName)
    await ff.deleteFile(outName)
    return { result: data, outputName: outName, mimeType: 'video/mp4' }
  } finally {
    if (onProgress) ff.off('progress', onProgress as (d: unknown) => void)
  }
}

// ── Video to GIF ───────────────────────────────────────────────────────────────

export async function videoToGif(
  file: File,
  opts: ProcessingOptions = {},
  onProgress?: (p: FFmpegProgressEvent) => void,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inExt = file.name.split('.').pop() ?? 'mp4'
  const inName = `input.${inExt}`
  const outName = outputName(file.name, 'animated', 'gif')
  const fps = opts.gifFps ?? 10
  const gifWidth = opts.gifWidth ?? 480
  const startTime = opts.startTime ?? 0
  const endTime = opts.endTime ?? undefined

  if (onProgress) ff.on('progress', onProgress as (d: unknown) => void)

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))
    const args: string[] = ['-i', inName]
    if (startTime > 0) args.push('-ss', String(startTime))
    if (endTime !== undefined) args.push('-to', String(endTime))
    args.push(
      '-vf', `fps=${fps},scale=${gifWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
      '-loop', '0',
      outName,
    )
    await ff.exec(args)
    const data = await ff.readFile(outName) as Uint8Array
    await ff.deleteFile(inName)
    await ff.deleteFile(outName)
    return { result: data, outputName: outName, mimeType: 'image/gif' }
  } finally {
    if (onProgress) ff.off('progress', onProgress as (d: unknown) => void)
  }
}

// ── Extract thumbnail ──────────────────────────────────────────────────────────

export async function extractThumbnail(
  file: File,
  atSeconds = 1,
): Promise<FFmpegTask> {
  const ff = await getFFmpeg()
  const inExt = file.name.split('.').pop() ?? 'mp4'
  const inName = `input.${inExt}`
  const outName = outputName(file.name, 'thumbnail', 'jpg')

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))
    await ff.exec([
      '-i', inName,
      '-ss', String(atSeconds),
      '-frames:v', '1',
      '-q:v', '2',
      outName,
    ])
    const data = await ff.readFile(outName) as Uint8Array
    await ff.deleteFile(inName)
    await ff.deleteFile(outName)
    return { result: data, outputName: outName, mimeType: 'image/jpeg' }
  } catch {
    // If deleteFile fails it's fine
    return { result: new Uint8Array(), outputName: outName, mimeType: 'image/jpeg' }
  }
}

// ── Extract frames ─────────────────────────────────────────────────────────────

export async function extractFrames(
  file: File,
  opts: ProcessingOptions = {},
  onProgress?: (p: FFmpegProgressEvent) => void,
): Promise<FFmpegTask[]> {
  const ff = await getFFmpeg()
  const inExt = file.name.split('.').pop() ?? 'mp4'
  const inName = `input.${inExt}`
  const frameInterval = opts.frameInterval ?? 1  // every N seconds
  const maxFrames = opts.maxFrames ?? 20

  if (onProgress) ff.on('progress', onProgress as (d: unknown) => void)

  try {
    await ff.writeFile(inName, await fileToUint8Array(file))
    // Use fps filter to extract one frame every N seconds
    const outPattern = 'frame_%03d.jpg'
    await ff.exec([
      '-i', inName,
      '-vf', `fps=1/${frameInterval}`,
      '-vframes', String(maxFrames),
      '-q:v', '2',
      outPattern,
    ])

    const tasks: FFmpegTask[] = []
    for (let i = 1; i <= maxFrames; i++) {
      const frameName = `frame_${String(i).padStart(3, '0')}.jpg`
      try {
        const data = await ff.readFile(frameName) as Uint8Array
        tasks.push({ result: data, outputName: frameName, mimeType: 'image/jpeg' })
        await ff.deleteFile(frameName)
      } catch {
        break  // No more frames
      }
    }

    await ff.deleteFile(inName)
    return tasks
  } finally {
    if (onProgress) ff.off('progress', onProgress as (d: unknown) => void)
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatToMime(format: VideoFormat): string {
  const map: Record<VideoFormat, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
  }
  return map[format] ?? 'video/mp4'
}

/**
 * Convert a Uint8Array result to a downloadable blob URL.
 */
export function toObjectURL(data: Uint8Array, mimeType: string): string {
  return URL.createObjectURL(new Blob([data], { type: mimeType }))
}

/**
 * Trigger a browser download.
 */
export function downloadBlob(data: Uint8Array, filename: string, mimeType: string): void {
  const url = toObjectURL(data, mimeType)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export { getFFmpeg }
