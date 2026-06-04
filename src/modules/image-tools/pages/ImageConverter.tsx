import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Download, Trash2, FileImage, Archive, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Alert } from '@/components/common/Alert'
import SEO from '@/components/common/SEO'
import { FAQPageSchema, BreadcrumbSchema, WebApplicationSchema } from '@/components/common/SchemaMarkup'
import ImageFAQ from '../components/ImageFAQ'

// ─── Types ────────────────────────────────────────────────────

type ConversionMode = 'jpg-to-png' | 'png-to-jpg'

interface ConvertedFile {
  originalName: string
  originalSize: number
  outputSize: number
  outputUrl: string
  outputExt: string
}

// ─── Constants ────────────────────────────────────────────────

const MAX_SIZE_BYTES = 20 * 1024 * 1024

const MODES: { value: ConversionMode; label: string; from: string; to: string; note: string; accentClass: string }[] = [
  {
    value: 'jpg-to-png',
    label: 'JPG → PNG',
    from: 'JPG / JPEG',
    to: 'PNG',
    note: 'Lossless · Preserves transparency',
    accentClass: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  {
    value: 'png-to-jpg',
    label: 'PNG → JPG',
    from: 'PNG',
    to: 'JPEG',
    note: 'Smaller file · Fills transparency',
    accentClass: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  },
]

const FORMAT_TABLE = [
  { fmt: 'JPG / JPEG', best: 'Photos, product listings',     size: 'Small',  transparency: '✗' },
  { fmt: 'PNG',        best: 'Logos, removed backgrounds',   size: 'Larger', transparency: '✓' },
]

const FAQS = [
  { q: 'When should I convert JPG to PNG?', a: 'Use JPG → PNG when you need to edit and re-save an image repeatedly without quality loss, or when you want to add transparency (e.g. after background removal).' },
  { q: 'When should I convert PNG to JPG?', a: 'Use PNG → JPG for marketplace listings — JPEG files are much smaller and load faster. Amazon and Flipkart prefer JPEG for product main images.' },
  { q: 'What happens to transparent areas when converting PNG to JPG?', a: 'JPEG does not support transparency. Choose a background fill color (white is default and marketplace-friendly) to replace transparent pixels.' },
  { q: 'Can I convert multiple files at once?', a: 'Yes. Drag and drop multiple files in one go. All files are converted in parallel in your browser.' },
  { q: 'Is conversion done in the browser?', a: 'Yes, everything runs locally using the Canvas API. No images are uploaded to any server.' },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    WebApplicationSchema({ name: 'Image Converter', url: 'https://ecomsathi.vercel.app/tools/image/converter', description: 'Convert between JPG and PNG formats online for free. Batch conversion supported.' }),
    BreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }, { name: 'Image Tools', url: '/tools/image' }, { name: 'Image Converter', url: '/tools/image/converter' }]),
    FAQPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
  ],
}

