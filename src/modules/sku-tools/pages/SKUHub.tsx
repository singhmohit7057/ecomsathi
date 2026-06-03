// ============================================================
// SKU Tools Hub Page — /tools/sku  (same UI pattern as ImageHub)
// ============================================================

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Tag, QrCode, Printer, List, Layers, Barcode, FileBarChart2,
  ChevronRight, CheckCircle2, Shield, Zap, Download,
  ArrowRight, ChevronDown,
} from 'lucide-react'
import SEO from '@/components/common/SEO'

// ─── Tools ───────────────────────────────────────────────────

const SKU_TOOLS = [
  {
    name: 'SKU Generator',
    href: '/tools/sku/generator',
    icon: Tag,
    desc: 'Generate unique SKU codes from brand, category, color and size attributes.',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
    border: 'border-[#DDD6FE]',
    badge: 'Most Used',
    example: 'NIKE-SHIRT-BLK-L-001',
  },
  {
    name: 'Bulk SKU Generator',
    href: '/tools/sku/bulk',
    icon: List,
    desc: 'Upload CSV or Excel to generate SKUs for hundreds of products at once.',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    badge: 'CSV',
    example: '500 SKUs in one upload',
  },
  {
    name: 'Variant SKU Generator',
    href: '/tools/sku/variant',
    icon: Layers,
    desc: 'Auto-generate all Color × Size × Material SKU combinations instantly.',
    color: 'text-[#0891B2]',
    iconBg: 'bg-[#ECFEFF]',
    border: 'border-[#A5F3FC]',
    badge: null,
    example: 'RED-S · RED-M · BLUE-S…',
  },
  {
    name: 'Custom SKU Generator',
    href: '/tools/sku/custom',
    icon: FileBarChart2,
    desc: 'Build your own SKU pattern with custom tokens, separators and save presets.',
    color: 'text-[#16A34A]',
    iconBg: 'bg-[#F0FDF4]',
    border: 'border-[#BBF7D0]',
    badge: null,
    example: '{BRAND}-{CAT}-{SEQ}',
  },
  {
    name: 'Barcode Generator',
    href: '/tools/sku/barcode',
    icon: Barcode,
    desc: 'Generate EAN-13, Code 128, QR Code and UPC-A barcodes with one click.',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    badge: 'Popular',
    example: 'EAN-13 · Code128 · QR',
  },
  {
    name: 'Label Generator',
    href: '/tools/sku/label-generator',
    icon: QrCode,
    desc: 'Design and export print-ready product labels with barcode and price.',
    color: 'text-[#E11D48]',
    iconBg: 'bg-[#FFF1F2]',
    border: 'border-[#FECDD3]',
    badge: null,
    example: 'A4 · Thermal · Custom',
  },
  {
    name: 'Label Printer',
    href: '/tools/sku/label-printer',
    icon: Printer,
    desc: 'Print labels directly to thermal printers or export A4 sheet PDFs.',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
    border: 'border-[#DDD6FE]',
    badge: null,
    example: 'Zebra · TSC · A4 PDF',
  },
]

// ─── Stats ───────────────────────────────────────────────────

const STATS = [
  { value: '7',     label: 'Free Tools',       icon: <Tag size={16} className="text-[#7C3AED]" /> },
  { value: 'CSV',   label: 'Bulk Upload',       icon: <List size={16} className="text-[#2563EB]" /> },
  { value: '4',     label: 'Barcode Types',     icon: <Barcode size={16} className="text-[#D97706]" /> },
  { value: 'PDF',   label: 'Label Export',      icon: <Printer size={16} className="text-[#E11D48]" /> },
  { value: '0',     label: 'Login Required',    icon: <Shield size={16} className="text-[#16A34A]" /> },
  { value: '100%',  label: 'Free Forever',      icon: <Zap size={16} className="text-[#0891B2]" /> },
]

