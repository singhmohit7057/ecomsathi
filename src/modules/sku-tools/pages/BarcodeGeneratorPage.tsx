// ============================================================
// Barcode Generator Page — /tools/sku/barcode
// ============================================================

import React, { useState } from 'react'
import { QrCode, Plus, Trash2, Download, ChevronDown } from 'lucide-react'
import SEO from '@/components/common/SEO'
import SKUToolLayout from '../components/SKUToolLayout'
import BarcodePreview from '../components/BarcodePreview'
import SKUFAQ from '../components/SKUFAQ'
import type { BarcodeFormat, RelatedSKUTool } from '../types'

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Barcode Generator For Ecommerce Products',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const RELATED: RelatedSKUTool[] = [
  { label: 'SKU Generator',       to: '/tools/sku/generator',      description: 'Generate a SKU first' },
  { label: 'Label Generator',     to: '/tools/sku/label-generator', description: 'Add barcode to a label' },
  { label: 'Label Printer',       to: '/tools/sku/label-printer',  description: 'Print barcode labels' },
  { label: 'Bulk SKU Generator',  to: '/tools/sku/bulk-generator',           description: 'Generate SKUs in bulk' },
  { label: 'Variant SKU Generator',to: '/tools/sku/variant-generator',       description: 'Generate variant SKUs' },
]

const FAQS = [
  { question: 'Which barcode format should I use?', answer: 'For most Indian ecommerce marketplaces, use EAN-13. For internal tracking, Code 128 works for any text/number. Use QR Code when you need to encode URLs or more data.' },
  { question: 'What is EAN-13?', answer: 'EAN-13 is a 13-digit barcode standard used worldwide for product identification. Marketplaces like Amazon and Flipkart require EAN-13 or UPC-A for listings.' },
  { question: 'Can I download the barcode?', answer: 'Yes! Download as PNG (for printing) or SVG (for scalable use). PNG is recommended for label printers. SVG is ideal for high-resolution printing.' },
  { question: 'What is QR Code used for?', answer: 'QR codes can store URLs, SKU codes, or product info. They are scanned by smartphones and used for quick access to product pages or inventory lookups.' },
  { question: 'Can I generate barcodes for multiple SKUs at once?', answer: 'Yes! Click "Add Another" to enter multiple SKUs and generate barcodes for all of them on one page.' },
]

const FORMAT_OPTIONS: Array<{ value: BarcodeFormat; label: string; desc: string }> = [
  { value: 'CODE128', label: 'Code 128',  desc: 'Alphanumeric, all SKUs' },
  { value: 'EAN13',   label: 'EAN-13',   desc: 'Marketplaces standard' },
  { value: 'EAN8',    label: 'EAN-8',    desc: 'Compact 8-digit' },
  { value: 'UPC',     label: 'UPC-A',    desc: 'US market standard' },
  { value: 'QRCode',  label: 'QR Code',  desc: 'Scan with smartphone' },
]

interface BarcodeEntry {
  id: string
  value: string
  label: string
}

export default function BarcodeGeneratorPage() {
  const [format, setFormat] = useState<BarcodeFormat>('CODE128')
  const [entries, setEntries] = useState<BarcodeEntry[]>([
    { id: '1', value: '', label: '' },
  ])

  const addEntry = () => {
    setEntries((e) => [...e, { id: Date.now().toString(), value: '', label: '' }])
  }

  const removeEntry = (id: string) => {
    setEntries((e) => e.filter((x) => x.id !== id))
  }

  const updateEntry = (id: string, field: 'value' | 'label', val: string) => {
    setEntries((e) => e.map((x) => x.id === id ? { ...x, [field]: val } : x))
  }

  const activeEntries = entries.filter((e) => e.value.trim() !== '')

  return (
    <>
      <SEO
        title="Barcode Generator For Ecommerce Products | EcomSathi"
        description="Generate Code 128, EAN-13, EAN-8, UPC-A and QR Code barcodes from any SKU. Download PNG or SVG. Free, no login required."
        keywords="barcode generator, ean13 barcode generator, qr code generator, upc barcode, code 128 barcode, sku barcode"
        canonicalUrl="https://ecomsathi.vercel.app/tools/sku/barcode"
        schema={PAGE_SCHEMA}
      />

      <SKUToolLayout
        title="Barcode Generator For SKUs"
        description="Generate Code 128, EAN-13, EAN-8, UPC-A, and QR Code barcodes from any SKU or product code."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-5">

          {/* Format Selector */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Barcode Format</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-[8px] border text-center transition-all ${
                    format === f.value
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD]'
                  }`}
                >
                  <span className="text-xs font-semibold">{f.label}</span>
                  <span className="text-[10px] text-[#94A3B8]">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SKU Inputs */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0F172A]">SKU / Product Code</h2>
              <button type="button" onClick={addEntry}
                className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline">
                <Plus size={12} /> Add Another
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {entries.map((entry, idx) => (
                <div key={entry.id} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-[#64748B] mb-1">SKU / Code</label>
                      <input
                        type="text"
                        placeholder={format === 'EAN13' ? '123456789012' : 'ABC-TSH-BLK-M'}
                        value={entry.value}
                        onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
                        className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#64748B] mb-1">Label (optional)</label>
                      <input
                        type="text"
                        placeholder="Product label text"
                        value={entry.label}
                        onChange={(e) => updateEntry(entry.id, 'label', e.target.value)}
                        className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>
                  {entries.length > 1 && (
                    <button type="button" onClick={() => removeEntry(entry.id)}
                      className="mt-6 text-[#94A3B8] hover:text-[#DC2626] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Barcode Previews */}
          {activeEntries.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-[#0F172A]">Generated Barcodes</h2>
              <div className={`grid gap-4 ${activeEntries.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
                {activeEntries.map((entry) => (
                  <BarcodePreview
                    key={entry.id}
                    value={entry.value}
                    format={format}
                    label={entry.label || entry.value}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Supported Barcode Formats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map((f) => (
                <div key={f.value} className="flex gap-3 p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E2E8F0]">
                  <QrCode size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">{f.label}</p>
                    <p className="text-xs text-[#64748B]">{f.desc}</p>
                  </div>
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
