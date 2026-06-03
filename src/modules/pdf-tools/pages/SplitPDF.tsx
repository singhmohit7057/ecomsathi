import React, { useState } from 'react'
import { Scissors } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { splitPDF } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'Merge PDF',       to: '/pdf/merge',         description: 'Combine PDFs into one' },
  { label: 'Extract Pages',   to: '/pdf/extract-pages', description: 'Extract specific pages' },
  { label: 'Rearrange Pages', to: '/pdf/rearrange-pages', description: 'Reorder pages' },
  { label: 'Compress PDF',    to: '/pdf/compress',      description: 'Reduce file size' },
]

const FAQS: FAQItem[] = [
  {
    question: 'What split modes are available?',
    answer: 'You can split by custom page ranges (e.g., "1-3,5,7-9"), split every N pages, or extract each page as its own PDF.',
  },
  {
    question: 'What does the output look like?',
    answer: 'Split PDFs are packaged into a ZIP archive for download. Each part is named sequentially.',
  },
  {
    question: 'Can I extract a single page using Split PDF?',
    answer: 'Yes. In "Page ranges" mode, enter a single page number (e.g., "3") to extract just that page. Alternatively, use the Extract Pages tool.',
  },
  {
    question: 'Is there a size limit for splitting?',
    answer: 'The input PDF must be under 50 MB.',
  },
  {
    question: 'How do I split a 100-page PDF into 10-page chunks?',
    answer: 'Use "Every N pages" mode and set N to 10. The tool will create 10 separate PDF files, each with 10 pages.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Split PDF Online Free',
  url: canonical('/pdf/split'),
  description: 'Split PDF files by page ranges, every N pages, or into individual pages. Free online PDF splitter.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

type SplitMode = 'ranges' | 'every-n' | 'individual'

export const SplitPDF: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()

  const [mode, setMode] = useState<SplitMode>('ranges')
  const [ranges, setRanges] = useState('')
  const [everyN, setEveryN] = useState(1)

  const handleSplit = () => {
    if (!pdfFile) return
    run(() => splitPDF(pdfFile.file, mode, ranges || undefined, everyN))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
    setRanges('')
    setEveryN(1)
  }

  return (
    <>
      <SEO
        title="Split PDF Online Free — PDF Splitter — EcomSathi"
        description="Split PDF files by page ranges, every N pages, or extract individual pages. Free online PDF splitter. No login required. Download as ZIP."
        keywords="split pdf online free, pdf splitter, split pdf by pages, separate pdf pages, extract pages from pdf, divide pdf"
        canonicalUrl={canonical('/pdf/split')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Split PDF"
        description="Split a PDF by page ranges, every N pages, or extract each page as a separate file."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-6">
          {/* Upload */}
          <PDFUploader
            pdfFile={pdfFile}
            isLoading={isLoading}
            error={fileError}
            onDrop={onDrop}
            onReset={handleReset}
          />

          {/* Error */}
          {status === 'error' && procError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FFF1F2] border border-[#FFE4E6] rounded-[8px] text-sm text-[#DC2626]">
              <span>⚠</span> {procError}
            </div>
          )}

          {/* Options */}
          {pdfFile && status !== 'done' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">Split Options</h2>

              {/* Mode selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0F172A]">Split Mode</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'ranges', label: 'Page ranges' },
                    { value: 'every-n', label: 'Every N pages' },
                    { value: 'individual', label: 'Individual pages' },
                  ] as { value: SplitMode; label: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMode(opt.value)}
                      className={[
                        'px-3 py-1.5 text-xs font-medium rounded border transition-all',
                        mode === opt.value
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'ranges' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Page Ranges</label>
                  <input
                    type="text"
                    value={ranges}
                    onChange={(e) => setRanges(e.target.value)}
                    placeholder="e.g. 1-3, 5, 7-9"
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                  <p className="text-xs text-[#94A3B8]">Separate ranges with commas. Each range becomes one PDF.</p>
                </div>
              )}

              {mode === 'every-n' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Pages per chunk</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={everyN}
                    onChange={(e) => setEveryN(Number(e.target.value))}
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm w-24 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              )}

              {mode === 'individual' && (
                <p className="text-sm text-[#64748B]">
                  Each page will be extracted as a separate PDF. All files will be packaged in a ZIP archive.
                </p>
              )}

              <button
                type="button"
                onClick={handleSplit}
                disabled={status === 'processing' || (mode === 'ranges' && !ranges.trim())}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Splitting…
                  </>
                ) : (
                  <>
                    <Scissors size={15} />
                    Split PDF
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result */}
          {status === 'done' && result && (
            <PDFDownload
              url={result.url}
              filename={result.filename}
              size={result.size}
              label="Download ZIP"
              onReset={handleReset}
            />
          )}

          {/* Features */}
          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Split PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Three Split Modes', body: 'Split by custom ranges, fixed chunks, or extract each page individually.' },
                { title: 'Custom Page Ranges', body: 'Use ranges like "1-3, 5, 7-9" to create exactly the parts you need.' },
                { title: 'ZIP Download', body: 'Multiple PDF parts are bundled into a convenient ZIP archive.' },
                { title: 'No Size Loss', body: 'Pages are extracted cleanly with no quality loss.' },
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
            <h2 className="text-lg font-bold text-[#0F172A]">How to Split a PDF</h2>
            <ol className="flex flex-col gap-3">
              {[
                'Upload your PDF file.',
                'Choose a split mode: page ranges, every N pages, or individual pages.',
                'Click "Split PDF" and wait for processing.',
                'Download the ZIP archive containing your split PDF files.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/split')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default SplitPDF
