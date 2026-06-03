// ============================================================
// PDF Tools Hub Page — /pdf  (matches SKUHub design system)
// ============================================================

import React from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Merge, Scissors, Crop, ScanText, FileArchive, Unlock,
  RotateCw, FileMinus, LayoutGrid, ImageIcon, FilePlus, Stamp, Hash,
  ChevronRight, CheckCircle2, Shield, Zap, Download,
  ArrowRight, Sparkles, Globe, Lock,
  FileDown, FileSearch, Layers,
} from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFFAQ from '../components/PDFFAQ'
import type { FAQItem } from '../types'
import { canonical } from '../utils/pdfUtils'

// ─── SEO schema ───────────────────────────────────────────────────────────────

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Free PDF Tools for Ecommerce Sellers & Businesses',
  description: 'Merge, split, crop, compress, OCR and edit PDF files online for free. No registration required.',
  url: canonical('/tools/pdf'),
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: canonical('/') },
      { '@type': 'ListItem', position: 2, name: 'Tools',     item: canonical('/tools') },
      { '@type': 'ListItem', position: 3, name: 'PDF Tools', item: canonical('/tools/pdf') },
    ],
  },
}

// ─── Tools ────────────────────────────────────────────────────────────────────

const PDF_TOOLS = [
  {
    name: 'Merge PDF',
    href: '/tools/pdf/merge',
    icon: Merge,
    desc: 'Combine multiple PDF files into one. Drag to reorder before merging.',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    badge: 'Popular',
    example: '3 PDFs → 1 file',
  },
  {
    name: 'Split PDF',
    href: '/tools/pdf/split',
    icon: Scissors,
    desc: 'Split by page ranges, every N pages, or extract individual pages.',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
    border: 'border-[#DDD6FE]',
    badge: null,
    example: '1–3, 5, 7–9',
  },
  {
    name: 'Crop PDF',
    href: '/tools/pdf/crop',
    icon: Crop,
    desc: 'Trim page margins on all or selected pages using exact point values.',
    color: 'text-[#0891B2]',
    iconBg: 'bg-[#ECFEFF]',
    border: 'border-[#A5F3FC]',
    badge: null,
    example: 'Top 36pt · Left 36pt',
  },
  {
    name: 'OCR PDF',
    href: '/tools/pdf/ocr',
    icon: ScanText,
    desc: 'Extract text from scanned PDFs using Tesseract OCR. Supports Hindi.',
    color: 'text-[#059669]',
    iconBg: 'bg-[#ECFDF5]',
    border: 'border-[#A7F3D0]',
    badge: 'Hindi',
    example: 'Scanned → Searchable',
  },
  {
    name: 'Compress PDF',
    href: '/tools/pdf/compress',
    icon: FileArchive,
    desc: 'Reduce PDF file size with Light, Balanced, or Maximum compression.',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    badge: 'Popular',
    example: '10 MB → 2 MB',
  },
  {
    name: 'Remove Password',
    href: '/tools/pdf/password',
    icon: Unlock,
    desc: 'Unlock a password-protected PDF you own. Fast and secure.',
    color: 'text-[#DC2626]',
    iconBg: 'bg-[#FFF1F2]',
    border: 'border-[#FFE4E6]',
    badge: null,
    example: 'Protected → Unlocked',
  },
  {
    name: 'Rotate PDF',
    href: '/tools/pdf/rotate',
    icon: RotateCw,
    desc: 'Rotate all or specific pages 90°, 180°, or 270° in one click.',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    badge: null,
    example: '90° · 180° · 270°',
  },
  {
    name: 'Extract Pages',
    href: '/tools/pdf/extract',
    icon: FileMinus,
    desc: 'Select specific pages and extract them into a new PDF document.',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
    border: 'border-[#DDD6FE]',
    badge: null,
    example: 'Pages 1, 3–5, 8',
  },
  {
    name: 'Rearrange Pages',
    href: '/tools/pdf/rearrange',
    icon: LayoutGrid,
    desc: 'Reorder, delete, or duplicate PDF pages by specifying a new order.',
    color: 'text-[#0891B2]',
    iconBg: 'bg-[#ECFEFF]',
    border: 'border-[#A5F3FC]',
    badge: null,
    example: '3, 1, 4, 2 → reorder',
  },
  {
    name: 'PDF to Image',
    href: '/tools/pdf/to-images',
    icon: ImageIcon,
    desc: 'Convert PDF pages to PNG or JPEG at 72, 150, or 300 DPI.',
    color: 'text-[#059669]',
    iconBg: 'bg-[#ECFDF5]',
    border: 'border-[#A7F3D0]',
    badge: 'ZIP',
    example: 'PDF → PNG / JPEG',
  },
  {
    name: 'Image to PDF',
    href: '/tools/pdf/images-to-pdf',
    icon: FilePlus,
    desc: 'Combine JPG, PNG, or WEBP images into a single PDF file.',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    badge: null,
    example: 'JPG + PNG → PDF',
  },
  {
    name: 'Watermark PDF',
    href: '/tools/pdf/watermark',
    icon: Stamp,
    desc: 'Add text watermark with custom color, opacity, angle, and position.',
    color: 'text-[#DC2626]',
    iconBg: 'bg-[#FFF1F2]',
    border: 'border-[#FFE4E6]',
    badge: null,
    example: 'CONFIDENTIAL stamp',
  },
  {
    name: 'Page Numbers',
    href: '/tools/pdf/page-numbers',
    icon: Hash,
    desc: 'Add page numbers with custom style, position, font, and prefix.',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    badge: null,
    example: 'Page 1 · Page 2 · …',
  },
]

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '13',      label: 'Free Tools',      icon: <Sparkles size={16} className="text-[#2563EB]" /> },
  { value: '50 MB',   label: 'Max File Size',   icon: <FileText size={16} className="text-[#7C3AED]" /> },
  { value: 'OCR',     label: 'Hindi Support',   icon: <ScanText size={16} className="text-[#059669]" /> },
  { value: '300 DPI', label: 'Image Quality',   icon: <ImageIcon size={16} className="text-[#D97706]" /> },
  { value: '0',       label: 'Login Required',  icon: <Shield size={16} className="text-[#DC2626]" /> },
  { value: '100%',    label: 'Free Forever',    icon: <Globe size={16} className="text-[#0891B2]" /> },
]

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <Zap size={18} className="text-[#2563EB]" />,       title: 'Instant Processing',      desc: 'Upload and process PDFs in seconds.' },
  { icon: <Lock size={18} className="text-[#059669]" />,       title: 'Secure & Private',        desc: 'Files deleted after processing. Never stored.' },
  { icon: <Layers size={18} className="text-[#7C3AED]" />,     title: 'Multi-Page Support',      desc: 'Works on PDFs of any page count.' },
  { icon: <FileSearch size={18} className="text-[#0891B2]" />, title: 'OCR Text Extraction',     desc: 'Tesseract OCR for Hindi & English scans.' },
  { icon: <FileDown size={18} className="text-[#D97706]" />,   title: 'Multiple Output Formats', desc: 'PDF, PNG, JPEG, ZIP downloads.' },
  { icon: <ImageIcon size={18} className="text-[#DC2626]" />,  title: 'PDF ↔ Image Conversion',  desc: 'Convert in both directions at any DPI.' },
  { icon: <Download size={18} className="text-[#059669]" />,   title: 'No Watermark',            desc: 'Clean output — no branding added.' },
  { icon: <Globe size={18} className="text-[#475569]" />,      title: 'Works on Any Device',     desc: 'Mobile, tablet, desktop — all browsers.' },
]