// ─── Features ────────────────────────────────────────────────

const FEATURES = [
  { icon: <Zap size={18} className="text-[#2563EB]" />,           title: 'Instant Generation',    desc: 'All SKU tools run in your browser — generate thousands in seconds.' },
  { icon: <Shield size={18} className="text-[#16A34A]" />,        title: 'No Login Required',     desc: 'Use all 7 SKU tools for free — no signup or account needed.' },
  { icon: <List size={18} className="text-[#2563EB]" />,          title: 'Bulk CSV Support',      desc: 'Upload a CSV with product data and generate SKUs for all rows at once.' },
  { icon: <Barcode size={18} className="text-[#D97706]" />,       title: '4 Barcode Formats',     desc: 'EAN-13, Code 128, QR Code and UPC-A supported with PNG/SVG export.' },
  { icon: <Printer size={18} className="text-[#E11D48]" />,       title: 'Thermal & A4 Labels',   desc: 'Export labels as A4 PDF sheets or 4×6 thermal format for Zebra/TSC.' },
  { icon: <Layers size={18} className="text-[#0891B2]" />,        title: 'Variant SKUs',          desc: 'Auto-generate all size/color/material combinations in one step.' },
  { icon: <Download size={18} className="text-[#D97706]" />,      title: 'Instant Download',      desc: 'Download SKUs as CSV or barcodes as PNG/SVG immediately.' },
  { icon: <FileBarChart2 size={18} className="text-[#16A34A]" />, title: 'Custom Patterns',       desc: 'Define your own SKU format with token blocks and reusable presets.' },
]

// ─── FAQs ─────────────────────────────────────────────────────

const FAQS = [
  {
    question: 'Are all SKU tools completely free?',
    answer: 'Yes. All 7 SKU tools are 100% free with no login required. You can use them unlimited times.',
  },
  {
    question: 'What is a SKU and why do I need one?',
    answer: 'A SKU (Stock Keeping Unit) is a unique code for each product variant. A well-structured SKU helps you track stock, process orders and reconcile marketplace payouts accurately.',
  },
  {
    question: 'What barcode formats are supported?',
    answer: 'EAN-13 (Indian retail standard), Code 128 (warehousing), QR Code (URLs/data) and UPC-A (international retail). Barcodes export as PNG or SVG.',
  },
  {
    question: 'Can I generate SKUs for hundreds of products at once?',
    answer: 'Yes. The Bulk SKU Generator accepts CSV or Excel files. Prepare columns for product name, category, brand, color and size — EcomSathi generates structured SKUs for all rows instantly.',
  },
  {
    question: 'What label sizes does the Label Generator support?',
    answer: 'A4 sheet labels (2×4, 2×5, 3×7 grid), A6 thermal labels (100×150mm), 40×25mm and 50×25mm sticker labels, and custom dimensions. Output is a print-ready PDF.',
  },
  {
    question: 'How does the Custom SKU Generator work?',
    answer: 'You define a pattern using token blocks like {BRAND}, {CATEGORY}, {COLOR}, {SIZE} and {SEQ}. Choose separators (- or _), set sequence numbering, and save as a reusable preset.',
  },
]

// ─── Related ─────────────────────────────────────────────────

const RELATED = [
  { name: 'PDF Tools',   href: '/tools/pdf',   desc: 'Merge, split, compress and watermark PDFs',       icon: '📄', color: 'bg-[#EFF6FF] border-[#BFDBFE]' },
  { name: 'Image Tools', href: '/tools/image', desc: 'Resize, compress, crop and optimize images',       icon: '🖼️', color: 'bg-[#F0FDF4] border-[#BBF7D0]' },
  { name: 'GST Tools',   href: '/tools/gst',   desc: 'GST calculator, GSTIN validator, HSN search',     icon: '📊', color: 'bg-[#FFFBEB] border-[#FDE68A]' },
  { name: 'Video Tools', href: '/tools/video', desc: 'Video to GIF, compress, resize and thumbnails',     icon: '🎬', color: 'bg-[#FFF1F2] border-[#FECACA]' },
]

