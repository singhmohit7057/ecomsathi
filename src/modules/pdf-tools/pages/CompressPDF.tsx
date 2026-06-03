import React, { useState } from 'react'
import { FileArchive } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { compressPDF } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool, CompressionLevel } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'Merge PDF',     to: '/pdf/merge',     description: 'Combine PDFs' },
  { label: 'Split PDF',     to: '/pdf/split',     description: 'Split into parts' },
  { label: 'Watermark PDF', to: '/pdf/watermark', description: 'Add watermark' },
  { label: 'Rotate PDF',    to: '/pdf/rotate',    description: 'Rotate pages' },
]

const FAQS: FAQItem[] = [
  {
    question: 'How much can PDF compression reduce file size?',
    answer: 'Results vary based on the content. PDFs with high-resolution images can be reduced by 50–80%. Text-heavy PDFs with no images may see little reduction.',
  },
  {
    question: 'What is the difference between Light, Balanced, and Maximum compression?',
    answer: 'Light compression reduces file size slightly with no visible quality change. Balanced offers good size reduction with minimal quality loss. Maximum achieves the smallest file size but may reduce image quality noticeably.',
  },
  {
    question: 'Will compression affect text in my PDF?',
    answer: 'No. Text is not re-encoded during compression. Only embedded images are optimised.',
  },
  {
    question: 'What is the maximum file size I can compress?',
    answer: 'Files up to 50 MB can be compressed using this tool.',
  },
  {
    question: 'Is it safe to compress my PDF online?',
    answer: 'Yes. Files are processed over HTTPS and automatically deleted from our servers after processing.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Compress PDF Online Free',
  url: canonical('/pdf/compress'),
  description: 'Compress PDF files online free. Reduce PDF size with Light, Balanced, or Maximum compression. No signup.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const LEVELS: { value: CompressionLevel; label: string; desc: string }[] = [
  { value: 'light',    label: 'Light',    desc: 'Minimal compression, best quality' },
  { value: 'balanced', label: 'Balanced', desc: 'Good compression, slight quality loss' },
  { value: 'maximum',  label: 'Maximum',  desc: 'Smallest file, reduced image quality' },
]

export const CompressPDF: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()
  const [level, setLevel] = useState<CompressionLevel>('balanced')

  const handleCompress = () => {
    if (!pdfFile) return
    run(() => compressPDF(pdfFile.file, level))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
  }

  return (
    <>
      <SEO
        title="Compress PDF Online Free — Reduce PDF Size — EcomSathi"
        description="Compress PDF files online for free. Reduce PDF size by up to 80%. Choose Light, Balanced, or Maximum compression. No login, no watermark."
        keywords="compress pdf online free, reduce pdf size, pdf compressor, shrink pdf, pdf file size reducer, compress pdf without losing quality"
        canonicalUrl={canonical('/pdf/compress')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Compress PDF"
        description="Reduce PDF file size with Light, Balanced, or Maximum compression. No quality loss on text."
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
              <h2 className="text-sm font-semibold text-[#0F172A]">Compression Level</h2>

              <div className="flex flex-col gap-3">
                {LEVELS.map((opt) => (
                  <label
                    key={opt.value}
                    className={[
                      'flex items-start gap-3 p-4 rounded-[6px] border cursor-pointer transition-all',
                      level === opt.value
                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={opt.value}
                      checked={level === opt.value}
                      onChange={() => setLevel(opt.value)}
                      className="mt-0.5 accent-[#2563EB]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{opt.label}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCompress}
                disabled={status === 'processing'}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Compressing…</>
                ) : (
                  <><FileArchive size={15} /> Compress PDF</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload
              url={result.url}
              filename={result.filename}
              size={result.size}
              originalSize={pdfFile?.size}
              label="Download Compressed PDF"
              onReset={handleReset}
            />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Compress PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Three Compression Modes', body: 'Choose Light, Balanced, or Maximum depending on your quality and size requirements.' },
                { title: 'Up to 80% Smaller', body: 'Image-heavy PDFs can be dramatically reduced in file size.' },
                { title: 'Text Unaffected', body: 'Only images are optimised — text, fonts, and structure are preserved.' },
                { title: 'Email-Ready Files', body: 'Reduce PDF sizes to meet email attachment limits for GST filings and invoices.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Compress a PDF</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your PDF file.', 'Select a compression level.', 'Click "Compress PDF".', 'Download the compressed PDF.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/compress')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default CompressPDF
