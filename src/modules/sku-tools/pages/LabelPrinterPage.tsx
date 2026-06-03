// ============================================================
// Label Printer Page — /tools/sku/label-printer
// ============================================================

import React, { useState } from 'react'
import { Printer, Plus, Trash2, Download, Layout, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '@/components/common/SEO'
import SKUToolLayout from '../components/SKUToolLayout'
import LabelPreview from '../components/LabelPreview'
import LabelTemplateSelector from '../components/LabelTemplateSelector'
import SKUFAQ from '../components/SKUFAQ'
import { generateLabelPDF } from '../services/labelService'
import type { LabelData, LabelConfig, RelatedSKUTool } from '../types'

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Barcode Label Printer Online',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const RELATED: RelatedSKUTool[] = [
  { label: 'Label Generator',      to: '/tools/sku/label-generator', description: 'Design individual labels' },
  { label: 'Barcode Generator',    to: '/tools/sku/barcode',         description: 'Generate barcodes' },
  { label: 'SKU Generator',        to: '/tools/sku/generator',       description: 'Generate SKUs' },
  { label: 'Bulk SKU Generator',   to: '/tools/sku/bulk-generator',            description: 'Bulk SKU from CSV' },
  { label: 'Variant SKU Generator',to: '/tools/sku/variant-generator',         description: 'All variant SKUs' },
]

const FAQS = [
  { question: 'What label sizes are supported?', answer: 'A4 sheet labels (3×8 per page = 24 labels), thermal 80mm, thermal 58mm, and sticker sizes (50×25mm, 100×50mm).' },
  { question: 'How do I do batch printing?', answer: 'Add all your products using "Add Label". Set the copies per label. Click "Print All Labels" to open the print dialog, or download as PDF.' },
  { question: 'How do I print on a thermal printer?', answer: 'Select Thermal 80mm or Thermal 58mm as the label size. Download the PDF and send it to your thermal printer. Each label prints on its own page.' },
  { question: 'Can I print different labels together?', answer: 'Yes! Add multiple labels with different SKUs, brands, and prices. They will all appear in the same print-ready PDF.' },
  { question: 'What is the A4 label layout?', answer: 'A4 labels are arranged in a 3-column × 8-row grid (24 labels per page). They are designed for standard A4 label sticker sheets.' },
]

const DEFAULT_CONFIG: LabelConfig = {
  template: 'detailed',
  size: 'A4',
  copies: 1,
  showBrand: true,
  showBarcode: true,
  showPrice: true,
  showMRP: true,
  showSize: true,
  showColor: true,
}

const DEFAULT_LABEL: LabelData = {
  sku: '', productName: '', brand: '', price: '', mrp: '', size: '', color: '',
}

const LAYOUT_OPTIONS = [
  { id: '1-up',    label: '1-up',    sub: 'Single per page', size: 'thermal-80' as const },
  { id: '2-up',    label: '2-up',    sub: '2 per row',       size: 'sticker-100x50' as const },
  { id: '4-up',    label: '4-up',    sub: '4 per page',      size: 'sticker-50x25' as const },
  { id: 'A4-grid', label: 'A4 Grid', sub: '24 per page',     size: 'A4' as const },
  { id: 'thermal', label: 'Thermal', sub: 'Thermal roll',    size: 'thermal-58' as const },
]

