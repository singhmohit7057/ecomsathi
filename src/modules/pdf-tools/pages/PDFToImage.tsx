import React, { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { pdfToImages } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem } from '../types'


const FAQS: FAQItem[] = [
  {
    question: 'What image formats can I convert PDF pages to?',
    answer: 'You can convert PDF pages to PNG or JPEG format.',
  },
  {
    question: 'What DPI options are available?',
    answer: '72 DPI for screen/web use, 150 DPI for standard quality, and 300 DPI for high-quality print or archiving.',
  },
  {
    question: 'How are multiple-page PDFs delivered?',
    answer: 'Each page is saved as a separate image file. All images are packaged into a ZIP archive for download.',
  },
  {
    question: 'Which DPI should I use for product listing images?',
    answer: 'Use 150 DPI for standard ecommerce listings. Use 300 DPI when you need high-resolution images for print catalogues.',
  },
  {
    question: 'Will the output images look identical to the PDF pages?',
    answer: 'Yes. Each page is rendered at the specified DPI to produce a pixel-perfect representation of the original page.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PDF to Image Converter Online Free',
  url: canonical('/pdf/pdf-to-image'),
  description: 'Convert PDF pages to PNG or JPEG images online for free. Choose 72, 150, or 300 DPI. Download as ZIP.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

export const PDFToImage: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()
  const [format, setFormat] = useState<'png' | 'jpeg'>('jpeg')
  const [dpi, setDpi] = useState(150)

  const handleConvert = () => {
    if (!pdfFile) return
    run(() => pdfToImages(pdfFile.file, format, dpi))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
  }

  return (
    <>
      <SEO
        title="PDF to Image Converter Online Free — PDF to PNG/JPEG — EcomSathi"
        description="Convert PDF pages to PNG or JPEG images online for free. Choose 72, 150, or 300 DPI. All pages packaged as ZIP. No signup required."
        keywords="pdf to image online free, pdf to jpg converter, pdf to png, convert pdf pages to images, pdf to jpeg, extract images from pdf"
        canonicalUrl={canonical('/pdf/pdf-to-image')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="PDF to Image"
        description="Convert PDF pages to PNG or JPEG images at 72, 150, or 300 DPI. All pages packaged as ZIP."
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
              <h2 className="text-sm font-semibold text-[#0F172A]">Conversion Settings</h2>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0F172A]">Output Format</label>
                <div className="flex gap-2">
                  {(['jpeg', 'png'] as const).map((f) => (
                    <button key={f} type="button" onClick={() => setFormat(f)}
                      className={['px-4 py-2 text-xs font-medium rounded border transition-all', format === f ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]'].join(' ')}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0F172A]">Resolution (DPI)</label>
                <div className="flex flex-wrap gap-2">
                  {[72, 150, 300].map((d) => (
                    <button key={d} type="button" onClick={() => setDpi(d)}
                      className={['px-4 py-2 text-xs font-medium rounded border transition-all', dpi === d ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]'].join(' ')}
                    >
                      {d} DPI
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#94A3B8]">
                  72 DPI = web · 150 DPI = standard · 300 DPI = high quality/print
                </p>
              </div>

              <button type="button" onClick={handleConvert} disabled={status === 'processing'}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Converting…</>
                ) : (
                  <><ImageIcon size={15} /> Convert to Images</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download ZIP" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About PDF to Image</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'PNG & JPEG Output', body: 'Choose PNG for lossless quality or JPEG for smaller file sizes.' },
                { title: 'Three DPI Settings', body: '72 DPI for web, 150 DPI for standard, 300 DPI for high-quality output.' },
                { title: 'All Pages Included', body: 'Every page in the PDF is converted and packaged in a ZIP archive.' },
                { title: 'Product Listing Use', body: 'Convert product catalogue PDFs into marketplace-ready images.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Convert PDF to Images</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your PDF file.', 'Choose output format (JPEG or PNG) and DPI.', 'Click "Convert to Images".', 'Download the ZIP archive with all page images.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/pdf-to-image')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default PDFToImage