// ─── Conversion helpers ───────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function convertFile(
  file: File,
  mode: ConversionMode,
  bgColor: string,
  quality: number,
): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!

      if (mode === 'jpg-to-png') {
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error(`Failed: ${file.name}`)); return }
          URL.revokeObjectURL(url)
          resolve({ originalName: file.name, originalSize: file.size, outputSize: blob.size, outputUrl: URL.createObjectURL(blob), outputExt: 'png' })
        }, 'image/png')
      } else {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error(`Failed: ${file.name}`)); return }
          URL.revokeObjectURL(url)
          resolve({ originalName: file.name, originalSize: file.size, outputSize: blob.size, outputUrl: URL.createObjectURL(blob), outputExt: 'jpg' })
        }, 'image/jpeg', quality / 100)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Could not load ${file.name}`)) }
    img.src = url
  })
}

// ─── Component ───────────────────────────────────────────────

export const ImageConverter: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>('jpg-to-png')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [quality, setQuality] = useState(90)
  const [files, setFiles] = useState<File[]>([])
  const [converted, setConverted] = useState<ConvertedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const acceptMap: Record<ConversionMode, Record<string, string[]>> = {
    'jpg-to-png': { 'image/jpeg': ['.jpg', '.jpeg'] },
    'png-to-jpg': { 'image/png': ['.png'] },
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptMap[mode],
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) setError(`${rejected.length} file(s) rejected. Check format and size (max 20MB).`)
      setFiles(prev => [...prev, ...accepted])
      setConverted([])
      setDone(false)
    },
  })

  const handleModeChange = (m: ConversionMode) => {
    setMode(m)
    setFiles([])
    setConverted([])
    setDone(false)
    setError(null)
  }

  const handleRemoveFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
    setConverted([])
    setDone(false)
  }

  const handleConvert = async () => {
    if (!files.length) return
    setProcessing(true)
    setError(null)
    setDone(false)
    converted.forEach(c => URL.revokeObjectURL(c.outputUrl))
    try {
      const results = await Promise.all(files.map(f => convertFile(f, mode, bgColor, quality)))
      setConverted(results)
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownloadSingle = (c: ConvertedFile) => {
    const a = document.createElement('a')
    a.href = c.outputUrl
    a.download = c.originalName.replace(/\.[^.]+$/, '') + '.' + c.outputExt
    a.click()
  }

  const handleDownloadAll = async () => {
    for (const c of converted) {
      handleDownloadSingle(c)
      await new Promise(r => setTimeout(r, 200))
    }
  }

  const handleReset = () => {
    converted.forEach(c => URL.revokeObjectURL(c.outputUrl))
    setFiles([])
    setConverted([])
    setDone(false)
    setError(null)
  }

  const currentMode = MODES.find(m => m.value === mode)!

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <SEO
        title="Image Converter — JPG to PNG & PNG to JPG Free — EcomSathi"
        description="Convert between JPG and PNG image formats online for free. Batch conversion supported. Set background color for transparency. No signup needed."
        keywords="jpg to png converter free, png to jpg converter, jpeg to png online, convert image format free, batch image converter"
        canonicalUrl="https://ecomsathi.vercel.app/tools/image/converter"
        schema={PAGE_SCHEMA}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Image Converter</h1>
        <p className="text-sm text-[#64748B] mt-1">Convert between JPG and PNG formats. Batch conversion supported.</p>
      </div>

      {/* Mode selector */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-[#0F172A]">Conversion Direction</p>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => handleModeChange(m.value)}
              className={[
                'flex flex-col gap-1.5 px-4 py-3 border rounded-[8px] text-left transition-all',
                mode === m.value
                  ? 'border-2 border-[#2563EB] bg-[#EFF6FF]'
                  : 'border-[#E2E8F0] bg-white hover:border-[#2563EB]',
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={14} className={mode === m.value ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
                <span className={`text-sm font-bold ${mode === m.value ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                  {m.label}
                </span>
              </div>
              <span className="text-[11px] text-[#64748B]">{m.note}</span>
            </button>
          ))}
        </div>

        {/* PNG → JPG options */}
        {mode === 'png-to-jpg' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Background Color (for transparency)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded border border-[#E2E8F0] cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  maxLength={7}
                  className="border border-[#E2E8F0] rounded-[4px] px-2 py-1.5 text-sm w-24 font-mono focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => setBgColor('#FFFFFF')}
                  className="text-xs text-[#64748B] hover:text-[#2563EB] underline"
                >
                  White
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">JPEG Quality: {quality}%</label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="accent-[#2563EB]"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8]">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload zone */}
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
            Drag {currentMode.from} files here or{' '}
            <span className="text-[#2563EB] underline">click to browse</span>
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            {currentMode.from} · Multiple files · Max 20MB each
          </p>
        </div>
      </div>

      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0F172A]">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[#94A3B8] hover:text-[#DC2626] flex items-center gap-1"
            >
              <Trash2 size={13} /> Clear all
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {files.map((f, i) => {
              const c = converted[i]
              return (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3 border border-[#E2E8F0] rounded-[6px] px-3 py-2 bg-[#F8FAFC]"
                >
                  <FileImage size={16} className="text-[#2563EB] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F172A] truncate">{f.name}</p>
                    <p className="text-xs text-[#64748B]">
                      {formatBytes(f.size)}
                      {c && (
                        <span className="text-[#16A34A] ml-2">
                          → {formatBytes(c.outputSize)} .{c.outputExt.toUpperCase()}
                        </span>
                      )}
                    </p>
                  </div>
                  {c && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(c)}
                      className="text-[#2563EB] hover:text-[#1D4ED8] shrink-0"
                      title={`Download .${c.outputExt}`}
                    >
                      <Download size={15} />
                    </button>
                  )}
                  {!done && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-[#94A3B8] hover:text-[#DC2626] shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {!done && (
              <Button
                variant="primary"
                loading={processing}
                leftIcon={<FileImage size={15} />}
                onClick={handleConvert}
              >
                {processing
                  ? 'Converting…'
                  : `Convert ${files.length > 1 ? `All to ${currentMode.to}` : `to ${currentMode.to}`}`}
              </Button>
            )}
            {done && files.length > 1 && (
              <Button variant="primary" leftIcon={<Archive size={15} />} onClick={handleDownloadAll}>
                Download All {currentMode.to}
              </Button>
            )}
            {done && (
              <Button variant="ghost" onClick={handleReset}>
                Convert More Files
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Format comparison table — shown when no files uploaded */}
      {!files.length && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-[#0F172A]">JPG vs PNG — Which to Use?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-[#E2E8F0] rounded-[8px] overflow-hidden">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] border-b border-[#E2E8F0]">Format</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] border-b border-[#E2E8F0]">Best For</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] border-b border-[#E2E8F0]">File Size</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] border-b border-[#E2E8F0]">Transparency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {FORMAT_TABLE.map(row => (
                  <tr key={row.fmt} className="bg-white hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-[#0F172A]">{row.fmt}</td>
                    <td className="px-4 py-3 text-[#64748B]">{row.best}</td>
                    <td className="px-4 py-3 text-[#64748B]">{row.size}</td>
                    <td className="px-4 py-3 text-[#64748B]">{row.transparency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <ImageFAQ faqs={FAQS} />
    </div>
  )
}

export default ImageConverter
