import React, { useState } from 'react'
import { Crop } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { cropPDF } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'Merge PDF',     to: '/pdf/merge',     description: 'Combine PDFs into one' },
  { label: 'Compress PDF',  to: '/pdf/compress',  description: 'Reduce file size' },
  { label: 'Rotate PDF',    to: '/pdf/rotate',    description: 'Rotate PDF pages' },
  { label: 'Watermark PDF', to: '/pdf/watermark', description: 'Add text watermark' },
]

const FAQS: FAQItem[] = [
  {
    question: 'What does cropping a PDF do?',
    answer: 'Cropping a PDF trims the visible area of each page by specifying margins (in points) to remove from each side.',
  },
  {
    question: 'Can I crop only specific pages?',
    answer: 'Yes. You can apply the crop to all pages or specify a page range such as "1-3, 5".',
  },
  {
    question: 'What units are used for the crop values?',
    answer: 'Crop margins are specified in PDF points (1 point = 1/72 inch). A standard A4 page is 595 × 842 points.',
  },
  {
    question: 'Will cropping a PDF reduce its file size?',
    answer: 'Not significantly. PDF cropping only changes the visible area (media box); the hidden content remains in the file. Use Compress PDF for file size reduction.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Crop PDF Online Free',
  url: canonical('/pdf/crop'),
  description: 'Crop PDF pages by specifying margins. Trim all or selected pages. Free online PDF cropper.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

interface CropMargins {
  top: number
  right: number
  bottom: number
  left: number
}

export const CropPDF: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()

  const [margins, setMargins] = useState<CropMargins>({ top: 36, right: 36, bottom: 36, left: 36 })
  const [pages, setPages] = useState('all')

  const setMargin = (side: keyof CropMargins, value: number) =>
    setMargins((m) => ({ ...m, [side]: value }))

  const handleCrop = () => {
    if (!pdfFile) return
    const { left, top, right, bottom } = margins
    run(() => cropPDF(pdfFile.file, left, top, right - left, bottom - top, pages))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
    setMargins({ top: 36, right: 36, bottom: 36, left: 36 })
    setPages('all')
  }

  return (
    <>
      <SEO
        title="Crop PDF Online Free — Trim PDF Margins — EcomSathi"
        description="Crop PDF pages online for free. Trim margins from all or selected pages. No signup required. Fast and secure PDF cropper."
        keywords="crop pdf online free, trim pdf margins, pdf cropper, crop pdf pages, remove margins pdf, pdf page cropper"
        canonicalUrl={canonical('/pdf/crop')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Crop PDF"
        description="Trim PDF page margins. Set crop values for all or specific pages."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-6">
          <PDFUploader
            pdfFile={pdfFile}
            isLoading={isLoading}
            error={fileError}
            onDrop={onDrop}
            onReset={handleReset}
          />

          {status === 'error' && procError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FFF1F2] border border-[#FFE4E6] rounded-[8px] text-sm text-[#DC2626]">
              <span>⚠</span> {procError}
            </div>
          )}

          {pdfFile && status !== 'done' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">Crop Settings</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['top', 'right', 'bottom', 'left'] as (keyof CropMargins)[]).map((side) => (
                  <div key={side} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#0F172A] capitalize">{side} (pt)</label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={margins[side]}
                      onChange={(e) => setMargin(side, Number(e.target.value))}
                      className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Pages</label>
                <input
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="all  or  1-3, 5"
                  className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
                <p className="text-xs text-[#94A3B8]">Enter "all" or a range like "1-3, 5".</p>
              </div>

              <button
                type="button"
                onClick={handleCrop}
                disabled={status === 'processing'}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Cropping…</>
                ) : (
                  <><Crop size={15} /> Crop PDF</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download Cropped PDF" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Crop PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Margin-Based Cropping', body: 'Specify exact margins in points to trim each side of the page.' },
                { title: 'Selective Page Cropping', body: 'Apply crop to all pages or specific pages using range notation.' },
                { title: 'Common Presets', body: '72 pt ≈ 1 inch. A4 is 595×842 pt; standard crop is 36 pt.' },
                { title: 'Useful for Sellers', body: 'Crop large-margin scanned invoices and shipping documents.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Crop a PDF</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your PDF file.', 'Enter the crop margins in points for each side.', 'Specify which pages to crop (all or range).', 'Click "Crop PDF" and download the result.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/crop')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default CropPDF
