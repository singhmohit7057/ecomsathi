import React, { useState } from 'react'
import { Stamp } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { watermarkPDF } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool, WatermarkPosition } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'Add Page Numbers', to: '/pdf/page-numbers', description: 'Add page numbers' },
  { label: 'Merge PDF',        to: '/pdf/merge',        description: 'Combine PDFs' },
  { label: 'Compress PDF',     to: '/pdf/compress',     description: 'Reduce file size' },
  { label: 'Rotate PDF',       to: '/pdf/rotate',       description: 'Rotate pages' },
]

const FAQS: FAQItem[] = [
  {
    question: 'Can I add a logo image as a watermark?',
    answer: 'Currently, only text watermarks are supported. Enter your brand name or any custom text as the watermark.',
  },
  {
    question: 'Can I control watermark transparency?',
    answer: 'Yes. Set the opacity from 10% (very transparent) to 100% (fully opaque).',
  },
  {
    question: 'What positions are available for the watermark?',
    answer: 'You can place the watermark at top-left, top-center, top-right, center, bottom-left, bottom-center, bottom-right, or as a diagonal across the page.',
  },
  {
    question: 'Can I apply the watermark to all pages?',
    answer: 'Yes. The watermark is applied to all pages of the PDF.',
  },
  {
    question: 'Will watermarking change the file size?',
    answer: 'Watermarking adds a small amount of data to the PDF (the watermark text), but the increase in file size is minimal.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Watermark PDF Online Free',
  url: canonical('/pdf/watermark'),
  description: 'Add text watermark to PDF online for free. Custom position, color, opacity, and angle. No signup.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'top-left',       label: 'Top Left' },
  { value: 'top-center',     label: 'Top Center' },
  { value: 'top-right',      label: 'Top Right' },
  { value: 'center',         label: 'Center' },
  { value: 'bottom-left',    label: 'Bottom Left' },
  { value: 'bottom-center',  label: 'Bottom Center' },
  { value: 'bottom-right',   label: 'Bottom Right' },
  { value: 'diagonal',       label: 'Diagonal' },
]

export const WatermarkPDF: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()

  const [text, setText] = useState('CONFIDENTIAL')
  const [position, setPosition] = useState<WatermarkPosition>('diagonal')
  const [opacity, setOpacity] = useState(30)
  const [fontSize, setFontSize] = useState(48)
  const [color, setColor] = useState('#FF0000')
  const [rotation, setRotation] = useState(45)

  const handleWatermark = () => {
    if (!pdfFile || !text.trim()) return
    run(() => watermarkPDF(pdfFile.file, text, position, opacity, fontSize, color, rotation))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
  }

  return (
    <>
      <SEO
        title="Watermark PDF Online Free — Add Text Watermark to PDF — EcomSathi"
        description="Add text watermark to PDF online for free. Choose position, color, opacity, and angle. All pages watermarked. No signup required."
        keywords="watermark pdf online free, add watermark to pdf, pdf watermark, text watermark pdf, stamp pdf online, pdf watermarker"
        canonicalUrl={canonical('/pdf/watermark')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Watermark PDF"
        description="Add a custom text watermark to all pages of your PDF. Control position, color, opacity, and rotation."
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
              <h2 className="text-sm font-semibold text-[#0F172A]">Watermark Settings</h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Watermark Text</label>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. CONFIDENTIAL" className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Position</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value as WatermarkPosition)} className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]">
                    {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 border border-[#E2E8F0] rounded-[4px] cursor-pointer p-0.5" />
                    <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-[#0F172A]">Opacity</label>
                    <span className="text-sm font-semibold text-[#2563EB]">{opacity}%</span>
                  </div>
                  <input type="range" min={5} max={100} step={5} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-[#2563EB]" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Font Size (pt)</label>
                  <input type="number" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Rotation (°)</label>
                  <input type="number" min={-180} max={180} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>

              {/* Preview hint */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-3 flex items-center justify-center" style={{ minHeight: 72 }}>
                <span style={{ color, opacity: opacity / 100, fontSize: Math.max(14, fontSize / 3), transform: `rotate(${rotation}deg)`, display: 'inline-block', fontWeight: 700, letterSpacing: 1 }}>
                  {text || 'Watermark Preview'}
                </span>
              </div>

              <button type="button" onClick={handleWatermark} disabled={status === 'processing' || !text.trim()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Adding Watermark…</>
                ) : (
                  <><Stamp size={15} /> Add Watermark</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download Watermarked PDF" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Watermark PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: '8 Position Options', body: 'Place watermark anywhere on the page including a full diagonal stamp.' },
                { title: 'Custom Color & Opacity', body: 'Choose any color and set opacity from subtle to solid.' },
                { title: 'Live Preview', body: 'Preview how your watermark will look before applying it.' },
                { title: 'Applied to All Pages', body: 'The watermark is applied consistently to every page of the PDF.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Add a Watermark to PDF</h2>
            <ol className="flex flex-col gap-3">
              {['Upload your PDF.', 'Enter watermark text and adjust settings.', 'Preview the watermark.', 'Click "Add Watermark" and download the result.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/watermark')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default WatermarkPDF
