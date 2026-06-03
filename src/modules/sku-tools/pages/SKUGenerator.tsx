// ============================================================
// SKU Generator Page — /tools/sku/generator
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Tag, Copy, Download, RefreshCw, ChevronDown, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import SEO from '@/components/common/SEO'
import SKUToolLayout from '../components/SKUToolLayout'
import BarcodePreview from '../components/BarcodePreview'
import SKUFAQ from '../components/SKUFAQ'
import { generateSingleSKU } from '../services/skuGenerator'
import type { SKUFormData, BarcodeFormat, RelatedSKUTool, Separator } from '../types'

// ─── SEO ───────────────────────────────────────────────────

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free SKU Generator Online',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Generate unique SKUs instantly from brand name, product name, category, color, and size.',
}

const RELATED: RelatedSKUTool[] = [
  { label: 'Bulk SKU Generator',    to: '/tools/sku/bulk-generator',           description: 'Generate SKUs from CSV upload' },
  { label: 'Variant SKU Generator', to: '/tools/sku/variant-generator',        description: 'All Color × Size combos' },
  { label: 'Custom SKU Generator',  to: '/tools/sku/custom-generator',         description: 'Build your own SKU pattern' },
  { label: 'Barcode Generator',     to: '/tools/sku/barcode',        description: 'Convert SKU to barcode' },
  { label: 'Label Generator',       to: '/tools/sku/label-generator', description: 'Create printable labels' },
]

const FAQS = [
  { question: 'What fields do I need to generate a SKU?', answer: 'At minimum, enter a brand name and category. Adding color and size creates a more specific SKU like NIKE-TSH-BLK-M.' },
  { question: 'What does the prefix and suffix do?', answer: 'Prefix adds a code at the start (e.g. IND- for India), suffix adds a code at the end (e.g. -2025 for year). Useful for multi-warehouse or seasonal SKUs.' },
  { question: 'How long should a SKU be?', answer: 'Most marketplaces accept 6–20 character SKUs. Shorter SKUs are easier to manage; longer ones carry more information.' },
  { question: 'Can I generate a barcode from my SKU?', answer: 'Yes! After generating your SKU, click "Show Barcode" to render Code 128, EAN-13, EAN-8, UPC, or QR Code. Download as PNG or SVG.' },
  { question: 'Does the auto-numbering reset?', answer: 'The counter resets when you refresh the page. Use the Reset Counter button to set it back to 1 during the same session.' },
]

const BARCODE_FORMATS: Array<{ value: BarcodeFormat; label: string }> = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'EAN13',   label: 'EAN-13' },
  { value: 'EAN8',    label: 'EAN-8' },
  { value: 'UPC',     label: 'UPC-A' },
  { value: 'QRCode',  label: 'QR Code' },
]

const DEFAULT_FORM: SKUFormData = {
  brand: '', productName: '', category: '', color: '', size: '',
  prefix: '', suffix: '', skuLength: 12, separator: '-', autoNumber: false, sequence: 1,
}

// ─── Component ─────────────────────────────────────────────

