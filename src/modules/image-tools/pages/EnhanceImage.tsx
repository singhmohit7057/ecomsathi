import React, { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Trash2, Download, Wand2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Alert } from '@/components/common/Alert'
import SEO from '@/components/common/SEO'
import { FAQPageSchema, BreadcrumbSchema, WebApplicationSchema } from '@/components/common/SchemaMarkup'
import ImageFAQ from '../components/ImageFAQ'

// ─── Types ────────────────────────────────────────────────────

interface EnhanceSettings {
  sharpness: number   // 0–100
  brightness: number  // -50 to +50
  contrast: number    // -50 to +50
  saturation: number  // -50 to +50
}

// ─── Constants ───────────────────────────────────────────────

const MAX_SIZE_BYTES = 20 * 1024 * 1024

const DEFAULT_SETTINGS: EnhanceSettings = {
  sharpness: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
}

const AUTO_ENHANCE: EnhanceSettings = {
  sharpness: 60,
  brightness: 5,
  contrast: 20,
  saturation: 25,
}

const FAQS = [
  { q: 'How does image enhancement work?', a: 'The tool uses a sharpening convolution kernel (unsharp mask) for sharpness, and pixel-level RGBA adjustments for brightness, contrast, and saturation — all running directly in your browser with Canvas API.' },
  { q: 'What does "Auto Enhance" do?', a: 'It applies a balanced preset — moderate sharpening (60), slight brightness lift (+5), contrast boost (+20), and saturation boost (+25) — that improves most product photos in one click.' },
  { q: 'Can I upscale a small image to a higher resolution?', a: 'This tool enhances quality through sharpening and color correction but does not increase pixel dimensions. Use the Resize Image tool to change dimensions, then apply enhancement for best results.' },
  { q: 'Will enhancement affect the file size?', a: 'Slightly. Sharpening adds detail information so PNG files may increase a little. For marketplace uploads, use the Compress Image tool after enhancing.' },
  { q: 'Is processing done in the browser?', a: 'Yes — 100% browser-based using Canvas API. No images are uploaded to any server.' },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    WebApplicationSchema({ name: 'Image Enhancer', url: 'https://ecomsathi.vercel.app/tools/image/enhance', description: 'Sharpen, boost contrast and enhance product images online free. Browser-based — no upload needed.' }),
    BreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }, { name: 'Image Tools', url: '/tools/image' }, { name: 'Image Enhancer', url: '/tools/image/enhance' }]),
    FAQPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
  ],
}

// ─── Processing helpers ───────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Apply 3×3 convolution kernel to ImageData */
function applyKernel(data: Uint8ClampedArray, width: number, height: number, kernel: number[], factor: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data.length)
  const kSize = 3
  const half = Math.floor(kSize / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half))
          const py = Math.min(height - 1, Math.max(0, y + ky - half))
          const idx = (py * width + px) * 4
          const k = kernel[ky * kSize + kx]
          r += data[idx]     * k
          g += data[idx + 1] * k
          b += data[idx + 2] * k
        }
      }
      const idx = (y * width + x) * 4
      output[idx]     = Math.min(255, Math.max(0, r * factor))
      output[idx + 1] = Math.min(255, Math.max(0, g * factor))
      output[idx + 2] = Math.min(255, Math.max(0, b * factor))
      output[idx + 3] = data[idx + 3]
    }
  }
  return output
}

/** Blend original with sharpened result based on strength 0-100 */
function sharpen(data: Uint8ClampedArray, width: number, height: number, strength: number): Uint8ClampedArray {
  if (strength === 0) return data
  // Unsharp mask kernel
  const kernel = [
    -1, -1, -1,
    -1,  9, -1,
    -1, -1, -1,
  ]
  const sharpened = applyKernel(data, width, height, kernel, 1)
  const t = (strength / 100) * 0.8  // max blend 0.8 to avoid over-sharpening
  const result = new Uint8ClampedArray(data.length)
  for (let i = 0; i < data.length; i += 4) {
    result[i]     = Math.min(255, Math.max(0, data[i]     * (1 - t) + sharpened[i]     * t))
    result[i + 1] = Math.min(255, Math.max(0, data[i + 1] * (1 - t) + sharpened[i + 1] * t))
    result[i + 2] = Math.min(255, Math.max(0, data[i + 2] * (1 - t) + sharpened[i + 2] * t))
    result[i + 3] = data[i + 3]
  }
  return result
}

