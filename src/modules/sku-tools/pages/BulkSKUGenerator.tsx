// ============================================================
// Bulk SKU Generator Page — /tools/sku/bulk
// ============================================================

import React, { useState } from 'react'
import { Layers, Download, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '@/components/common/SEO'
import SKUToolLayout from '../components/SKUToolLayout'
import BulkSKUUploader from '../components/BulkSKUUploader'
import SKUFAQ from '../components/SKUFAQ'
import { generateSingleSKU } from '../services/skuGenerator'
import { rowsToCSV, downloadCSV } from '../services/csvProcessor'
import type { BulkSKURow, RelatedSKUTool } from '../types'

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Bulk SKU Generator For Ecommerce Sellers',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Upload CSV or Excel to generate SKUs in bulk. Download results as CSV or Excel.',
}

const RELATED: RelatedSKUTool[] = [
  { label: 'SKU Generator',        to: '/tools/sku/generator',     description: 'Single SKU with barcode' },
  { label: 'Variant SKU Generator',to: '/tools/sku/variant-generator',       description: 'All Color × Size combos' },
  { label: 'Custom SKU Generator', to: '/tools/sku/custom-generator',        description: 'Build your own pattern' },
  { label: 'Label Generator',      to: '/tools/sku/label-generator', description: 'Create printable labels' },
  { label: 'Label Printer',        to: '/tools/sku/label-printer',  description: 'Print in bulk' },
]

const FAQS = [
  { question: 'What columns does the CSV need?', answer: 'Include: productName, brand, color, size, category. Column names are case-insensitive. Only productName is required; other columns are optional.' },
  { question: 'How many rows can I process at once?', answer: 'There is no hard limit. The tool processes all rows in your browser. For very large files (10,000+ rows), processing may take a few seconds.' },
  { question: 'Why is my SKU column empty?', answer: 'SKUs need at least a productName or brand to generate. Rows missing both are skipped. Check the error messages shown after upload.' },
  { question: 'Can I upload Excel files?', answer: 'Yes, .xlsx and .xls files are supported. The tool reads the first sheet. For best results, ensure the first row has the column headers.' },
  { question: 'How do I download the results?', answer: 'After generating SKUs, click "Download CSV" to get a file with all original columns plus the generatedSKU column.' },
]

