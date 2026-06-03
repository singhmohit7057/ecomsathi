// ============================================================
// Image Tools Hub Page — /image
// ============================================================

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eraser, Crop, Expand, Minimize2, FileImage, Layers,
  ArrowRightLeft, Stamp, Package, PaintBucket, Square,
  ChevronRight, CheckCircle2, Shield, Zap, Download,
  ArrowRight, ImageIcon, Sparkles, Globe, RefreshCw, MonitorSmartphone,
  ChevronDown,
} from 'lucide-react'
import SEO from '@/components/common/SEO'

// ─── SEO Schema ──────────────────────────────────────────────

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Free Image Tools for Ecommerce Sellers',
  description: 'Resize, compress, crop, convert and watermark product images for Indian marketplaces. Free browser-based image tools — no signup needed.',
  url: 'https://ecomsathi.vercel.app/image',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ecomsathi.vercel.app' },
      { '@type': 'ListItem', position: 2, name: 'Image Tools', item: 'https://ecomsathi.vercel.app/image' },
    ],
  },
}

// ─── Tools ───────────────────────────────────────────────────

const IMAGE_TOOLS = [
  {
    name: 'Background Remover',
    href: '/tools/image/background-remover',
    icon: Eraser,
    desc: 'Remove backgrounds automatically using AI. Outputs a clean transparent PNG.',
    color: 'text-[#DC2626]',
    iconBg: 'bg-[#FFF1F2]',
    border: 'border-[#FFE4E6]',
    badge: 'AI',
    example: 'product → transparent PNG',
  },
  {
    name: 'Crop Image',
    href: '/tools/image/crop',
    icon: Crop,
    desc: 'Drag-and-drop crop with aspect ratio presets (1:1, 4:3, 16:9) and 90° rotation.',
    color: 'text-[#16A34A]',
    iconBg: 'bg-[#F0FDF4]',
    border: 'border-[#BBF7D0]',
    badge: null,
    example: 'Free · 1:1 · 4:3 · 16:9',
  },
  {
    name: 'Resize Image',
    href: '/tools/image/resize',
    icon: Expand,
    desc: 'Resize by custom pixels, percentage or marketplace presets for Amazon & Flipkart.',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    badge: 'Presets',
    example: 'Amazon 2000×2000 · HD 1920×1080',
  },
  {
    name: 'Compress Image',
    href: '/tools/image/compress',
    icon: Minimize2,
    desc: 'Reduce file size with a quality slider or enter a target KB. Live preview included.',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    badge: null,
    example: '2 MB → 200 KB',
  },
  {
    name: 'JPG to PNG',
    href: '/tools/image/jpg-to-png',
    icon: FileImage,
    desc: 'Convert JPG/JPEG images to lossless PNG format. Batch conversion supported.',
    color: 'text-[#0284C7]',
    iconBg: 'bg-[#F0F9FF]',
    border: 'border-[#BAE6FD]',
    badge: 'Batch',
    example: 'photo.jpg → photo.png',
  },
  {
    name: 'PNG to JPG',
    href: '/tools/image/png-to-jpg',
    icon: Layers,
    desc: 'Convert PNG to JPEG with custom background color for transparency. Batch ready.',
    color: 'text-[#9333EA]',
    iconBg: 'bg-[#FDF4FF]',
    border: 'border-[#E9D5FF]',
    badge: 'Batch',
    example: 'logo.png → logo.jpg',
  },
  {
    name: 'WEBP Converter',
    href: '/tools/image/webp',
    icon: ArrowRightLeft,
    desc: 'Convert PNG/JPG to WEBP or WEBP back to PNG/JPG. Both directions supported.',
    color: 'text-[#059669]',
    iconBg: 'bg-[#F0FDF4]',
    border: 'border-[#A7F3D0]',
    badge: null,
    example: 'PNG ↔ WEBP ↔ JPG',
  },
  {
    name: 'Image Watermark',
    href: '/tools/image/watermark',
    icon: Stamp,
    desc: 'Add text or logo watermarks with 9-position grid, opacity and font size control.',
    color: 'text-[#EA580C]',
    iconBg: 'bg-[#FFF7ED]',
    border: 'border-[#FED7AA]',
    badge: null,
    example: '© Brand — bottom-right',
  },
  {
    name: 'Product Optimizer',
    href: '/tools/image/product-optimizer',
    icon: Package,
    desc: 'One-click optimize for Amazon, Flipkart, Myntra, Meesho — resize, bg, compress.',
    color: 'text-[#1D4ED8]',
    iconBg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    badge: 'All-in-one',
    example: 'Amazon · Flipkart · Myntra · Meesho',
  },
  {
    name: 'White Background',
    href: '/tools/image/white-background',
    icon: PaintBucket,
    desc: 'AI-powered white background replacement for marketplace compliance.',
    color: 'text-[#334155]',
    iconBg: 'bg-[#F8FAFC]',
    border: 'border-[#CBD5E1]',
    badge: 'AI',
    example: 'product → white bg PNG',
  },
  {
    name: 'Square Image Creator',
    href: '/tools/image/square',
    icon: Square,
    desc: 'Pad any image to a perfect square with white, transparent or custom fill.',
    color: 'text-[#BE185D]',
    iconBg: 'bg-[#FFF1F2]',
    border: 'border-[#FBCFE8]',
    badge: null,
    example: '800×600 → 800×800',
  },
]