/** Adjust brightness/contrast/saturation via per-pixel RGBA math */
function adjustColors(
  data: Uint8ClampedArray,
  brightness: number,   // -50..+50
  contrast: number,     // -50..+50
  saturation: number,   // -50..+50
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data.length)
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  const satFactor = 1 + saturation / 100

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2]

    // Brightness
    r += brightness; g += brightness; b += brightness

    // Contrast
    r = contrastFactor * (r - 128) + 128
    g = contrastFactor * (g - 128) + 128
    b = contrastFactor * (b - 128) + 128

    // Saturation (convert to luminance + chroma then scale chroma)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    r = lum + (r - lum) * satFactor
    g = lum + (g - lum) * satFactor
    b = lum + (b - lum) * satFactor

    result[i]     = Math.min(255, Math.max(0, r))
    result[i + 1] = Math.min(255, Math.max(0, g))
    result[i + 2] = Math.min(255, Math.max(0, b))
    result[i + 3] = data[i + 3]
  }
  return result
}

async function processImage(file: File, settings: EnhanceSettings): Promise<{ url: string; size: number }> {
  return new Promise((resolve, reject) => {
    const objUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objUrl)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      let pixels = imageData.data

      // 1. Sharpen
      if (settings.sharpness > 0) {
        pixels = sharpen(pixels, canvas.width, canvas.height, settings.sharpness)
      }

      // 2. Brightness / Contrast / Saturation
      if (settings.brightness !== 0 || settings.contrast !== 0 || settings.saturation !== 0) {
        pixels = adjustColors(pixels, settings.brightness, settings.contrast, settings.saturation)
      }

      // Write back
      const outData = new ImageData(pixels, canvas.width, canvas.height)
      ctx.putImageData(outData, 0, 0)

      const mime = file.type === 'image/png' ? 'image/png' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Processing failed')); return }
        resolve({ url: URL.createObjectURL(blob), size: blob.size })
      }, mime, 0.95)
    }
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Could not load image')) }
    img.src = objUrl
  })
}

// ─── Slider row ───────────────────────────────────────────────