export default function LabelPrinterPage() {
  const [labels, setLabels] = useState<LabelData[]>([{ ...DEFAULT_LABEL }])
  const [config, setConfig] = useState<LabelConfig>(DEFAULT_CONFIG)
  const [selectedLayout, setSelectedLayout] = useState('A4-grid')
  const [activeIdx, setActiveIdx] = useState(0)

  const updateLabel = (idx: number, field: keyof LabelData, val: string) => {
    setLabels((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l))
  }

  const addLabel = () => {
    setLabels((prev) => [...prev, { ...DEFAULT_LABEL }])
    setActiveIdx(labels.length)
  }

  const removeLabel = (idx: number) => {
    if (labels.length === 1) return
    const next = labels.filter((_, i) => i !== idx)
    setLabels(next)
    setActiveIdx(Math.min(activeIdx, next.length - 1))
  }

  const selectLayout = (id: string) => {
    setSelectedLayout(id)
    const opt = LAYOUT_OPTIONS.find((o) => o.id === id)
    if (opt) setConfig((c) => ({ ...c, size: opt.size }))
  }

  const handlePrint = () => {
    const valid = labels.filter((l) => l.sku || l.productName)
    if (valid.length === 0) { toast.error('Fill in at least one label'); return }
    generateLabelPDF(valid, config)
    toast.success('PDF ready for printing!')
  }

  const totalLabels = labels.reduce((sum) => sum + config.copies, 0)

  return (
    <>
      <SEO
        title="Barcode Label Printer Online | EcomSathi"
        description="Print barcode labels in bulk. Supports A4, thermal 80mm, thermal 58mm, and sticker sizes. PDF download for all layouts."
        keywords="barcode label printer online, thermal label printer, a4 label printing, bulk label printing, product label printer"
        canonicalUrl="https://ecomsathi.vercel.app/tools/sku/label-printer"
        schema={PAGE_SCHEMA}
      />

      <SKUToolLayout
        title="SKU Label Printer"
        description="Print barcode labels in bulk — A4, thermal, and sticker formats. Download as PDF or print directly."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-5">

          {/* Layout Selection */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Print Layout</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectLayout(opt.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-[8px] border text-center transition-all ${
                    selectedLayout === opt.id
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]'
                  }`}
                >
                  <Layout size={18} className={selectedLayout === opt.id ? 'text-[#2563EB]' : 'text-[#64748B]'} />
                  <span className={`text-xs font-semibold ${selectedLayout === opt.id ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>{opt.label}</span>
                  <span className="text-[10px] text-[#94A3B8]">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Field Toggles */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Label Fields</h2>
            <div className="flex flex-wrap gap-4">
              {([
                { key: 'showBrand', label: 'Brand' }, { key: 'showBarcode', label: 'Barcode' },
                { key: 'showPrice', label: 'Price' }, { key: 'showMRP',     label: 'MRP' },
                { key: 'showSize',  label: 'Size' },  { key: 'showColor',   label: 'Color' },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                  <input type="checkbox" checked={config[key]}
                    onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.checked }))}
                    className="rounded border-[#E2E8F0]" />
                  {label}
                </label>
              ))}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-[#64748B]">Copies each</span>
                <input type="number" min={1} max={100} value={config.copies}
                  onChange={(e) => setConfig((c) => ({ ...c, copies: Math.min(100, parseInt(e.target.value) || 1) }))}
                  className="w-16 border border-[#E2E8F0] rounded-[6px] px-2 py-1 text-sm text-center focus:outline-none focus:border-[#2563EB]" />
              </div>
            </div>
          </div>

          {/* Labels + Preview */}
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Labels ({labels.length}) — {totalLabels} total prints
                </h2>
                <button type="button" onClick={addLabel}
                  className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline">
                  <Plus size={12} /> Add Label
                </button>
              </div>

              {labels.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  {labels.map((_, i) => (
                    <button key={i} type="button" onClick={() => setActiveIdx(i)}
                      className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${
                        activeIdx === i ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#64748B] border-[#E2E8F0]'
                      }`}>
                      #{i + 1} {labels[i].sku || 'Empty'}
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#374151]">Label {activeIdx + 1}</span>
                  {labels.length > 1 && (
                    <button type="button" onClick={() => removeLabel(activeIdx)}
                      className="text-[#94A3B8] hover:text-[#DC2626] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { key: 'sku',         label: 'SKU',         placeholder: 'NIKE-TSH-BLK-M' },
                    { key: 'productName', label: 'Product Name', placeholder: 'Men\'s T-Shirt' },
                    { key: 'brand',       label: 'Brand',        placeholder: 'Nike' },
                    { key: 'price',       label: 'Price (₹)',    placeholder: '599' },
                    { key: 'mrp',         label: 'MRP (₹)',      placeholder: '799' },
                    { key: 'size',        label: 'Size',          placeholder: 'M' },
                    { key: 'color',       label: 'Color',         placeholder: 'Black' },
                  ] as const).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-[#374151] mb-1">{label}</label>
                      <input type="text" placeholder={placeholder}
                        value={labels[activeIdx]?.[key] || ''}
                        onChange={(e) => updateLabel(activeIdx, key, e.target.value)}
                        className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview panel */}
            <div className="lg:w-64 shrink-0">
              <p className="text-sm font-semibold text-[#0F172A] mb-3">Print Preview</p>
              <LabelPreview label={labels[activeIdx] || labels[0]} config={config} />
              <p className="text-xs text-[#94A3B8] text-center mt-2">Label {activeIdx + 1} of {labels.length}</p>
            </div>
          </div>

          {/* Print summary + actions */}
          <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#16A34A]" />
              <span className="text-sm font-semibold text-[#065F46]">
                {labels.filter((l) => l.sku || l.productName).length} label design{labels.length > 1 ? 's' : ''} × {config.copies} copies = {totalLabels} total labels
              </span>
            </div>
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1D4ED8] transition-colors">
                <Printer size={16} /> Print All Labels
              </button>
              <button type="button" onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#16A34A] text-[#16A34A] text-sm font-medium rounded-[6px] hover:bg-[#F0FDF4] transition-colors">
                <Download size={16} /> PDF
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Supported Print Formats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-[#374151]">
              {['A4 Label Sheets (3×8 grid)', 'Thermal 80mm Roll', 'Thermal 58mm Roll', '50×25mm Stickers', '100×50mm Stickers', 'PDF Download', 'Direct Print', 'Batch Printing', 'Barcode Labels', 'QR Code Labels'].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#16A34A] shrink-0" />
                  <span className="text-xs">{f}</span>
                </div>
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
