import React, { useState } from 'react'
import { ScanText } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { ocrPDF } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem } from '../types'


const FAQS: FAQItem[] = [
  {
    question: 'What is OCR and why do I need it?',
    answer: 'OCR (Optical Character Recognition) converts scanned images in a PDF into selectable and searchable text. This is essential for scanned invoices, GST certificates, and documents.',
  },
  {
    question: 'Which languages are supported for OCR?',
    answer: 'English, Hindi, and other common Indian languages are supported. Select the language that matches the content of your document for best accuracy.',
  },
  {
    question: 'Does OCR work on all PDFs?',
    answer: 'OCR works best on clearly scanned documents. Handwritten text, very low-resolution scans, or pages with heavy noise may produce less accurate results.',
  },
  {
    question: 'Will the output PDF look different from the original?',
    answer: 'The output retains the original page images but adds a hidden text layer, making the document searchable and copy-able without changing its appearance.',
  },
  {
    question: 'Is my scanned document kept private?',
    answer: 'Yes. Files are processed on a secure server and are automatically deleted after processing. We never store or read your documents.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OCR PDF Online Free',
  url: canonical('/pdf/ocr'),
  description: 'Extract text from scanned PDFs using OCR. Make PDF searchable. Free online OCR PDF tool.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const LANGUAGES = [
  { value: 'eng', label: 'English' },
  { value: 'hin', label: 'Hindi' },
  { value: 'ben', label: 'Bengali' },
  { value: 'tam', label: 'Tamil' },
  { value: 'tel', label: 'Telugu' },
  { value: 'mar', label: 'Marathi' },
  { value: 'guj', label: 'Gujarati' },
  { value: 'kan', label: 'Kannada' },
  { value: 'mal', label: 'Malayalam' },
]

export const OCRPDF: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()
  const [lang, setLang] = useState('eng')

  const handleOCR = () => {
    if (!pdfFile) return
    run(() => ocrPDF(pdfFile.file, lang))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
  }

  return (
    <>
      <SEO
        title="OCR PDF Online Free — Make Scanned PDF Searchable — EcomSathi"
        description="Extract text from scanned PDFs using OCR. Make scanned PDF searchable online for free. Supports English, Hindi, and other Indian languages. No signup."
        keywords="ocr pdf online free, scanned pdf to text, make pdf searchable, ocr pdf hindi, extract text from pdf, pdf ocr online india"
        canonicalUrl={canonical('/pdf/ocr')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="OCR PDF"
        description="Extract text from scanned PDFs using Tesseract OCR. Makes your PDF searchable and copy-able."
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
            <div className="flex flex-col gap-1 px-4 py-3 bg-[#FFF1F2] border border-[#FFE4E6] rounded-[8px]">
              <p className="text-sm font-semibold text-[#DC2626]">⚠ OCR failed</p>
              <p className="text-xs text-[#DC2626]">{procError}</p>
              <p className="text-xs text-[#94A3B8] mt-1">OCR requires the EcomSathi processing server (Tesseract). Please try again or check your connection.</p>
            </div>
          )}

          {pdfFile && status !== 'done' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">OCR Settings</h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Document Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] max-w-xs"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <p className="text-xs text-[#94A3B8]">Select the primary language of your document for best accuracy.</p>
              </div>

              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[6px] p-3 text-xs text-[#92400E]">
                <strong>Note:</strong> OCR works best on clearly scanned documents at 150+ DPI. Processing may take 30–60 seconds per page.
              </div>

              <button
                type="button"
                onClick={handleOCR}
                disabled={status === 'processing'}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Running OCR…</>
                ) : (
                  <><ScanText size={15} /> Run OCR</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download OCR'd PDF" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About OCR PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Tesseract OCR Engine', body: 'Powered by the industry-standard open-source Tesseract OCR for high accuracy.' },
                { title: 'Indian Language Support', body: 'Supports English, Hindi, Bengali, Tamil, Telugu, and other Indian scripts.' },
                { title: 'Searchable Output', body: 'The output PDF retains original images but adds a hidden searchable text layer.' },
                { title: 'Useful for Sellers', body: 'Make scanned invoices, GST certificates, and shipping documents fully searchable.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to OCR a PDF</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your scanned PDF.', 'Select the language of the document.', 'Click "Run OCR" and wait for processing.', 'Download the searchable PDF.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/ocr')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default OCRPDF
