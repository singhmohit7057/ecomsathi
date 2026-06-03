import React, { useState } from 'react'
import { RotateCw } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { rotatePDF } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool, RotationAngle } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'Crop PDF',      to: '/pdf/crop',      description: 'Trim page margins' },
  { label: 'Merge PDF',     to: '/pdf/merge',     description: 'Combine PDFs' },
  { label: 'Compress PDF',  to: '/pdf/compress',  description: 'Reduce file size' },
  { label: 'Watermark PDF', to: '/pdf/watermark', description: 'Add watermark' },
]

const FAQS: FAQItem[] = [
  {
    question: 'Can I rotate only specific pages?',
    answer: 'Yes. Enter a page range like "1-3, 5" to rotate specific pages, or leave it as "all" to rotate the entire document.',
  },
  {
    question: 'What rotation angles are supported?',
    answer: 'You can rotate pages by 90° clockwise, 90° counter-clockwise (270°), or 180°.',
  },
  {
    question: 'Will rotation affect the text or images in my PDF?',
    answer: 'No. Rotation only changes the orientation of the page. Content is not modified in any way.',
  },
  {
    question: 'Can I rotate different pages by different angles in one operation?',
    answer: 'No. One operation applies a single angle to the selected pages. Process the PDF multiple times to apply different angles to different page sets.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Rotate PDF Online Free',
  url: canonical('/pdf/rotate'),
  description: 'Rotate PDF pages online for free. Rotate all or specific pages 90°, 180°, or 270°. No signup.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const ANGLES: { value: RotationAngle; label: string }[] = [
  { value: 90,  label: '90° Clockwise' },
  { value: 180, label: '180°' },
  { value: 270, label: '90° Counter-clockwise' },
]

export const RotatePDF: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()
  const [angle, setAngle] = useState<RotationAngle>(90)
  const [pages, setPages] = useState('all')

  const handleRotate = () => {
    if (!pdfFile) return
    run(() => rotatePDF(pdfFile.file, angle, pages))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
    setAngle(90)
    setPages('all')
  }

  return (
    <>
      <SEO
        title="Rotate PDF Online Free — Rotate PDF Pages — EcomSathi"
        description="Rotate PDF pages online for free. Rotate all or specific pages 90°, 180°, or 270°. No login required. Fast and secure PDF rotation."
        keywords="rotate pdf online free, rotate pdf pages, pdf page rotation, rotate pdf 90 degrees, flip pdf pages, pdf rotator"
        canonicalUrl={canonical('/pdf/rotate')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Rotate PDF"
        description="Rotate all or specific pages 90°, 180°, or 270°. Perfect for fixing upside-down scans."
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
              <h2 className="text-sm font-semibold text-[#0F172A]">Rotation Settings</h2>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0F172A]">Rotation Angle</label>
                <div className="flex flex-wrap gap-2">
                  {ANGLES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAngle(opt.value)}
                      className={[
                        'px-4 py-2 text-xs font-medium rounded border transition-all',
                        angle === opt.value
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
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
                onClick={handleRotate}
                disabled={status === 'processing'}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Rotating…</>
                ) : (
                  <><RotateCw size={15} /> Rotate PDF</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download Rotated PDF" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Rotate PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Three Rotation Angles', body: 'Rotate pages 90° CW, 90° CCW, or 180° to fix any orientation.' },
                { title: 'Selective Page Rotation', body: 'Apply rotation to all pages or a specific range.' },
                { title: 'Content Preserved', body: 'Only orientation changes — text, images, and layout are untouched.' },
                { title: 'Fix Scanned Documents', body: 'Correct upside-down or sideways scanned invoices and documents.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Rotate a PDF</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your PDF file.', 'Select the rotation angle.', 'Specify which pages to rotate (or all).', 'Click "Rotate PDF" and download the result.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/rotate')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default RotatePDF