// ─── Stats ───────────────────────────────────────────────────

const STATS = [
  { value: '11',       label: 'Free Tools',       icon: <Sparkles size={16} className="text-[#2563EB]" /> },
  { value: 'AI',       label: 'BG Removal',       icon: <Eraser size={16} className="text-[#DC2626]" /> },
  { value: 'Batch',    label: 'Conversion',        icon: <RefreshCw size={16} className="text-[#059669]" /> },
  { value: '4',        label: 'Marketplaces',      icon: <Package size={16} className="text-[#1D4ED8]" /> },
  { value: '0',        label: 'Login Required',    icon: <Shield size={16} className="text-[#16A34A]" /> },
  { value: '100%',     label: 'Browser-Based',     icon: <Globe size={16} className="text-[#D97706]" /> },
]

// ─── Features ────────────────────────────────────────────────

const FEATURES = [
  { icon: <Zap size={18} className="text-[#2563EB]" />,           title: 'Instant Processing',     desc: 'All tools run in your browser — no upload wait times.' },
  { icon: <Shield size={18} className="text-[#16A34A]" />,        title: 'Private & Secure',       desc: 'Images never leave your device (except AI tools).' },
  { icon: <RefreshCw size={18} className="text-[#059669]" />,     title: 'Batch Conversion',       desc: 'Convert multiple files at once with JPG/PNG/WEBP tools.' },
  { icon: <Package size={18} className="text-[#1D4ED8]" />,       title: 'Marketplace Presets',    desc: 'Sizes for Amazon, Flipkart, Myntra and Meesho built in.' },
  { icon: <Eraser size={18} className="text-[#DC2626]" />,        title: 'AI Background Removal',  desc: 'Smart AI removes product backgrounds in one click.' },
  { icon: <MonitorSmartphone size={18} className="text-[#7C3AED]" />, title: 'Works on Any Device', desc: 'Fully mobile-friendly — works on phone, tablet or desktop.' },
  { icon: <Download size={18} className="text-[#D97706]" />,      title: 'Instant Download',       desc: 'Download processed images immediately — no email needed.' },
  { icon: <ImageIcon size={18} className="text-[#0891B2]" />,     title: 'All Major Formats',      desc: 'JPG, PNG, WEBP supported across all tools.' },
]

// ─── FAQs ─────────────────────────────────────────────────────

const FAQS = [
  {
    question: 'Are all image tools completely free?',
    answer: 'Yes. All 11 image tools are 100% free with no login required. You can use them unlimited times.',
  },
  {
    question: 'Do images get uploaded to a server?',
    answer: 'Most tools (resize, crop, compress, convert, watermark, square) process images entirely in your browser using Canvas API — nothing is uploaded. Only Background Remover and White Background use a server-side AI model and send images securely for processing.',
  },
  {
    question: 'What image formats are supported?',
    answer: 'JPG, JPEG, PNG, and WEBP are supported across all tools. The WEBP Converter specifically handles bidirectional conversion between these formats.',
  },
  {
    question: 'What are the marketplace image size requirements?',
    answer: 'Amazon requires minimum 1000px (2000px recommended), pure white background, JPEG format. Flipkart requires 1500×1500px. Myntra requires 800×1000px. Use the Product Image Optimizer to apply the right preset in one click.',
  },
  {
    question: 'Can I convert multiple images at once?',
    answer: 'Yes. JPG to PNG, PNG to JPG, and WEBP Converter all support batch conversion — drag multiple files at once and convert them all together.',
  },
  {
    question: 'What is the maximum file size?',
    answer: 'Each image can be up to 20MB. For best results with AI tools (Background Remover, White Background), use images under 5MB.',
  },
]

// ─── Related Tools ────────────────────────────────────────────

const RELATED = [
  { name: 'PDF Tools',   href: '/tools/pdf',   desc: 'Merge, split, compress and watermark PDFs',          icon: '📄', color: 'bg-[#EFF6FF] border-[#BFDBFE]' },
  { name: 'SKU Tools',   href: '/tools/sku',   desc: 'Generate SKUs, barcodes and product labels',          icon: '🏷️', color: 'bg-[#F5F3FF] border-[#DDD6FE]' },
  { name: 'GST Tools',   href: '/gst',         desc: 'GST calculator, GSTIN validator, HSN search',         icon: '📊', color: 'bg-[#FFFBEB] border-[#FDE68A]' },
  { name: 'Video Tools', href: '/video',        desc: 'Video to GIF, compress, resize and thumbnails',       icon: '🎬', color: 'bg-[#FFF1F2] border-[#FECACA]' },
]

