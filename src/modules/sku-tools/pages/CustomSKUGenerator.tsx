// ============================================================
// Custom SKU Generator Page — /tools/sku/custom
// ============================================================

import React, { useState, useCallback, useEffect } from 'react'
import { Settings2, Copy, Download, Save, Trash2, CheckCircle2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '@/components/common/SEO'
import SKUToolLayout from '../components/SKUToolLayout'
import PatternBuilder from '../components/PatternBuilder'
import SKUFAQ from '../components/SKUFAQ'
import { buildCustomSKU } from '../services/skuGenerator'
import { downloadCSV } from '../services/csvProcessor'
import type { CustomPatternToken, RelatedSKUTool, Separator } from '../types'

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Custom SKU Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const RELATED: RelatedSKUTool[] = [
  { label: 'SKU Generator',        to: '/tools/sku/generator',      description: 'Simple SKU generator' },
  { label: 'Bulk SKU Generator',   to: '/tools/sku/bulk-generator',           description: 'Generate from CSV' },
  { label: 'Variant SKU Generator',to: '/tools/sku/variant-generator',        description: 'All color × size combos' },
  { label: 'Barcode Generator',    to: '/tools/sku/barcode',        description: 'Convert SKU to barcode' },
]

const FAQS = [
  { question: 'How do I build a custom pattern?', answer: 'Click the token buttons (Brand, Category, Color, etc.) to add them to your pattern. They will be joined by your chosen separator.' },
  { question: 'What is the {AUTO_NUMBER} token?', answer: 'It inserts a sequential number that increments with each SKU you generate. You can set the starting number and padding width.' },
  { question: 'Can I save my patterns?', answer: 'Yes! Click "Save Pattern" to store up to 5 patterns in your browser\'s local storage. They persist across sessions.' },
  { question: 'Can I generate multiple SKUs with one pattern?', answer: 'Yes — set a "Batch Count" to generate multiple SKUs with auto-incrementing numbers in one click.' },
  { question: 'What are the example patterns?', answer: '{BRAND}-{CATEGORY}-{COLOR}-{SIZE} gives NIKE-TSH-BLK-M. {CATEGORY}-{YEAR}-{NUMBER} gives TSH-2025-0001.' },
]

const PRESETS = [
  { label: '{BRAND}-{CATEGORY}-{COLOR}-{SIZE}', desc: 'Standard variant SKU' },
  { label: '{BRAND}-{CATEGORY}-{AUTO_NUMBER}',  desc: 'Sequential with brand' },
  { label: '{CATEGORY}-{YEAR}-{AUTO_NUMBER}',   desc: 'Yearly catalog number' },
  { label: '{PREFIX}-{AUTO_NUMBER}',            desc: 'Simple numbered SKU' },
]

const STORAGE_KEY = 'ecomsathi-custom-sku-patterns'

interface SavedPattern {
  id: string
  name: string
  pattern: string
  tokens: CustomPatternToken[]
  separator: Separator
}

export default function CustomSKUGenerator() {
  const [tokens, setTokens] = useState<CustomPatternToken[]>([])
  const [separator, setSeparator] = useState<Separator>('-')
  const [fields, setFields] = useState({ brand: '', category: '', color: '', size: '', prefix: '', suffix: '' })
  const [startNumber, setStartNumber] = useState(1)
  const [counter, setCounter] = useState(1)
  const [batchCount, setBatchCount] = useState(1)
  const [results, setResults] = useState<string[]>([])
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([])
  const [patternName, setPatternName] = useState('')
  const [manualPattern, setManualPattern] = useState('')
  const [useManual, setUseManual] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSavedPatterns(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  const buildPatternString = useCallback((): string => {
    if (useManual) return manualPattern
    return tokens.map((t) => {
      if (t.type === 'NUMBER') return '{AUTO_NUMBER}'
      if (t.type === 'YEAR') return '{YEAR}'
      return `{${t.type}}`
    }).join(separator)
  }, [tokens, separator, useManual, manualPattern])

  const preview = buildCustomSKU(buildPatternString(), fields, counter, separator)

  const handleGenerate = () => {
    const pattern = buildPatternString()
    if (!pattern) { toast.error('Build a pattern first'); return }
    const skus: string[] = []
    for (let i = 0; i < batchCount; i++) {
      skus.push(buildCustomSKU(pattern, fields, counter + i, separator))
    }
    setResults(skus)
    setCounter((c) => c + batchCount)
    toast.success(`${skus.length} SKU${skus.length > 1 ? 's' : ''} generated!`)
  }

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(results.join('\n'))
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (results.length === 0) return
    const csv = ['SKU', ...results].join('\n')
    downloadCSV(csv, 'custom-skus.csv')
  }

  const handleSavePattern = () => {
    const pattern = buildPatternString()
    if (!pattern) { toast.error('Build a pattern first'); return }
    const name = patternName || pattern
    const saved: SavedPattern = {
      id: Date.now().toString(),
      name,
      pattern,
      tokens,
      separator,
    }
    const next = [saved, ...savedPatterns].slice(0, 5)
    setSavedPatterns(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
    setPatternName('')
    toast.success('Pattern saved!')
  }

  const handleLoadPattern = (p: SavedPattern) => {
    setTokens(p.tokens)
    setSeparator(p.separator)
    setUseManual(false)
  }

  const handleDeletePattern = (id: string) => {
    const next = savedPatterns.filter((p) => p.id !== id)
    setSavedPatterns(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const update = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }))

  return (
    <>
      <SEO
        title="Custom SKU Generator | EcomSathi"
        description="Build your own SKU pattern with token blocks. {BRAND}-{CATEGORY}-{AUTO_NUMBER}. Save patterns, generate in bulk."
        keywords="custom sku generator, sku pattern builder, custom sku format, sku template, sku rule builder"
        canonicalUrl="https://ecomsathi.vercel.app/tools/sku/custom"
        schema={PAGE_SCHEMA}
      />

      <SKUToolLayout
        title="Custom SKU Generator"
        description="Build your own SKU pattern using token blocks. Save presets and generate in batch."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-5 max-w-2xl">

          {/* Mode Toggle */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <div className="flex gap-2 mb-4">
              <button type="button" onClick={() => setUseManual(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[6px] border transition-colors ${!useManual ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#374151] border-[#E2E8F0] hover:border-[#2563EB]'}`}>
                Token Builder
              </button>
              <button type="button" onClick={() => setUseManual(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[6px] border transition-colors ${useManual ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#374151] border-[#E2E8F0] hover:border-[#2563EB]'}`}>
                Manual Pattern
              </button>
            </div>

            {useManual ? (
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Pattern String</label>
                <input
                  type="text"
                  value={manualPattern}
                  onChange={(e) => setManualPattern(e.target.value)}
                  placeholder="{BRAND}-{CATEGORY}-{AUTO_NUMBER:4}"
                  className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#2563EB]"
                />
                <p className="text-xs text-[#64748B] mt-1">
                  Tokens: {'{BRAND} {CATEGORY} {COLOR} {SIZE} {YEAR} {AUTO_NUMBER} {PREFIX} {SUFFIX}'}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {PRESETS.map((p) => (
                    <button key={p.label} type="button" onClick={() => setManualPattern(p.label)}
                      className="text-[11px] px-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#374151] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                      {p.desc}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <PatternBuilder
                tokens={tokens}
                separator={separator}
                onChange={setTokens}
                onSeparatorChange={setSeparator}
                preview={preview}
              />
            )}
          </div>

          {/* Field Values */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Token Values</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries({ brand: 'Brand', category: 'Category', color: 'Color', size: 'Size', prefix: 'Prefix', suffix: 'Suffix' }).map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-[#374151] mb-1">{label}</label>
                  <input
                    type="text"
                    value={fields[k as keyof typeof fields]}
                    onChange={update(k as keyof typeof fields)}
                    placeholder={label.toUpperCase().slice(0, 3)}
                    className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#F1F5F9]">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Start Number</label>
                <input
                  type="number"
                  min={1}
                  value={startNumber}
                  onChange={(e) => { setStartNumber(parseInt(e.target.value) || 1); setCounter(parseInt(e.target.value) || 1) }}
                  className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Batch Count</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={batchCount}
                  onChange={(e) => setBatchCount(Math.min(100, parseInt(e.target.value) || 1))}
                  className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1D4ED8] transition-colors">
              <Settings2 size={16} />
              Generate SKU{batchCount > 1 ? 's' : ''}
            </button>
            <button type="button" onClick={() => setCounter(startNumber)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] text-sm text-[#64748B] rounded-[6px] hover:bg-[#F8FAFC] transition-colors">
              Reset Counter ({counter})
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-sm font-semibold text-[#065F46]">{results.length} SKU{results.length > 1 ? 's' : ''} generated</p>
                <div className="flex gap-2">
                  <button type="button" onClick={handleCopyAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#BBF7D0] rounded-[6px] bg-white hover:bg-[#F0FDF4] transition-colors">
                    {copied ? <CheckCircle2 size={12} className="text-[#16A34A]" /> : <Copy size={12} />}
                    Copy All
                  </button>
                  <button type="button" onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#16A34A] text-white rounded-[6px] hover:bg-[#15803D] transition-colors">
                    <Download size={12} /> CSV
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.map((sku, i) => (
                  <code key={i} className="font-mono text-sm font-bold text-[#0F172A] px-2.5 py-1 bg-white border border-[#BBF7D0] rounded-[4px]">
                    {sku}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Save Pattern */}
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Save This Pattern</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
                placeholder="Pattern name (optional)"
                className="flex-1 border border-[#E2E8F0] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
              />
              <button type="button" onClick={handleSavePattern}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-xs font-medium rounded-[6px] hover:bg-[#DBEAFE] transition-colors">
                <Save size={12} /> Save
              </button>
            </div>

            {savedPatterns.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs text-[#64748B]">Saved patterns:</p>
                {savedPatterns.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px]">
                    <code className="flex-1 font-mono text-xs text-[#374151] truncate">{p.name}</code>
                    <button type="button" onClick={() => handleLoadPattern(p)}
                      className="text-xs text-[#2563EB] hover:underline">Load</button>
                    <button type="button" onClick={() => handleDeletePattern(p.id)}
                      className="text-[#DC2626] hover:opacity-70">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SKUToolLayout>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-6">
        <SKUFAQ items={FAQS} />
      </div>
    </>
  )
}
