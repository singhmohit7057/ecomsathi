import React, { useState, useRef } from 'react'
import { FilePlus, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { imagesToPDF } from '../services/pdfApiService'
import { formatBytes, isImage } from '../utils/pdfUtils'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'PDF to Image', to: '/pdf/pdf-to-image', description: 'Convert PDF to images' },
  { label: 'Merge PDF',    to: '/pdf/merge',        description: 'Combine PDFs' },
  { label: 'Compress PDF', to: '/pdf/compress',     description: 'Reduce file size' },
  { label: 'Watermark PDF', to: '/pdf/watermark',   description: 'Add watermark' },
]

const FAQS: FAQItem[] = [
  {
    question: 'Which image formats are supported?',
    answer: 'JPG/JPEG, PNG, and WEBP images are supported.',
  },
  {
    question: 'Can I control the order of images in the PDF?',
    answer: 'Yes. Drag and drop the image rows or use the arrow buttons to reorder them before converting.',
  },
  {
    question: 'How many images can I convert in one operation?',
    answer: 'Up to 20 images with a combined total of 50 MB.',
  },
  {
    question: 'Will the PDF page size match the image size?',
    answer: 'Each image is placed on a PDF page that matches the image dimensions. Landscape images get landscape pages.',
  },
  {
    question: 'Is this useful for ecommerce sellers?',
    answer: 'Yes. You can combine product images, screenshots, and scanned documents into a single PDF for sending to suppliers, distributors, or clients.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Image to PDF Converter Online Free',
  url: canonical('/pdf/image-to-pdf'),
  description: 'Convert JPG, PNG, and WEBP images to a single PDF online for free. Reorder images before converting.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

interface ImageEntry {
  id: string
  file: File
  preview: string
}

const MAX_FILES = 20
const MAX_TOTAL_MB = 50

export const ImageToPDF: React.FC = () => {
  const [entries, setEntries] = useState<ImageEntry[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragNode = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()

  const totalSize = entries.reduce((sum, e) => sum + e.file.size, 0)

  const addFiles = (files: File[]) => {
    const imgs = files.filter(isImage)
    if (!imgs.length) return
    if (entries.length + imgs.length > MAX_FILES) return
    if (totalSize + imgs.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_MB * 1024 * 1024) return

    const newEntries: ImageEntry[] = imgs.map((f) => ({
      id: `${f.name}-${f.size}-${Math.random()}`,
      file: f,
      preview: URL.createObjectURL(f),
    }))
    setEntries((prev) => [...prev, ...newEntries])
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id)
      if (entry) URL.revokeObjectURL(entry.preview)
      return prev.filter((e) => e.id !== id)
    })
    resetProc()
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    setEntries((prev) => { const next = [...prev]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; return next })
  }

  const moveDown = (idx: number) => {
    if (idx === entries.length - 1) return
    setEntries((prev) => { const next = [...prev]; [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; return next })
  }

  const onDragStart = (id: string) => { setDraggingId(id); dragNode.current = id }
  const onDragEnter = (id: string) => {
    if (dragNode.current === id) return
    setDragOverId(id)
    setEntries((prev) => {
      const from = prev.findIndex((e) => e.id === dragNode.current)
      const to = prev.findIndex((e) => e.id === id)
      if (from === -1 || to === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }
  const onDragEnd = () => { setDraggingId(null); setDragOverId(null); dragNode.current = null }

  const handleConvert = () => {
    if (entries.length === 0) return
    run(() => imagesToPDF(entries.map((e) => e.file)))
  }

  const handleReset = () => {
    entries.forEach((e) => URL.revokeObjectURL(e.preview))
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    setEntries([])
  }

  return (
    <>
      <SEO
        title="Image to PDF Converter Online Free — JPG PNG to PDF — EcomSathi"
        description="Convert JPG, PNG, and WEBP images to a PDF online for free. Reorder images before converting. No login required. Combine up to 20 images."
        keywords="image to pdf converter free, jpg to pdf online, png to pdf, convert images to pdf, combine images to pdf, photos to pdf"
        canonicalUrl={canonical('/pdf/image-to-pdf')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Image to PDF"
        description="Combine JPG, PNG, or WEBP images into a single PDF. Drag to reorder before converting."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-6">
          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] rounded-[8px] p-10 text-center cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)) }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />
            <FilePlus size={40} className="mx-auto text-[#94A3B8] mb-3" />
            <p className="text-sm font-medium text-[#0F172A]">
              Drag images here or <span className="text-[#2563EB] underline">click to browse</span>
            </p>
            <p className="text-xs text-[#64748B] mt-1">JPG, PNG, WEBP · Up to {MAX_FILES} images · Max {MAX_TOTAL_MB}MB total</p>
          </div>

          {status === 'error' && procError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FFF1F2] border border-[#FFE4E6] rounded-[8px] text-sm text-[#DC2626]">
              <span>⚠</span> {procError}
            </div>
          )}

          {/* Image list */}
          {entries.length > 0 && status !== 'done' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-[#0F172A]">Images ({entries.length})</h2>
              <div className="flex flex-col gap-2">
                {entries.map((entry, idx) => (
                  <div
                    key={entry.id}
                    draggable
                    onDragStart={() => onDragStart(entry.id)}
                    onDragEnter={() => onDragEnter(entry.id)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={['flex items-center gap-3 rounded-[4px] border px-3 py-2.5 transition-all', draggingId === entry.id ? 'opacity-40' : 'opacity-100', dragOverId === entry.id ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] bg-white'].join(' ')}
                  >
                    <GripVertical size={15} className="shrink-0 cursor-grab text-[#94A3B8]" />
                    <img src={entry.preview} alt="" className="h-10 w-8 rounded-[2px] object-cover border border-[#E2E8F0] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-[#0F172A]">{entry.file.name}</p>
                      <p className="text-xs text-[#64748B]">{formatBytes(entry.file.size)}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} className="rounded p-0.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30"><ChevronUp size={13} /></button>
                      <button type="button" onClick={() => moveDown(idx)} disabled={idx === entries.length - 1} className="rounded p-0.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30"><ChevronDown size={13} /></button>
                    </div>
                    <button type="button" onClick={() => removeEntry(entry.id)} className="shrink-0 text-[#94A3B8] hover:text-[#DC2626] transition-colors"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entries.length > 0 && status !== 'done' && (
            <button type="button" onClick={handleConvert} disabled={status === 'processing'}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'processing' ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Converting…</>
              ) : (
                <><FilePlus size={15} /> Convert to PDF</>
              )}
            </button>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download PDF" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Image to PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Multiple Formats', body: 'JPG, JPEG, PNG, and WEBP images are all supported.' },
                { title: 'Reorder Before Converting', body: 'Drag and drop or use arrows to set the exact page order in the PDF.' },
                { title: 'Up to 20 Images', body: 'Combine up to 20 images into a single PDF in one operation.' },
                { title: 'Auto Page Sizing', body: 'Each PDF page is automatically sized to match the image dimensions.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Convert Images to PDF</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your JPG, PNG, or WEBP images.', 'Drag to reorder if needed.', 'Click "Convert to PDF".', 'Download the combined PDF.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/image-to-pdf')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default ImageToPDF
