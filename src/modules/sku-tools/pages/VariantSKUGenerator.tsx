// ============================================================
// Variant SKU Generator Page — /tools/sku/variant
// ============================================================

import React, { useState, useCallback } from 'react'
import { GitBranch, Plus, X, Download, RefreshCw, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '@/components/common/SEO'
import SKUToolLayout from '../components/SKUToolLayout'
import SKUFAQ from '../components/SKUFAQ'
import { generateVariantSKUs } from '../services/skuGenerator'
import { downloadCSV, rowsToCSV } from '../services/csvProcessor'
import type { VariantSKURow, RelatedSKUTool, Separator } from '../types'

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Variant SKU Generator Online',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const RELATED: RelatedSKUTool[] = [
  { label: 'SKU Generator',       to: '/tools/sku/generator',      description: 'Single SKU generator' },
  { label: 'Bulk SKU Generator',  to: '/tools/sku/bulk-generator',           description: 'Upload CSV for bulk generation' },
  { label: 'Custom SKU Generator',to: '/tools/sku/custom-generator',         description: 'Build your own SKU pattern' },
  { label: 'Barcode Generator',   to: '/tools/sku/barcode',        description: 'Convert SKU to barcode' },
  { label: 'Label Generator',     to: '/tools/sku/label-generator', description: 'Create product labels' },
]

const FAQS = [
  { question: 'What is a variant SKU?', answer: 'A variant SKU identifies a specific version of a product — e.g. T-Shirt in Black size M vs Red size L. Each combination needs its own unique SKU.' },
  { question: 'How many variants can be generated?', answer: 'The tool generates all possible combinations. 3 colors × 4 sizes = 12 SKUs. 5 colors × 5 sizes × 3 materials = 75 SKUs.' },
  { question: 'Can I add custom values?', answer: 'Yes, type any values into the color, size, material and gender fields. Use commas to separate multiple values (e.g. "Black, Red, Blue").' },
  { question: 'How do I export the variants?', answer: 'Click "Download CSV" to export all variant SKUs with their attributes. You can import this directly into marketplace listing tools.' },
]

function ChipInput({
  label, values, onChange, placeholder,
}: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')

  const add = () => {
    const parts = input.split(',').map((s) => s.trim()).filter(Boolean)
    const next = [...new Set([...values, ...parts])]
    onChange(next)
    setInput('')
  }

  return (
    <div>
      <label className="block text-xs font-medium text-[#374151] mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-full font-medium">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 border border-[#E2E8F0] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
        />
        <button type="button" onClick={add}
          className="flex items-center gap-1 px-3 py-2 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-xs font-medium rounded-[6px] hover:bg-[#DBEAFE] transition-colors">
          <Plus size={12} /> Add
        </button>
      </div>
      <p className="text-[10px] text-[#94A3B8] mt-1">Separate multiple values with commas or press Add</p>
    </div>
  )
}

export default function VariantSKUGenerator() {
  const [productName, setProductName] = useState('')
  const [brand, setBrand] = useState('')
  const [separator, setSeparator] = useState<Separator>('-')
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [materials, setMaterials] = useState<string[]>([])
  const [genders, setGenders] = useState<string[]>([])
  const [results, setResults] = useState<VariantSKURow[]>([])

  const totalCombos = Math.max(1, colors.length || 1) *
    Math.max(1, sizes.length || 1) *
    Math.max(1, materials.length || 1) *
    Math.max(1, genders.length || 1)

  const handleGenerate = useCallback(() => {
    if (!productName && !brand) { toast.error('Enter at least a product name or brand'); return }
    const rows = generateVariantSKUs({ productName, brand, separator, colors, sizes, materials, genders })
    setResults(rows)
    toast.success(`${rows.length} variant SKUs generated!`)
  }, [productName, brand, separator, colors, sizes, materials, genders])

  const handleDownload = () => {
    if (results.length === 0) return
    const csv = [
      'SKU,Color,Size,Material,Gender',
      ...results.map((r) => `${r.sku},${r.color},${r.size},${r.material},${r.gender}`),
    ].join('\n')
    downloadCSV(csv, 'variant-skus.csv')
    toast.success('CSV downloaded')
  }

  const handleReset = () => {
    setColors([])
    setSizes([])
    setMaterials([])
    setGenders([])
    setResults([])
  }

  return (
    <>
      <SEO
        title="Variant SKU Generator Online | EcomSathi"
        description="Generate SKUs for all product variants automatically. Enter colors, sizes, materials to get all combinations instantly."
        keywords="variant sku generator, product variant sku, color size sku, sku combination generator, ecommerce variant sku"
        canonicalUrl="https://ecomsathi.vercel.app/tools/sku/variant"
        schema={PAGE_SCHEMA}
      />

      <SKUToolLayout
        title="Variant SKU Generator"
        description="Generate SKUs for all product variants — every Color × Size × Material combination."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-5 max-w-2xl">

          {/* Base Fields */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Base Product Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="T-Shirt"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Brand</label>
                <input
                  type="text"
                  placeholder="Nike"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Separator</label>
                <div className="relative">
                  <select
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value as Separator)}
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
          </div>

          {/* Variant Inputs */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#0F172A]">Variant Attributes</h2>
              <span className="text-xs text-[#64748B]">
                ~{totalCombos} combination{totalCombos !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ChipInput label="Colors" values={colors} onChange={setColors} placeholder="Black, Red, Blue" />
              <ChipInput label="Sizes" values={sizes} onChange={setSizes} placeholder="S, M, L, XL" />
              <ChipInput label="Materials" values={materials} onChange={setMaterials} placeholder="Cotton, Polyester" />
              <ChipInput label="Gender" values={genders} onChange={setGenders} placeholder="Men, Women, Kids" />
            </div>
          </div>

          {/* Generate */}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1D4ED8] transition-colors">
              <GitBranch size={16} />
              Generate Variant SKUs
            </button>
            {(colors.length || sizes.length || materials.length || genders.length) > 0 && (
              <button type="button" onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] text-sm text-[#64748B] rounded-[6px] hover:text-[#DC2626] transition-colors">
                <RefreshCw size={14} /> Reset
              </button>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="rounded-[8px] border border-[#E2E8F0] bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-semibold text-[#0F172A]">{results.length} variant SKUs</p>
                <button type="button" onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-[6px] hover:bg-[#1D4ED8] transition-colors">
                  <Download size={12} /> Download CSV
                </button>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#F8FAFC] sticky top-0">
                    <tr>
                      {['#', 'SKU', 'Color', 'Size', 'Material', 'Gender'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[#64748B] font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-2 text-[#94A3B8]">{i + 1}</td>
                        <td className="px-4 py-2"><code className="font-mono font-semibold text-[#2563EB]">{r.sku}</code></td>
                        <td className="px-4 py-2 text-[#374151]">{r.color || '—'}</td>
                        <td className="px-4 py-2 text-[#374151]">{r.size || '—'}</td>
                        <td className="px-4 py-2 text-[#374151]">{r.material || '—'}</td>
                        <td className="px-4 py-2 text-[#374151]">{r.gender || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Example Output */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Example Output (T-Shirt)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['TSH-BLK-S', 'TSH-BLK-M', 'TSH-BLK-L', 'TSH-RED-S', 'TSH-RED-M', 'TSH-RED-L'].map((ex) => (
                <code key={ex} className="font-mono text-xs px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-[#2563EB] text-center block">
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