function SliderRow({
  label, value, min, max, onChange, unit = '',
}: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[#64748B]">{label}</label>
        <span className="text-xs font-semibold text-[#0F172A] tabular-nums w-10 text-right">
          {value > 0 ? `+${value}` : value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#2563EB]"
      />
      <div className="flex justify-between text-[10px] text-[#CBD5E1]">
        <span>{min}{unit}</span>
        <span>0</span>
        <span>+{max}{unit}</span>
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────

export const EnhanceImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultSize, setResultSize] = useState<number | null>(null)
  const [settings, setSettings] = useState<EnhanceSettings>(DEFAULT_SETTINGS)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sliderPos, setSliderPos] = useState(50)
  const sliderRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) { setError('Invalid file or too large (max 20MB)'); return }
      const f = accepted[0]
      if (!f) return
      setError(null)
      setResultUrl(null)
      setResultSize(null)
      setSliderPos(50)
      setFile(f)
      setOriginalUrl(URL.createObjectURL(f))
    },
  })

  const handleProcess = async () => {
    if (!file) return
    setProcessing(true)
    setError(null)
    try {
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      const { url, size } = await processImage(file, settings)
      setResultUrl(url)
      setResultSize(size)
      setSliderPos(50)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Processing failed.')
    } finally {
      setProcessing(false)
    }
  }

  const handleAutoEnhance = () => {
    setSettings(AUTO_ENHANCE)
  }

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null); setOriginalUrl(null); setResultUrl(null); setResultSize(null)
    setSettings(DEFAULT_SETTINGS); setError(null); setSliderPos(50)
  }

  const handleDownload = () => {
    if (!resultUrl || !file) return
    const ext = file.name.split('.').pop() ?? 'jpg'
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_enhanced.${ext}`
    a.click()
  }

  const set = useCallback((key: keyof EnhanceSettings) => (v: number) => {
    setSettings(prev => ({ ...prev, [key]: v }))
    setResultUrl(null)
    setResultSize(null)
  }, [])

  // Before/after slider drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    setSliderPos((Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width) * 100)
  }, [])

  const handleMouseUp = useCallback(() => {
    dragging.current = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    setSliderPos((Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width)) / rect.width) * 100)
  }

  const hasChanges = settings.sharpness !== 0 || settings.brightness !== 0 || settings.contrast !== 0 || settings.saturation !== 0

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <SEO
        title="Image Enhancer — Sharpen & Improve Image Quality Free — EcomSathi"
        description="Sharpen blurry product images, boost contrast and saturation online for free. One-click Auto Enhance for marketplace listings. Browser-based, no upload needed."
        keywords="image enhancer online free, sharpen image, improve image quality, boost contrast saturation, enhance product photo, auto enhance image"
        canonicalUrl="https://ecomsathi.vercel.app/tools/image/enhance"
        schema={PAGE_SCHEMA}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Image Enhancer</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Sharpen, boost contrast and improve product image quality — all in your browser.
        </p>
      </div>

      {/* Upload zone */}
      {!originalUrl && (
        <div
          {...getRootProps()}
          className={[
            'border-2 border-dashed rounded-[8px] p-10 flex flex-col items-center gap-3 cursor-pointer transition-all',
            isDragActive ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#EFF6FF]',
          ].join(' ')}
        >
          <input {...getInputProps()} />
          <UploadCloud size={40} className={isDragActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
          <div className="text-center">
            <p className="text-sm font-medium text-[#0F172A]">
              Drag image here or <span className="text-[#2563EB] underline">click to browse</span>
            </p>
            <p className="text-xs text-[#64748B] mt-1">JPG, PNG, WEBP · Max 20MB</p>
          </div>
        </div>
      )}

      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {originalUrl && (
        <>
          {/* File info */}
          <div className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-[8px] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">{file?.name}</p>
              <p className="text-xs text-[#64748B]">
                {file ? formatBytes(file.size) : ''}
                {resultSize && (
                  <span className="ml-2 text-[#16A34A]">→ {formatBytes(resultSize)} enhanced</span>
                )}
              </p>
            </div>
            <button type="button" onClick={handleReset} className="text-[#94A3B8] hover:text-[#DC2626] transition-colors">
              <Trash2 size={16} />
            </button>
          </div>

          {/* Controls */}
          <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-5">
            {/* Auto enhance + reset row */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#0F172A]">Enhance Settings</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSettings(DEFAULT_SETTINGS)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748B] border border-[#E2E8F0] rounded-[4px] hover:border-[#CBD5E1] transition-colors"
                >
                  <RotateCcw size={12} /> Reset
                </button>
                <button
                  type="button"
                  onClick={handleAutoEnhance}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#7C3AED] rounded-[4px] hover:bg-[#6D28D9] transition-colors"
                >
                  <Wand2 size={12} /> Auto Enhance
                </button>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <SliderRow label="Sharpness"   value={settings.sharpness}   min={0}   max={100} onChange={set('sharpness')} />
              <SliderRow label="Brightness"  value={settings.brightness}  min={-50} max={50}  onChange={set('brightness')} />
              <SliderRow label="Contrast"    value={settings.contrast}    min={-50} max={50}  onChange={set('contrast')} />
              <SliderRow label="Saturation"  value={settings.saturation}  min={-50} max={50}  onChange={set('saturation')} />
            </div>

            {/* Apply button */}
            <Button
              variant="primary"
              loading={processing}
              leftIcon={<Wand2 size={15} />}
              onClick={handleProcess}
            >
              {processing ? 'Enhancing…' : hasChanges ? 'Apply Enhancement' : 'Apply (no changes yet)'}
            </Button>
          </div>

          {/* Before / After comparison */}
          {resultUrl ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#64748B] text-center">Drag slider to compare</p>
              <div
                ref={sliderRef}
                className="relative rounded-[8px] overflow-hidden cursor-col-resize select-none bg-[#F1F5F9]"
                style={{ aspectRatio: '4/3' }}
                onMouseDown={handleSliderMouseDown}
                onTouchMove={handleTouchMove}
              >
                {/* Enhanced (right) */}
                <img
                  src={resultUrl}
                  alt="Enhanced"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                {/* Original (left, clipped) */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="absolute inset-0 h-full object-contain pointer-events-none"
                    style={{ width: sliderRef.current?.offsetWidth ?? 'auto' }}
                  />
                </div>
                {/* Divider */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md"
                  style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                    <div className="w-0.5 h-3 bg-[#94A3B8] rounded-full" />
                  </div>
                </div>
                <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded">ORIGINAL</span>
                <span className="absolute top-2 right-2 text-[10px] font-semibold bg-[#7C3AED]/80 text-white px-1.5 py-0.5 rounded">ENHANCED</span>
              </div>

              {/* Download */}
              <Button variant="ghost" leftIcon={<Download size={15} />} onClick={handleDownload}>
                Download Enhanced Image
              </Button>
            </div>
          ) : (
            /* Original preview */
            <div className="rounded-[8px] overflow-hidden bg-[#F1F5F9]" style={{ aspectRatio: '4/3' }}>
              <img src={originalUrl} alt="Original" className="w-full h-full object-contain" />
            </div>
          )}
        </>
      )}

      <ImageFAQ faqs={FAQS} />
    </div>
  )
}

export default EnhanceImage