// ─── FAQs ─────────────────────────────────────────────────────────────────────

const FAQS: FAQItem[] = [
  {
    question: 'Are all PDF tools on EcomSathi completely free?',
    answer: 'Yes. All 13 PDF tools on EcomSathi are 100% free to use. There are no hidden charges, no subscriptions, and no credit card required.',
  },
  {
    question: 'Do I need to create an account to use the PDF tools?',
    answer: 'No. All PDF tools work without any login or registration. Just upload your file, process it, and download the result.',
  },
  {
    question: 'Are my PDF files safe?',
    answer: 'Yes. Files are processed securely on our server and are automatically deleted after processing. We never read, store, or share your documents.',
  },
  {
    question: 'What is the maximum file size for PDF tools?',
    answer: 'Most PDF tools support files up to 50 MB. For merging, the combined total of all files must be under 50 MB.',
  },
  {
    question: 'Can I use these PDF tools on mobile?',
    answer: 'Yes. All PDF tools are fully responsive and work on smartphones and tablets as well as desktop browsers.',
  },
  {
    question: 'Which PDF tools are most useful for ecommerce sellers?',
    answer: 'Merge PDF (combine invoices), Compress PDF (reduce attachment sizes), OCR PDF (extract text from scanned invoices), and PDF to Image (convert pages to product listing images) are most commonly used by ecommerce sellers.',
  },
]

// ─── Related tools ────────────────────────────────────────────────────────────