// ─── FAQ Component ────────────────────────────────────────────

function ImageHubFAQ({ items }: { items: typeof FAQS }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const toggle = (idx: number) => setOpenIdx((prev) => (prev === idx ? null : idx))

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
        <p className="text-sm text-[#64748B]">Everything you need to know about EcomSathi image tools.</p>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className={`rounded-[8px] border bg-white transition-all duration-200 ${
                isOpen ? 'border-[#2563EB] shadow-sm' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
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
                    isOpen ? 'text-[#2563EB]' : 'text-[#CBD5E1]'
                  }`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-sm font-semibold transition-colors ${
                    isOpen ? 'text-[#2563EB]' : 'text-[#0F172A]'
                  }`}>
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-all duration-200 ${
                    isOpen ? 'rotate-180 text-[#2563EB]' : 'text-[#94A3B8]'
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 ml-8">
                  <p className="text-sm text-[#64748B] leading-relaxed border-l-2 border-[#BFDBFE] pl-4">
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
        <a href="/contact" className="text-[#2563EB] hover:underline font-medium">Contact us</a>
      </p>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────

export const ImageToolsIndex: React.FC = () => {
  return (
    <>
      <SEO
        title="Free Image Tools for Ecommerce Sellers | EcomSathi"
        description="Resize, compress, crop, convert and watermark product images for Indian marketplaces. 11 free browser-based image tools — no signup needed."
        keywords="image tools online free, resize image, compress image, background remover, crop image, jpg to png, webp converter, product image optimizer, ecommerce image tools india"
        canonicalUrl="https://ecomsathi.vercel.app/image"
        schema={PAGE_SCHEMA}
      />

      <div className="flex flex-col gap-10">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-[12px] bg-gradient-to-br from-[#0F172A] via-[#1a2744] to-[#0e4f3a] px-6 py-10 sm:px-10 sm:py-14">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#16A34A]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[#2563EB]/20 blur-3xl" />

          {/* breadcrumb */}
          <nav className="relative mb-5 flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/tools" className="hover:text-white transition-colors">Tools</Link>
            <ChevronRight size={12} />
            <span className="text-white font-medium">Image Tools</span>
          </nav>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            {/* icon */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[16px] bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
              <ImageIcon size={44} className="text-white" />
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
                  Browser-Based
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-white sm:text-4xl leading-tight">
                Free Image Tools<br className="hidden sm:block" />
                <span className="text-[#6EE7B7]"> for Ecommerce Sellers</span>
              </h1>
              <p className="mt-3 text-sm text-[#94A3B8] sm:text-base max-w-xl">
                Resize, compress, crop, convert and optimize product images for Amazon, Flipkart, Myntra and Meesho — all free, all in your browser.
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
              <h2 className="text-xl font-bold text-[#0F172A]">Choose an Image Tool</h2>
              <p className="text-sm text-[#64748B] mt-0.5">{IMAGE_TOOLS.length} free tools — no account needed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {IMAGE_TOOLS.map((tool) => {
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
            <h2 className="text-lg font-bold text-[#0F172A]">Everything You Need to Optimize Product Images</h2>
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
              { step: '01', title: 'Upload Your Image',     desc: 'Drag and drop or click to upload. JPG, PNG, WEBP supported up to 20MB.',           color: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]' },
              { step: '02', title: 'Pick a Tool',           desc: 'Select from resize, crop, compress, convert, watermark, or marketplace optimizer.', color: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]' },
              { step: '03', title: 'Adjust Settings',       desc: 'Set dimensions, quality, format, position or marketplace preset as needed.',        color: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]' },
              { step: '04', title: 'Download Instantly',    desc: 'Click process and download your optimized image — no email or signup needed.',      color: 'bg-[#FFF1F2] border-[#FECACA] text-[#DC2626]' },
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
        <ImageHubFAQ items={FAQS} />

        {/* ── TRUST FOOTER ─────────────────────────────────── */}
        <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] px-6 py-4 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: <Shield size={14} className="text-[#16A34A]" />,    text: 'No data sent to servers' },
            { icon: <CheckCircle2 size={14} className="text-[#2563EB]" />, text: 'No login required' },
            { icon: <Zap size={14} className="text-[#D97706]" />,       text: 'Works 100% in browser' },
            { icon: <Download size={14} className="text-[#7C3AED]" />,  text: 'Unlimited downloads' },
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

export default ImageToolsIndex
