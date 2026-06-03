import React, { useState } from 'react'
import { Hash } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { addPageNumbers } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool, PageNumberPosition } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'Watermark PDF', to: '/pdf/watermark', description: 'Add text watermark' },
  { label: 'Merge PDF',     to: '/pdf/merge',     description: 'Combine PDFs' },
  { label: 'Compress PDF',  to: '/pdf/compress',  description: 'Reduce file size' },
  { label: 'Rotate PDF',    to: '/pdf/rotate',    description: 'Rotate pages' },
]

const FAQS: FAQItem[] = [
  {
    question: 'Can I start page numbering from a number other than 1?',
    answer: 'Yes. Set the "Start number" to any value. This is useful for documents that are part of a larger set.',
  },
  {
    question: 'Can I skip page numbers on the first page?',
    answer: 'Yes. Enable "Skip first page" to leave the cover or title page without a page number.',
  },
  {
    question: 'Can I add a prefix or suffix like "Page X of Y"?',
    answer: 'You can add a prefix (e.g., "Page ") and a suffix (e.g., ""). For "Page X of Y" style, set prefix to "Page " and the suffix to the total count is added separately.',
  },
  {
    question: 'Where can the page number be placed?',
    answer: 'Choose from top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right.',
  },
  {
    question: 'Can I change the font size and color?',
    answer: 'Yes. You can set the font size and choose any color using the color picker.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Add Page Numbers to PDF Online Free',
  url: canonical('/pdf/page-numbers'),
  description: 'Add page numbers to PDF online for free. Custom position, style, and font. No signup required.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const POSITIONS: { value: PageNumberPosition; label: string }[] = [
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-left',   label: 'Bottom Left' },
  { value: 'bottom-right',  label: 'Bottom Right' },
  { value: 'top-center',    label: 'Top Center' },
  { value: 'top-left',      label: 'Top Left' },
  { value: 'top-right',     label: 'Top Right' },
]

export const PageNumbersPDF: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()

  const [position, setPosition] = useState<PageNumberPosition>('bottom-center')
  const [startNumber, setStartNumber] = useState(1)
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [fontSize, setFontSize] = useState(11)
  const [color, setColor] = useState('#000000')
  const [skipFirst, setSkipFirst] = useState(false)

  const handleAdd = () => {
    if (!pdfFile) return
    run(() => addPageNumbers(pdfFile.file, position, startNumber, prefix, suffix, fontSize, color, skipFirst))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
  }

  const previewText = `${prefix}${startNumber}${suffix}`

  return (
    <>
      <SEO
        title="Add Page Numbers to PDF Online Free — EcomSathi"
        description="Add page numbers to PDF online for free. Choose position, font size, color, prefix, and suffix. Skip first page option. No signup required."
        keywords="add page numbers to pdf online free, pdf page numbering, number pdf pages, pdf footer page number, pdf header numbering"
        canonicalUrl={canonical('/pdf/page-numbers')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Add Page Numbers to PDF"
        description="Add page numbers with custom position, style, color, prefix, and suffix to every page."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-6">
          <PDFUploader pdfFile={pdfFile} isLoading={isLoading} error={fileError} onDrop={onDrop} onReset={handleReset} />

          {status === 'error' && procError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FFF1F2] border border-[#FFE4E6] rounded-[8px] text-sm text-[#DC2626]">
              <span>⚠</span> {procError}
            </div>
          )}

          {pdfFile && status !== 'done' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">Page Number Settings</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Position</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value as PageNumberPosition)} className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]">
                    {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Start Number</label>
                  <input type="number" min={1} value={startNumber} onChange={(e) => setStartNumber(Number(e.target.value))} className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Prefix</label>
                  <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. Page " className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Suffix</label>
                  <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g.  of 10" className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Font Size (pt)</label>
                  <input type="number" min={6} max={36} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 border border-[#E2E8F0] rounded-[4px] cursor-pointer p-0.5" />
                    <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={skipFirst} onChange={(e) => setSkipFirst(e.target.checked)} className="accent-[#2563EB] w-4 h-4" />
                <span className="text-sm text-[#0F172A]">Skip first page (cover/title page)</span>
              </label>

              {/* Preview */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-3 text-xs text-[#64748B]">
                Preview: <span style={{ color, fontWeight: 600, fontSize: Math.max(11, fontSize * 0.85) }}>{previewText}</span>
              </div>

              <button type="button" onClick={handleAdd} disabled={status === 'processing'}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Adding Page Numbers…</>
                ) : (
                  <><Hash size={15} /> Add Page Numbers</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download Numbered PDF" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Add Page Numbers to PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: '6 Position Options', body: 'Place page numbers at top or bottom in left, center, or right alignment.' },
                { title: 'Custom Start Number', body: 'Begin numbering from any number — useful for multi-document sets.' },
                { title: 'Prefix & Suffix', body: 'Add "Page " prefix or " of 10" suffix for a professional look.' },
                { title: 'Skip First Page', body: 'Exclude the cover or title page from numbering with one click.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Add Page Numbers to PDF</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your PDF file.', 'Choose position, start number, prefix, suffix, font, and color.', 'Click "Add Page Numbers".', 'Download the numbered PDF.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/page-numbers')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default PageNumbersPDF
