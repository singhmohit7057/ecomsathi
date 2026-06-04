import React, { useState, useCallback, useRef } from 'react'
import {
  Merge, GripVertical, FileText, X, ChevronUp, ChevronDown,
} from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { mergePDFs } from '../services/pdfApiService'
import { formatBytes, isPDF } from '../utils/pdfUtils'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem } from '../types'


const FAQS: FAQItem[] = [
  {
    question: 'How many PDF files can I merge at once?',
    answer: 'You can merge up to 20 PDF files at one time, with a combined total size of up to 50 MB.',
  },
  {
    question: 'Can I change the order of the PDFs before merging?',
    answer: 'Yes. Drag and drop the file rows to reorder them, or use the up/down arrow buttons.',
  },
  {
    question: 'Is my data safe when merging PDFs?',
    answer: 'Your files are sent over HTTPS to our secure server for processing and are automatically deleted after download. We never store or read your documents.',
  },
  {
    question: 'What is the maximum file size for merging?',
    answer: 'The combined total size of all files must not exceed 50 MB.',
  },
  {
    question: 'Does merging PDFs affect the quality of the content?',
    answer: 'No. Merging PDFs combines them at the file level without re-encoding, so image quality and formatting are fully preserved.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Merge PDF Online Free',
  url: canonical('/pdf/merge'),
  description: 'Free online PDF merger. Combine multiple PDFs into one file. Drag to reorder. No signup required.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

interface PdfEntry {
  id: string
  file: File
  pageCount: number | null
}

const MAX_FILES = 20
const MAX_TOTAL_MB = 50

export const MergePDF: React.FC = () => {
  const [entries, setEntries] = useState<PdfEntry[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragNode = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { status, error, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()

  const totalSize = entries.reduce((sum, e) => sum + e.file.size, 0)

  const addFiles = useCallback(
    (files: File[]) => {
      const pdfs = files.filter(isPDF)
      if (pdfs.length === 0) return
      if (entries.length + pdfs.length > MAX_FILES) return
      if (totalSize + pdfs.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_MB * 1024 * 1024) return

      const newEntries: PdfEntry[] = pdfs.map((f) => ({
        id: `${f.name}-${f.size}-${Math.random()}`,
        file: f,
        pageCount: null,
      }))
      setEntries((prev) => [...prev, ...newEntries])
    },
    [entries.length, totalSize],
  )

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    resetProc()
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    setEntries((prev) => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const moveDown = (idx: number) => {
    if (idx === entries.length - 1) return
    setEntries((prev) => {
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  const onDragStart = (id: string) => {
    setDraggingId(id)
    dragNode.current = id
  }

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

  const onDragEnd = () => {
    setDraggingId(null)
    setDragOverId(null)
    dragNode.current = null
  }

  const handleMerge = () => {
    if (entries.length < 2) return
    run(() => mergePDFs(entries.map((e) => e.file)))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    setEntries([])
  }

  return (
    <>
      <SEO
        title="Merge PDF Online Free — Combine PDF Files — EcomSathi"
        description="Merge multiple PDF files into one online for free. Drag to reorder. No login required. Combine invoices, shipping labels, and documents instantly."
        keywords="merge pdf online free, combine pdf files, pdf merger, join pdf online, combine multiple pdfs, merge pdf without watermark"
        canonicalUrl={canonical('/pdf/merge')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Merge PDF"
        description="Combine multiple PDF files into one document. Drag to reorder files before merging."
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
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />
            <FileText size={40} className="mx-auto text-[#94A3B8] mb-3" />
            <p className="text-sm font-medium text-[#0F172A]">
              Drag PDFs here or <span className="text-[#2563EB] underline">click to browse</span>
            </p>
            <p className="text-xs text-[#64748B] mt-1">Up to {MAX_FILES} files · Max {MAX_TOTAL_MB}MB total</p>
            {entries.length > 0 && (
              <p className="text-xs text-[#475569] mt-2">
                {entries.length} file{entries.length !== 1 ? 's' : ''} · {formatBytes(totalSize)}
              </p>
            )}
          </div>

          {/* Error */}
          {status === 'error' && error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FFF1F2] border border-[#FFE4E6] rounded-[8px] text-sm text-[#DC2626]">
              <span>⚠</span> {error}
            </div>
          )}

          {/* File list */}
          {entries.length > 0 && status !== 'done' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-[#0F172A]">Files to merge ({entries.length})</h2>

              <div className="flex flex-col gap-2">
                {entries.map((entry, idx) => (
                  <div
                    key={entry.id}
                    draggable
                    onDragStart={() => onDragStart(entry.id)}
                    onDragEnter={() => onDragEnter(entry.id)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={[
                      'flex items-center gap-3 rounded-[4px] border px-3 py-2.5 transition-all',
                      draggingId === entry.id ? 'opacity-40' : 'opacity-100',
                      dragOverId === entry.id
                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                        : 'border-[#E2E8F0] bg-white',
                    ].join(' ')}
                  >
                    <GripVertical size={15} className="shrink-0 cursor-grab text-[#94A3B8] active:cursor-grabbing" />

                    <div className="w-6 h-6 rounded-[4px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-[#2563EB]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-[#0F172A]">{entry.file.name}</p>
                      <p className="text-xs text-[#64748B]">{formatBytes(entry.file.size)}</p>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="rounded p-0.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(idx)}
                        disabled={idx === entries.length - 1}
                        className="rounded p-0.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="shrink-0 text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                      aria-label={`Remove ${entry.file.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#94A3B8]">Tip: Drag rows or use arrows to reorder files.</p>
            </div>
          )}

          {/* Merge button */}
          {entries.length >= 2 && status !== 'done' && (
            <button
              type="button"
              onClick={handleMerge}
              disabled={status === 'processing'}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'processing' ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Merging…
                </>
              ) : (
                <>
                  <Merge size={16} />
                  Merge {entries.length} PDFs
                </>
              )}
            </button>
          )}

          {/* Result */}
          {status === 'done' && result && (
            <PDFDownload
              url={result.url}
              filename={result.filename}
              size={result.size}
              label="Download Merged PDF"
              onReset={handleReset}
            />
          )}

          {/* Features */}
          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Merge PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Reorder Before Merging', body: 'Drag and drop rows or use arrow buttons to set the exact page order.' },
                { title: 'Up to 20 Files', body: 'Merge up to 20 PDF files in one operation.' },
                { title: 'Preserves Quality', body: 'PDFs are combined at the file level with no re-encoding — fonts, images, and formatting are intact.' },
                { title: 'For Ecommerce Sellers', body: 'Combine shipping manifests, invoices, and GST documents into single files.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Merge PDF Files</h2>
            <ol className="flex flex-col gap-3">
              {[
                'Click "Browse" or drag your PDF files into the upload area.',
                'Reorder the files by dragging rows or using the arrow buttons.',
                'Click "Merge PDFs" and wait a moment for processing.',
                'Download your merged PDF file.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ */}
          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/merge')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default MergePDF