export default function SKUGenerator() {
  const [form, setForm] = useState<SKUFormData>(DEFAULT_FORM)
  const [liveSKU, setLiveSKU] = useState('')
  const [generatedSKU, setGeneratedSKU] = useState('')
  const [showBarcode, setShowBarcode] = useState(false)
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128')
  const [counter, setCounter] = useState(1)
  const [copied, setCopied] = useState(false)

  const buildSKU = useCallback((f: SKUFormData, seq?: number): string => {
    return generateSingleSKU({ ...f, sequence: seq ?? f.sequence })
  }, [])

  useEffect(() => {
    setLiveSKU(buildSKU(form))
  }, [form, buildSKU])

  const update = (key: keyof SKUFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleGenerate = () => {
    const seq = form.autoNumber ? counter : form.sequence
    const sku = buildSKU(form, seq)
    setGeneratedSKU(sku)
    if (form.autoNumber) setCounter((c) => c + 1)
    toast.success('SKU generated!')
  }

  const handleCopy = async () => {
    const val = generatedSKU || liveSKU
    if (!val) return
    await navigator.clipboard.writeText(val)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadCSV = () => {
    const sku = generatedSKU || liveSKU
    if (!sku) return
    const csv = ['SKU,Brand,Category,Color,Size', `${sku},${form.brand},${form.category},${form.color},${form.size}`].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${sku}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleDownloadPDF = () => {
    const sku = generatedSKU || liveSKU
    if (!sku) return
    const doc = new jsPDF({ unit: 'mm', format: [100, 60] })
    doc.setFontSize(8)
    doc.text('Product Label', 50, 8, { align: 'center' })
    if (form.brand) { doc.setFontSize(7); doc.text(form.brand.toUpperCase(), 50, 13, { align: 'center' }) }
    doc.setFontSize(13)
    doc.setFont('courier', 'bold')
    doc.text(sku, 50, 22, { align: 'center' })
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    if (form.color) doc.text(`Color: ${form.color}`, 10, 30)
    if (form.size) doc.text(`Size: ${form.size}`, 10, 35)
    doc.save(`${sku}-label.pdf`)
    toast.success('PDF downloaded')
  }

  return (
    <>
      <SEO
        title="Free SKU Generator Online | EcomSathi"
        description="Generate unique product SKUs instantly from brand name, category, color and size. Free online SKU generator for ecommerce sellers."
        keywords="free sku generator online, product sku generator, ecommerce sku, sku number generator, barcode sku"
        canonicalUrl="https://ecomsathi.vercel.app/tools/sku/generator"
        schema={PAGE_SCHEMA}
      />

      <SKUToolLayout
        title="Free SKU Generator"
        description="Generate unique product SKUs instantly from brand, category, color, and size fields."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-5 max-w-2xl">

          {/* Template Presets */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Quick Presets</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Brand + Category',      fields: { brand: 'NIKE', category: 'TSH', color: '', size: '' } },
                { label: 'With Color + Size',     fields: { brand: 'NIKE', category: 'TSH', color: 'BLK', size: 'M' } },
                { label: 'Full Variant',          fields: { brand: 'ADIDAS', category: 'SHOE', color: 'RED', size: '42' } },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, ...p.fields }))}
                  className="text-xs px-3 py-1.5 rounded-[6px] border border-[#E2E8F0] font-medium text-[#374151] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Product Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'brand' as const,       label: 'Brand Name',    placeholder: 'NIKE' },
                { key: 'productName' as const, label: 'Product Name',  placeholder: 'T-Shirt' },
                { key: 'category' as const,    label: 'Category',      placeholder: 'SHIRT' },
                { key: 'color' as const,       label: 'Color',         placeholder: 'BLACK' },
                { key: 'size' as const,        label: 'Size',          placeholder: 'M' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[#374151] mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key] as string}
                    onChange={update(key)}
                    className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Separator</label>
                <div className="relative">
                  <select
                    value={form.separator}
                    onChange={(e) => setForm((f) => ({ ...f, separator: e.target.value as Separator }))}
                    className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="-">Hyphen (-)</option>
                    <option value="_">Underscore (_)</option>
                    <option value="/">Slash (/)</option>
                    <option value=".">Dot (.)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Prefix / Suffix */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#F1F5F9]">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Prefix (optional)</label>
                <input
                  type="text"
                  placeholder="IND"
                  value={form.prefix}
                  onChange={update('prefix')}
                  className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Suffix (optional)</label>
                <input
                  type="text"
                  placeholder="2025"
                  value={form.suffix}
                  onChange={update('suffix')}
                  className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Auto Number */}
            <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex items-center justify-between flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoNumber}
                  onChange={(e) => setForm((f) => ({ ...f, autoNumber: e.target.checked }))}
                  className="rounded border-[#E2E8F0]"
                />
                Auto-increment number
                {form.autoNumber && <span className="text-[#2563EB] font-medium text-xs">Counter: {counter}</span>}
              </label>
              {form.autoNumber && (
                <button
                  type="button"
                  onClick={() => setCounter(1)}
                  className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A]"
                >
                  <RefreshCw size={12} />
                  Reset counter
                </button>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="rounded-[6px] bg-[#FFFBEB] border border-[#FDE68A] px-4 py-3">
            <p className="text-xs font-semibold text-[#92400E] mb-1">Live Preview</p>
            <p className="font-mono text-xl font-bold text-[#0F172A] tracking-widest break-all">
              {liveSKU || <span className="text-[#94A3B8] font-normal text-sm">Fill fields above to see a preview...</span>}
            </p>
          </div>

          {/* Generate Button */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1D4ED8] transition-colors"
            >
              <Tag size={16} />
              Generate SKU
            </button>
            {(generatedSKU || liveSKU) && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] text-sm font-medium rounded-[6px] text-[#374151] hover:bg-[#F8FAFC] transition-colors"
              >
                {copied ? <CheckCircle2 size={16} className="text-[#16A34A]" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy SKU'}
              </button>
            )}
          </div>

          {/* Result */}
          {generatedSKU && (
            <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-5 flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-[#065F46] mb-1">Generated SKU</p>
                <p className="font-mono text-2xl font-bold text-[#0F172A] tracking-widest break-all">
                  {generatedSKU}
                </p>
              </div>

              {/* Barcode Toggle */}
              <div className="border-t border-[#BBF7D0] pt-4 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBarcode}
                    onChange={(e) => setShowBarcode(e.target.checked)}
                  />
                  Show Barcode
                </label>
                {showBarcode && (
                  <div className="relative">
                    <select
                      value={barcodeFormat}
                      onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
                      className="border border-[#E2E8F0] rounded-[6px] px-3 py-1.5 text-xs bg-white appearance-none pr-6 focus:outline-none focus:border-[#2563EB]"
                    >
                      {BARCODE_FORMATS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  </div>
                )}
              </div>

              {showBarcode && (
                <BarcodePreview value={generatedSKU} format={barcodeFormat} label={generatedSKU} />
              )}

              {/* Download Actions */}
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-white transition-colors">
                  <Copy size={12} /> Copy Text
                </button>
                <button type="button" onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-white transition-colors">
                  <Download size={12} /> Download CSV
                </button>
                <button type="button" onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-white transition-colors">
                  <Download size={12} /> Download PDF Label
                </button>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">SKU Examples</h2>
            <div className="flex flex-wrap gap-2">
              {['ABC-TSH-BLK-L', 'ABC-SHOE-RED-42', 'NKE-POLO-WHT-M', 'ADI-RUN-GRN-44'].map((ex) => (
                <code key={ex} className="font-mono text-xs px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-[#2563EB]">
                  {ex}
                </code>
              ))}
            </div>
          </div>

        </div>
      </SKUToolLayout>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-6">
        <SKUFAQ items={FAQS} />
      </div>
    </>
  )
}