export default function BulkSKUGenerator() {
  const [rows, setRows] = useState<BulkSKURow[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [generated, setGenerated] = useState(false)

  const handleParsed = (parsed: BulkSKURow[], errors: string[]) => {
    setRows(parsed)
    setParseErrors(errors)
    setGenerated(false)
  }

  const handleGenerate = () => {
    if (rows.length === 0) { toast.error('Upload a CSV file first'); return }
    const updated = rows.map((row) => ({
      ...row,
      generatedSKU: generateSingleSKU({
        brand: row.brand,
        productName: row.productName,
        category: row.category,
        color: row.color,
        size: row.size,
        prefix: '',
        suffix: '',
        skuLength: 12,
        separator: '-',
        autoNumber: false,
        sequence: 1,
      }),
    }))
    setRows(updated)
    setGenerated(true)
    toast.success(`${updated.length} SKUs generated!`)
  }

  const handleDownloadCSV = () => {
    if (!generated) { toast.error('Generate SKUs first'); return }
    downloadCSV(rowsToCSV(rows), 'bulk-skus.csv')
    toast.success('CSV downloaded')
  }

  const handleDownloadXLSX = async () => {
    if (!generated) { toast.error('Generate SKUs first'); return }
    try {
      const { utils, writeFile } = await import('xlsx')
      const ws = utils.json_to_sheet(rows)
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'SKUs')
      writeFile(wb, 'bulk-skus.xlsx')
      toast.success('Excel downloaded')
    } catch {
      toast.error('Excel export failed')
    }
  }

  const handleClear = () => {
    setRows([])
    setParseErrors([])
    setGenerated(false)
  }

  return (
    <>
      <SEO
        title="Bulk SKU Generator For Ecommerce Sellers | EcomSathi"
        description="Upload a CSV or Excel file to generate product SKUs in bulk. Download results as CSV or Excel. Free, no login required."
        keywords="bulk sku generator, sku generator csv, excel sku generator, bulk product sku, mass sku generation"
        canonicalUrl="https://ecomsathi.vercel.app/tools/sku/bulk"
        schema={PAGE_SCHEMA}
      />

      <SKUToolLayout
        title="Bulk SKU Generator"
        description="Upload a CSV or Excel file to generate SKUs for all your products at once."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-5">

          {/* Upload */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <Layers size={16} className="text-[#7C3AED]" />
              Upload Product File
            </h2>
            <BulkSKUUploader onParsed={handleParsed} />
          </div>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="rounded-[8px] border border-[#E2E8F0] bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {rows.length} row{rows.length !== 1 ? 's' : ''} loaded
                  {generated && <span className="ml-2 text-[#16A34A] text-xs">✓ SKUs generated</span>}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-[6px] hover:bg-[#1D4ED8] transition-colors"
                  >
                    Generate All SKUs
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] text-xs text-[#64748B] rounded-[6px] hover:text-[#DC2626] transition-colors"
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      {['#', 'Product Name', 'Brand', 'Color', 'Size', 'Category', 'Generated SKU'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {rows.slice(0, 100).map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-2.5 text-[#94A3B8]">{i + 1}</td>
                        <td className="px-4 py-2.5 text-[#0F172A] max-w-[140px] truncate">{row.productName}</td>
                        <td className="px-4 py-2.5 text-[#374151]">{row.brand}</td>
                        <td className="px-4 py-2.5 text-[#374151]">{row.color}</td>
                        <td className="px-4 py-2.5 text-[#374151]">{row.size}</td>
                        <td className="px-4 py-2.5 text-[#374151]">{row.category}</td>
                        <td className="px-4 py-2.5">
                          {row.generatedSKU ? (
                            <code className="font-mono font-semibold text-[#2563EB]">{row.generatedSKU}</code>
                          ) : (
                            <span className="text-[#94A3B8]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 100 && (
                  <p className="text-xs text-[#94A3B8] text-center py-2">
                    Showing 100 of {rows.length} rows — download CSV to see all
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Download Buttons */}
          {generated && (
            <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#16A34A]" />
                <span className="text-sm font-semibold text-[#065F46]">
                  {rows.length} SKUs ready
                </span>
              </div>
              <div className="flex gap-2 ml-auto">
                <button type="button" onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] text-white text-xs font-semibold rounded-[6px] hover:bg-[#15803D] transition-colors">
                  <Download size={13} /> Download CSV
                </button>
                <button type="button" onClick={handleDownloadXLSX}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#16A34A] text-[#16A34A] text-xs font-semibold rounded-[6px] hover:bg-[#F0FDF4] transition-colors">
                  <Download size={13} /> Download Excel
                </button>
              </div>
            </div>
          )}

          {/* Error summary */}
          {parseErrors.length > 0 && (
            <div className="rounded-[6px] border border-[#FECACA] bg-[#FFF1F2] p-3 flex gap-2">
              <AlertCircle size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#DC2626] mb-1">
                  {parseErrors.length} row(s) had issues
                </p>
                <ul className="text-xs text-[#7F1D1D] space-y-0.5">
                  {parseErrors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                  {parseErrors.length > 3 && <li className="text-[#94A3B8]">...and {parseErrors.length - 3} more</li>}
                </ul>
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">How It Works</h2>
            <ol className="space-y-2 text-sm text-[#64748B]">
              <li className="flex items-start gap-2"><span className="shrink-0 w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center">1</span>Download the sample CSV or prepare your own with the required columns</li>
              <li className="flex items-start gap-2"><span className="shrink-0 w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center">2</span>Upload the CSV or Excel file by dragging and dropping it</li>
              <li className="flex items-start gap-2"><span className="shrink-0 w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center">3</span>Click "Generate All SKUs" to process all rows instantly</li>
              <li className="flex items-start gap-2"><span className="shrink-0 w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center">4</span>Download the result as CSV or Excel with the new generatedSKU column</li>
            </ol>
          </div>

        </div>
      </SKUToolLayout>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-6">
        <SKUFAQ items={FAQS} />
      </div>
    </>
  )
}
