// ============================================================
// Label Generator Page — /tools/sku/label-generator
// ============================================================

import React, { useState } from 'react'
import { Layout, Plus, Trash2, Download, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '@/components/common/SEO'
import SKUToolLayout from '../components/SKUToolLayout'
import LabelPreview from '../components/LabelPreview'
import LabelTemplateSelector from '../components/LabelTemplateSelector'
import SKUFAQ from '../components/SKUFAQ'
import { generateLabelPDF } from '../services/labelService'
import type { LabelData, LabelConfig, RelatedSKUTool, LabelTemplate, LabelSize } from '../types'

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Product Label Generator Online',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const RELATED: RelatedSKUTool[] = [
  { label: 'Label Printer',        to: '/tools/sku/label-printer',  description: 'Bulk printing layout' },
  { label: 'Barcode Generator',    to: '/tools/sku/barcode',        description: 'Generate barcodes' },
  { label: 'SKU Generator',        to: '/tools/sku/generator',      description: 'Generate a SKU first' },
  { label: 'Bulk SKU Generator',   to: '/tools/sku/bulk-generator',           description: 'Generate SKUs from CSV' },
  { label: 'Variant SKU Generator',to: '/tools/sku/variant-generator',        description: 'All variant SKUs' },
]

const FAQS = [
  { question: 'What fields can I add to my label?', answer: 'SKU, product name, brand, price, MRP, barcode, size, and color. Toggle each field on/off using the label settings.' },
  { question: 'Can I download labels as PDF?', answer: 'Yes! Click "Download PDF" to generate a PDF with your labels arranged for your chosen size (A4, thermal 80mm, thermal 58mm, or sticker sizes).' },
  { question: 'How do I print thermal labels?', answer: 'Select the thermal label size (80mm or 58mm), configure your fields, then download the PDF. Print it on your thermal label printer.' },
  { question: 'Can I create labels for multiple products?', answer: 'Yes! Click "Add Another Label" to create labels for multiple products. All labels are included in the same PDF download.' },
  { question: 'What is MRP on a label?', answer: 'MRP (Maximum Retail Price) is the maximum price that can be charged for a product as required by Indian consumer protection laws. It must appear on product labels.' },
]

const DEFAULT_CONFIG: LabelConfig = {
  template: 'detailed', size: 'A4', copies: 1,
  showBrand: true, showBarcode: true, showPrice: true, showMRP: true, showSize: true, showColor: true,
}

const DEFAULT_LABEL: LabelData = {
  sku: '', productName: '', brand: '', price: '', mrp: '', size: '', color: '', barcode: '', barcodeFormat: 'CODE128',
}

export default function LabelGeneratorPage() {
  const [labels, setLabels] = useState<LabelData[]>([{ ...DEFAULT_LABEL }])
  const [config, setConfig] = useState<LabelConfig>(DEFAULT_CONFIG)
  const [previewIdx, setPreviewIdx] = useState(0)

  const updateLabel = (idx: number, field: keyof LabelData, val: string) => {
    setLabels((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l))
  }

  const addLabel = () => {
    setLabels((prev) => [...prev, { ...DEFAULT_LABEL }])
    setPreviewIdx(labels.length)
  }

  const removeLabel = (idx: number) => {
    if (labels.length === 1) return
    const next = labels.filter((_, i) => i !== idx)
    setLabels(next)
    setPreviewIdx(Math.min(previewIdx, next.length - 1))
  }

  const handleDownloadPDF = () => {
    const valid = labels.filter((l) => l.sku || l.productName)
    if (valid.length === 0) { toast.error('Fill at least the SKU field'); return }
    generateLabelPDF(valid, config)
    toast.success('PDF downloaded')
  }

  const handlePrint = () => {
    window.print()
  }

  const activeLabel = labels[previewIdx] || labels[0]

  return (
    <>
      <SEO
        title="Product Label Generator Online | EcomSathi"
        description="Create printable product labels with SKU, barcode, price, MRP and brand. Export as PDF. Free, no login required."
        keywords="product label generator, barcode label generator, sku label maker, price tag generator, product sticker maker"
        canonicalUrl="https://ecomsathi.vercel.app/tools/sku/label-generator"
        schema={PAGE_SCHEMA}
      />

      <SKUToolLayout
        title="Product Label Generator"
        description="Create printable product labels with SKU, barcode, price, MRP, brand, size and color."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-5">

          {/* Template & Size */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <LabelTemplateSelector
              template={config.template}
              size={config.size}
              onTemplateChange={(t) => setConfig((c) => ({ ...c, template: t }))}
              onSizeChange={(s) => setConfig((c) => ({ ...c, size: s }))}
            />
          </div>

          {/* Field toggles */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Show / Hide Fields</h2>
            <div className="flex flex-wrap gap-3">
              {([
                { key: 'showBrand',   label: 'Brand' },
                { key: 'showBarcode', label: 'Barcode' },
                { key: 'showPrice',   label: 'Price' },
                { key: 'showMRP',     label: 'MRP' },
                { key: 'showSize',    label: 'Size' },
                { key: 'showColor',   label: 'Color' },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[key]}
                    onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.checked }))}
                    className="rounded border-[#E2E8F0]"
                  />
                  {label}
                </label>
              ))}

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs text-[#64748B]">Copies per label</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.copies}
                  onChange={(e) => setConfig((c) => ({ ...c, copies: Math.min(100, parseInt(e.target.value) || 1) }))}
                  className="w-16 border border-[#E2E8F0] rounded-[6px] px-2 py-1 text-sm text-center focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Label inputs + preview */}
          <div className="flex flex-col lg:flex-row gap-5">

            {/* Label inputs */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  {labels.length > 1 ? `Labels (${labels.length})` : 'Label Fields'}
                </h2>
                <button type="button" onClick={addLabel}
                  className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline">
                  <Plus size={12} /> Add Another Label
                </button>
              </div>

              {labels.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  {labels.map((_, i) => (
                    <button key={i} type="button" onClick={() => setPreviewIdx(i)}
                      className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${
                        previewIdx === i ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB]'
                      }`}>
                      Label {i + 1}
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[#374151]">Label {previewIdx + 1}</span>
                  {labels.length > 1 && (
                    <button type="button" onClick={() => removeLabel(previewIdx)}
                      className="text-[#94A3B8] hover:text-[#DC2626] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { key: 'sku',         label: 'SKU *',       placeholder: 'NIKE-TSH-BLK-M' },
                    { key: 'productName', label: 'Product Name', placeholder: 'Men\'s T-Shirt' },
                    { key: 'brand',       label: 'Brand',        placeholder: 'Nike' },
                    { key: 'price',       label: 'Selling Price (₹)', placeholder: '599' },
                    { key: 'mrp',         label: 'MRP (₹)',      placeholder: '799' },
                    { key: 'size',        label: 'Size',          placeholder: 'M' },
                    { key: 'color',       label: 'Color',         placeholder: 'Black' },
                  ] as const).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-[#374151] mb-1">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={labels[previewIdx]?.[key] || ''}
                        onChange={(e) => updateLabel(previewIdx, key, e.target.value)}
                        className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:w-72 shrink-0">
              <p className="text-sm font-semibold text-[#0F172A] mb-3">Preview</p>
              <LabelPreview label={activeLabel} config={config} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1D4ED8] transition-colors">
              <Download size={16} />
              Download PDF
            </button>
            <button type="button" onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] text-sm font-medium rounded-[6px] text-[#374151] hover:bg-[#F8FAFC] transition-colors">
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>
      </SKUToolLayout>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-6">
        <SKUFAQ items={FAQS} />
      </div>
    </>
  )
}
