import React, { useState } from 'react'
import { FileMinus } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { extractPages } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'Split PDF',       to: '/pdf/split',           description: 'Split into multiple files' },
  { label: 'Rearrange Pages', to: '/pdf/rearrange-pages', description: 'Reorder pages' },
  { label: 'Merge PDF',       to: '/pdf/merge',           description: 'Combine PDFs' },
  { label: 'Compress PDF',    to: '/pdf/compress',        description: 'Reduce file size' },
]

const FAQS: FAQItem[] = [
  {
    question: 'What is the difference between Extract Pages and Split PDF?',
    answer: 'Extract Pages creates a single new PDF from selected pages. Split PDF creates multiple PDF files (one per range or chunk). Use Extract Pages when you want specific pages in one document.',
  },
  {
    question: 'Can I specify non-consecutive pages?',
    answer: 'Yes. Use a comma-separated list like "1, 3, 7-9" to extract pages in any order.',
  },
  {
    question: 'Will the extracted pages retain their original formatting?',
    answer: 'Yes. Pages are extracted exactly as they appear in the original PDF, including fonts, images, and layout.',
  },
  {
    question: 'Is there a limit on how many pages I can extract?',
    answer: 'No page count limit. You can extract any number of pages from the PDF as long as the input file is under 50 MB.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Extract PDF Pages Online Free',
  url: canonical('/pdf/extract-pages'),
  description: 'Extract specific pages from a PDF and save them as a new PDF. Free online PDF page extractor.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

export const ExtractPages: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()
  const [pages, setPages] = useState('')

  const handleExtract = () => {
    if (!pdfFile || !pages.trim()) return
    run(() => extractPages(pdfFile.file, pages))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
    setPages('')
  }

  return (
    <>
      <SEO
        title="Extract PDF Pages Online Free — PDF Page Extractor — EcomSathi"
        description="Extract specific pages from a PDF and save as a new file. Free online PDF page extractor. Supports page ranges and individual pages. No signup."
        keywords="extract pdf pages online free, pdf page extractor, extract pages from pdf, select pages pdf, pdf page selector, save pdf pages"
        canonicalUrl={canonical('/pdf/extract-pages')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Extract PDF Pages"
        description="Select specific pages from a PDF and extract them into a new PDF document."
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
              <h2 className="text-sm font-semibold text-[#0F172A]">Pages to Extract</h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Page Range</label>
                <input
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="e.g. 1, 3-5, 8"
                  className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
                <p className="text-xs text-[#94A3B8]">Separate page numbers and ranges with commas. e.g., "1, 3-5, 8"</p>
              </div>

              <button
                type="button"
                onClick={handleExtract}
                disabled={status === 'processing' || !pages.trim()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Extracting…</>
                ) : (
                  <><FileMinus size={15} /> Extract Pages</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download Extracted PDF" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Extract PDF Pages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Flexible Selection', body: 'Extract individual pages, ranges, or any combination.' },
                { title: 'Single PDF Output', body: 'Selected pages are combined into one new PDF in the order specified.' },
                { title: 'Original Quality', body: 'Extracted pages retain their original formatting, fonts, and images.' },
                { title: 'Useful for Invoices', body: 'Pull specific invoice or statement pages from bulk document downloads.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Extract PDF Pages</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your PDF file.', 'Enter the page numbers or ranges to extract.', 'Click "Extract Pages".', 'Download the new PDF with your selected pages.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/extract-pages')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default ExtractPages
