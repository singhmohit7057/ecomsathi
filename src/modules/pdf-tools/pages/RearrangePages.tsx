import React, { useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { rearrangePages } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'Extract Pages', to: '/pdf/extract-pages', description: 'Extract specific pages' },
  { label: 'Merge PDF',     to: '/pdf/merge',         description: 'Combine PDFs' },
  { label: 'Split PDF',     to: '/pdf/split',         description: 'Split into parts' },
  { label: 'Rotate PDF',    to: '/pdf/rotate',        description: 'Rotate pages' },
]

const FAQS: FAQItem[] = [
  {
    question: 'How do I specify a new page order?',
    answer: 'Enter the new page order as a comma-separated list. For example, for a 4-page PDF, enter "3,1,4,2" to put page 3 first, then page 1, then 4, then 2.',
  },
  {
    question: 'Can I delete pages by rearranging?',
    answer: 'Yes. Simply omit a page number from the order list to exclude it from the output PDF.',
  },
  {
    question: 'Can I duplicate a page?',
    answer: 'Yes. Include the same page number multiple times in the order list to duplicate it.',
  },
  {
    question: 'What is the maximum number of pages I can rearrange?',
    answer: 'There is no page count limit. The only constraint is that the input PDF must be under 50 MB.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Rearrange PDF Pages Online Free',
  url: canonical('/pdf/rearrange-pages'),
  description: 'Rearrange, reorder, or delete pages in a PDF online for free. No signup required.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

export const RearrangePages: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()
  const [order, setOrder] = useState('')

  const handleRearrange = () => {
    if (!pdfFile || !order.trim()) return
    const parsedOrder = order.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
    if (parsedOrder.length === 0) return
    run(() => rearrangePages(pdfFile.file, parsedOrder))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
    setOrder('')
  }

  return (
    <>
      <SEO
        title="Rearrange PDF Pages Online Free — Reorder PDF Pages — EcomSathi"
        description="Rearrange and reorder pages in a PDF online for free. Delete or duplicate pages. No login required. Fast and secure."
        keywords="rearrange pdf pages online free, reorder pdf pages, reorganize pdf, change pdf page order, delete pdf pages, pdf page organizer"
        canonicalUrl={canonical('/pdf/rearrange-pages')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Rearrange PDF Pages"
        description="Reorder, delete, or duplicate pages in a PDF by specifying a new page order."
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
              <h2 className="text-sm font-semibold text-[#0F172A]">New Page Order</h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Page Order</label>
                <input
                  type="text"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  placeholder="e.g. 3, 1, 4, 2"
                  className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
                <p className="text-xs text-[#94A3B8]">
                  Enter page numbers separated by commas. Omit a page to delete it. Repeat a page to duplicate it.
                </p>
              </div>

              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] p-3 text-xs text-[#1E40AF]">
                <strong>Example:</strong> For a 5-page PDF, "3, 1, 2, 5" puts page 3 first, reverses pages 1 and 2, and skips page 4.
              </div>

              <button
                type="button"
                onClick={handleRearrange}
                disabled={status === 'processing' || !order.trim()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Rearranging…</>
                ) : (
                  <><LayoutGrid size={15} /> Rearrange Pages</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download Rearranged PDF" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Rearrange PDF Pages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Custom Page Order', body: 'Specify any order for your pages using comma-separated numbers.' },
                { title: 'Delete Pages', body: 'Exclude a page number from the list to remove it from the output.' },
                { title: 'Duplicate Pages', body: 'Repeat a page number to include it multiple times in the output.' },
                { title: 'Quality Preserved', body: 'Page content is not modified — only the order changes.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Rearrange PDF Pages</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your PDF.', 'Enter the new page order as comma-separated numbers.', 'Click "Rearrange Pages".', 'Download the reordered PDF.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/rearrange-pages')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default RearrangePages