// ─── FAQ Component ────────────────────────────────────────────

function SKUHubFAQ({ items }: { items: typeof FAQS }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const toggle = (idx: number) => setOpenIdx((prev) => (prev === idx ? null : idx))

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
        <p className="text-sm text-[#64748B]">Everything you need to know about EcomSathi SKU tools.</p>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className={`rounded-[8px] border bg-white transition-all duration-200 ${
                isOpen ? 'border-[#7C3AED] shadow-sm' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 text-xs font-bold tabular-nums w-5 transition-colors ${
                    isOpen ? 'text-[#7C3AED]' : 'text-[#CBD5E1]'
                  }`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-sm font-semibold transition-colors ${
                    isOpen ? 'text-[#7C3AED]' : 'text-[#0F172A]'
                  }`}>
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-all duration-200 ${
                    isOpen ? 'rotate-180 text-[#7C3AED]' : 'text-[#94A3B8]'
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 ml-8">
                  <p className="text-sm text-[#64748B] leading-relaxed border-l-2 border-[#DDD6FE] pl-4">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-[#94A3B8] text-center">
        Still have questions?{' '}
        <a href="/contact" className="text-[#7C3AED] hover:underline font-medium">Contact us</a>
      </p>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────

export default function SKUToolsHub() {
  return (
    <>
      <SEO
        title="SKU Tools — Generate SKUs, Barcodes & Labels | EcomSathi"
        description="Free SKU generator tools for Indian ecommerce sellers. Generate single, bulk and variant SKUs, print barcodes and create product labels. No login needed."
        keywords="sku generator free, barcode generator india, bulk sku generator, label generator, product label printer, ecommerce sku tools india"
        canonicalUrl="https://ecomsathi.vercel.app/tools/sku"
      />

      <div className="flex flex-col gap-10">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-[12px] bg-gradient-to-br from-[#0F172A] via-[#1e1040] to-[#2e1065] px-6 py-10 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#7C3AED]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[#2563EB]/20 blur-3xl" />

          {/* breadcrumb */}
          <nav className="relative mb-5 flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/tools" className="hover:text-white transition-colors">Tools</Link>
            <ChevronRight size={12} />
            <span className="text-white font-medium">SKU Tools</span>
          </nav>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            {/* icon */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[16px] bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
              <Tag size={44} className="text-white" />
            </div>

            {/* text */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#7C3AED]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#C4B5FD] ring-1 ring-[#C4B5FD]/30">
                  <CheckCircle2 size={10} /> No login required
                </span>
                <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#FCD34D] ring-1 ring-[#FCD34D]/30">
                  100% Free
                </span>
                <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#93C5FD] ring-1 ring-[#93C5FD]/30">
                  7 Tools
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-white sm:text-4xl leading-tight">
                Free SKU Generator,<br className="hidden sm:block" />
                <span className="text-[#C4B5FD]"> Barcode &amp; Label Tools</span>
              </h1>
              <p className="mt-3 text-sm text-[#94A3B8] sm:text-base max-w-xl">
                Generate professional SKUs, create barcodes and print product labels — all from your browser. Built for Indian ecommerce sellers on Amazon, Flipkart, Meesho and Myntra.
              </p>
            </div>
          </div>
        </div>

        {/* ── STATS STRIP ──────────────────────────────────── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-[8px] bg-white border border-[#E2E8F0] text-center">
              {s.icon}
              <p className="text-base font-extrabold text-[#0F172A] leading-tight">{s.value}</p>
              <p className="text-[10px] text-[#64748B] leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── TOOL CARDS ───────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Choose a SKU Tool</h2>
              <p className="text-sm text-[#64748B] mt-0.5">{SKU_TOOLS.length} free tools — no account needed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKU_TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="group relative flex flex-col rounded-[10px] border border-[#E2E8F0] bg-white p-5 transition-all duration-150 hover:border-[#7C3AED] hover:shadow-[0_4px_20px_-4px_rgba(124,58,237,0.15)] hover:-translate-y-0.5"
                >
                  {/* top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-[8px] border ${tool.iconBg} ${tool.border} ${tool.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tool.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                          {tool.badge}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                        Free
                      </span>
                    </div>
                  </div>

                  {/* content */}
                  <h3 className={`text-[15px] font-bold text-[#0F172A] group-hover:${tool.color.replace('text-', 'text-')} transition-colors mb-1`}>
                    {tool.name}
                  </h3>
                  <p className="text-[13px] text-[#64748B] leading-relaxed flex-1">{tool.desc}</p>

                  {/* example badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <code className="text-[11px] font-mono text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-0.5 truncate max-w-[150px]">
                      {tool.example}
                    </code>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${tool.color} group-hover:gap-1.5 transition-all`}>
                      Open <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ── FEATURES GRID ────────────────────────────────── */}
        <div className="rounded-[12px] border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F1F5F9]">
            <h2 className="text-lg font-bold text-[#0F172A]">Everything You Need to Manage Product SKUs</h2>
            <p className="text-sm text-[#64748B] mt-0.5">Built for Indian ecommerce sellers on Amazon, Flipkart, Myntra and Meesho.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#F1F5F9]">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`flex flex-col gap-2 p-5 ${i >= 4 ? 'border-t border-[#F1F5F9]' : ''}`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                  {f.icon}
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ─────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-5">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Choose a Tool',     desc: 'Pick from SKU Generator, Barcode, Label or Bulk generator based on your need.',     color: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]' },
              { step: '02', title: 'Enter Details',     desc: 'Fill in brand, category, size and color or upload your product CSV file.',          color: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]' },
              { step: '03', title: 'Generate',          desc: 'EcomSathi creates structured SKUs and barcodes following best practices.',           color: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]' },
              { step: '04', title: 'Download & Print',  desc: 'Export as CSV, PNG or print-ready PDF labels instantly — no signup needed.',        color: 'bg-[#FFF1F2] border-[#FECACA] text-[#E11D48]' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col gap-3 p-5 rounded-[10px] bg-white border border-[#E2E8F0]">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-[8px] border text-sm font-extrabold ${s.color}`}>
                  {s.step}
                </span>
                <p className="text-sm font-bold text-[#0F172A]">{s.title}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RELATED TOOLS ────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-5">Related Ecommerce Tools</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {RELATED.map((r) => (
              <Link
                key={r.href}
                to={r.href}
                className={`group flex flex-col gap-2 p-4 rounded-[10px] border ${r.color} hover:shadow-[0_2px_12px_-2px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all`}
              >
                <span className="text-2xl">{r.icon}</span>
                <p className="text-sm font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors">{r.name}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{r.desc}</p>
                <span className="text-xs font-semibold text-[#7C3AED] mt-auto flex items-center gap-1">
                  Explore <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <SKUHubFAQ items={FAQS} />

        {/* ── TRUST FOOTER ─────────────────────────────────── */}
        <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] px-6 py-4 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: <Shield size={14} className="text-[#16A34A]" />,    text: 'No login required' },
            { icon: <CheckCircle2 size={14} className="text-[#7C3AED]" />, text: '100% free forever' },
            { icon: <Zap size={14} className="text-[#D97706]" />,       text: 'Instant generation' },
            { icon: <Download size={14} className="text-[#2563EB]" />,  text: 'Download CSV & PDF' },
          ].map((t) => (
            <div key={t.text} className="flex items-center gap-1.5 text-xs text-[#64748B]">
              {t.icon}
              {t.text}
            </div>
          ))}
        </div>

      </div>
    </>
  )
}