const RELATED = [
  { name: 'Image Tools', href: '/image',      desc: 'Background remover, resize, compress images',            icon: '🖼️', color: 'bg-[#F0FDF4] border-[#BBF7D0]' },
  { name: 'SKU Tools',   href: '/tools/sku',  desc: 'SKU generator, barcode, and printable label tools',      icon: '🏷️', color: 'bg-[#EFF6FF] border-[#BFDBFE]' },
  { name: 'GST Tools',   href: '/tools/gst',  desc: 'GST calculator, GSTIN validator, HSN code search',       icon: '📊', color: 'bg-[#FFFBEB] border-[#FDE68A]' },
  { name: 'Video Tools', href: '/video',      desc: 'Video to GIF, compress, resize and thumbnail generator', icon: '🎬', color: 'bg-[#FFF1F2] border-[#FECACA]' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function PDFHub() {
  return (
    <>
      <SEO
        title="Free PDF Tools for Ecommerce Sellers & Businesses — EcomSathi"
        description="Merge, split, crop, compress, OCR and edit PDF files online for free. 13 free PDF tools — no registration required. Made for Indian ecommerce sellers."
        keywords="free pdf tools online, merge pdf free, split pdf online, compress pdf, ocr pdf, pdf to image, image to pdf, rotate pdf, watermark pdf, extract pdf pages, pdf tools india"
        canonicalUrl={canonical('/tools/pdf')}
        schema={PAGE_SCHEMA}
      />

      <div className="flex flex-col gap-10">

        {/* ── HERO ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-[12px] bg-gradient-to-br from-[#0F172A] via-[#1A2B4A] to-[#1D4ED8] px-6 py-10 sm:px-10 sm:py-14">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#2563EB]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[#7C3AED]/20 blur-3xl" />

          {/* breadcrumb */}
          <nav className="relative mb-5 flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/tools" className="hover:text-white transition-colors">Tools</Link>
            <ChevronRight size={12} />
            <span className="text-white font-medium">PDF Tools</span>
          </nav>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            {/* icon */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[16px] bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
              <FileText size={44} className="text-white" />
            </div>

            {/* text */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#4ADE80] ring-1 ring-[#4ADE80]/30">
                  <CheckCircle2 size={10} /> No login required
                </span>
                <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#FCD34D] ring-1 ring-[#FCD34D]/30">
                  100% Free
                </span>
                <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#93C5FD] ring-1 ring-[#93C5FD]/30">
                  13 Tools
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-white sm:text-4xl leading-tight">
                Free PDF Tools for<br className="hidden sm:block" />
                <span className="text-[#93C5FD]"> Ecommerce Sellers & Businesses</span>
              </h1>
              <p className="mt-3 text-sm text-[#94A3B8] sm:text-base max-w-xl">
                Merge, split, crop, compress, OCR and edit PDF files online for free. No registration required. Built for Indian ecommerce sellers.
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
              <h2 className="text-xl font-bold text-[#0F172A]">Choose a PDF Tool</h2>
              <p className="text-sm text-[#64748B] mt-0.5">{PDF_TOOLS.length} free tools — no account needed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PDF_TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="group relative flex flex-col rounded-[10px] border border-[#E2E8F0] bg-white p-5 transition-all duration-150 hover:border-[#2563EB] hover:shadow-[0_4px_20px_-4px_rgba(37,99,235,0.15)] hover:-translate-y-0.5"
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
                  <h3 className="text-[15px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-[13px] text-[#64748B] leading-relaxed flex-1">{tool.desc}</p>

                  {/* example badge + open arrow */}
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
            <h2 className="text-lg font-bold text-[#0F172A]">Everything You Need to Work with PDFs</h2>
            <p className="text-sm text-[#64748B] mt-0.5">Built for Indian ecommerce sellers on Amazon, Flipkart, Meesho and more.</p>
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
              { step: '01', title: 'Upload Your PDF',     desc: 'Drag and drop or click to upload. Supports PDFs up to 50 MB.',             color: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]' },
              { step: '02', title: 'Choose a Tool',       desc: 'Select from 13 tools — merge, split, compress, OCR, watermark, and more.', color: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]' },
              { step: '03', title: 'Configure & Process', desc: 'Set options like pages, compression level, watermark text, or rotation.',  color: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]' },
              { step: '04', title: 'Download Instantly',  desc: 'Download the processed PDF or ZIP. Files are deleted from our server.',    color: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]' },
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
                <p className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{r.name}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{r.desc}</p>
                <span className="text-xs font-semibold text-[#2563EB] mt-auto flex items-center gap-1">
                  Explore <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <PDFFAQ items={FAQS} />

        {/* ── TRUST FOOTER ─────────────────────────────────── */}
        <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] px-6 py-4 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: <Shield size={14} className="text-[#16A34A]" />,      text: 'Files auto-deleted after processing' },
            { icon: <CheckCircle2 size={14} className="text-[#2563EB]" />, text: 'No login required' },
            { icon: <Zap size={14} className="text-[#D97706]" />,          text: '100% free forever' },
            { icon: <Download size={14} className="text-[#7C3AED]" />,     text: 'No watermark on output' },
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
