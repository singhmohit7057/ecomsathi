// ============================================================
// GST Tools Hub Page — /tools/gst  (matching SKU/Image hub pattern)
// ============================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, Calculator, Divide, Tag, BookOpen, FileText,
  MapPin, CreditCard, ChevronRight, CheckCircle2, Zap,
  Download, ArrowRight, Receipt, Sparkles, Globe,
  ChevronDown, Lock, Database, Wifi, WifiOff,
} from 'lucide-react'
import SEO from '@/components/common/SEO'

// ─── SEO ───────────────────────────────────────────────────

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Free GST Tools for Ecommerce Sellers & Businesses',
  description: 'GST calculator, GSTIN verification, HSN/SAC code search, rate finder and more. Free GST tools for Indian ecommerce sellers.',
  url: 'https://ecomsathi.vercel.app/tools/gst',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://ecomsathi.vercel.app' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://ecomsathi.vercel.app/tools' },
      { '@type': 'ListItem', position: 3, name: 'GST Tools', item: 'https://ecomsathi.vercel.app/tools/gst' },
    ],
  },
}

// ─── Tools ─────────────────────────────────────────────────

const GST_TOOLS = [
  {
    name: 'GST Verification',
    href: '/tools/gst/verify',
    icon: Shield,
    desc: 'Validate GSTIN format, checksum & all 6 structure checks — then verify live on the GSTN portal.',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    badge: 'Live Verify',
    example: '27AABCU9603R1ZX → Active',
  },
  {
    name: 'GST Calculator',
    href: '/tools/gst/calculator',
    icon: Calculator,
    desc: 'Calculate CGST + SGST (intra-state) or IGST (inter-state) for any amount. Supports cess.',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    badge: 'Offline',
    example: '₹1000 + 18% → ₹1180',
  },
  {
    name: 'Reverse GST Calculator',
    href: '/tools/gst/reverse',
    icon: Divide,
    desc: 'Enter a GST-inclusive price and extract the original base amount and tax breakdown.',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
    border: 'border-[#DDD6FE]',
    badge: 'Offline',
    example: '₹1180 → ₹1000 + ₹180 GST',
  },
  {
    name: 'GST Rate Finder',
    href: '/tools/gst/rate-finder',
    icon: Tag,
    desc: 'Find the GST rate for any product (HSN) or service (SAC) by code or keyword search.',
    color: 'text-[#DC2626]',
    iconBg: 'bg-[#FFF1F2]',
    border: 'border-[#FECACA]',
    badge: 'Offline',
    example: 't-shirt → HSN 6109 → 12%',
  },
  {
    name: 'HSN Code Search',
    href: '/tools/gst/hsn-search',
    icon: BookOpen,
    desc: 'Search HSN codes for goods by code or description. Includes quick GST calculator per result.',
    color: 'text-[#0891B2]',
    iconBg: 'bg-[#ECFEFF]',
    border: 'border-[#A5F3FC]',
    badge: 'Offline',
    example: '8517 → Mobile phones → 18%',
  },
  {
    name: 'SAC Code Search',
    href: '/tools/gst/sac-search',
    icon: FileText,
    desc: 'Search Service Accounting Codes for services by code number or service description.',
    color: 'text-[#BE185D]',
    iconBg: 'bg-[#FDF2F8]',
    border: 'border-[#FBCFE8]',
    badge: 'Offline',
    example: '9965 → Courier → 18%',
  },
  {
    name: 'GST State Finder',
    href: '/tools/gst/state-finder',
    icon: MapPin,
    desc: 'Find the state name and zone from any 2-digit GST state code or full GSTIN.',
    color: 'text-[#059669]',
    iconBg: 'bg-[#ECFDF5]',
    border: 'border-[#A7F3D0]',
    badge: 'Offline',
    example: '27 → Maharashtra → West',
  },
  {
    name: 'PAN Validator',
    href: '/tools/gst/pan-validator',
    icon: CreditCard,
    desc: 'Validate PAN card numbers and extract taxpayer entity type (Individual, Company, etc.).',
    color: 'text-[#475569]',
    iconBg: 'bg-[#F1F5F9]',
    border: 'border-[#CBD5E1]',
    badge: 'Offline',
    example: 'AABCU9603R → Company',
  },
]

// ─── Stats ─────────────────────────────────────────────────

const STATS = [
  { value: '8',        label: 'Free Tools',      icon: <Sparkles size={16} className="text-[#2563EB]" /> },
  { value: 'Live',     label: 'GSTN Verify',     icon: <Wifi size={16} className="text-[#0891B2]" /> },
  { value: '6-Step',   label: 'Validation',      icon: <Shield size={16} className="text-[#16A34A]" /> },
  { value: 'CBIC',     label: 'Compliant',       icon: <Database size={16} className="text-[#D97706]" /> },
  { value: '0',        label: 'Login Required',  icon: <Lock size={16} className="text-[#7C3AED]" /> },
  { value: '100%',     label: 'Browser-Based',   icon: <Globe size={16} className="text-[#DC2626]" /> },
]

// ─── Features ──────────────────────────────────────────────

const FEATURES = [
  { icon: <Zap size={18} className="text-[#2563EB]" />,        title: 'Instant Format Check',     desc: '6-step GSTIN validation runs in your browser — no server call.' },
  { icon: <Wifi size={18} className="text-[#0891B2]" />,        title: 'Live GSTN Verification',   desc: 'Confirm active status directly from the government portal.' },
  { icon: <Database size={18} className="text-[#D97706]" />,    title: 'CBIC Compliant Rates',     desc: 'HSN/SAC data based on official CBIC GST notifications.' },
  { icon: <WifiOff size={18} className="text-[#16A34A]" />,     title: 'Works Offline',            desc: 'Calculators, HSN/SAC search and validators need no internet.' },
  { icon: <Calculator size={18} className="text-[#DC2626]" />,  title: 'Intra & Inter-State',      desc: 'Auto-splits CGST+SGST or IGST based on transaction type.' },
  { icon: <BookOpen size={18} className="text-[#0891B2]" />,    title: 'Full HSN/SAC Library',     desc: 'Thousands of product and service codes with fuzzy keyword search.' },
  { icon: <Lock size={18} className="text-[#7C3AED]" />,        title: 'No API Key Exposed',       desc: 'Backend proxies GSTN calls — your browser never touches the API.' },
  { icon: <Download size={18} className="text-[#059669]" />,    title: 'No Login Required',        desc: 'Use every tool freely without creating an account.' },
]

// ─── FAQs ──────────────────────────────────────────────────

const FAQS = [
  {
    question: 'What is a GSTIN?',
    answer: 'A GSTIN (Goods and Services Tax Identification Number) is a unique 15-character code assigned to every GST-registered business in India. It encodes the state code (2 digits), PAN (10 chars), entity number, Z marker, and a checksum digit.',
  },
  {
    question: 'What is the difference between CGST, SGST, and IGST?',
    answer: 'For intra-state (same state) transactions, GST splits equally into CGST (Central) and SGST (State). For inter-state transactions, only IGST applies. The total tax rate is the same — use the calculator to get the correct breakdown.',
  },
  {
    question: 'What is an HSN code?',
    answer: 'HSN (Harmonised System of Nomenclature) codes classify goods under GST. Businesses with turnover above ₹5 crore must mention 6-digit HSN codes on invoices. Use HSN Code Search to find your product\'s code and rate.',
  },
  {
    question: 'What is a SAC code?',
    answer: 'SAC (Service Accounting Code) classifies services under GST, similar to HSN for goods. Every service provider must quote their SAC on GST invoices. Most services attract 18% GST.',
  },
  {
    question: 'How does live GSTIN verification work?',
    answer: 'After passing all 6 format checks, click "Verify Live on GSTN Portal". Our secure backend calls the official GSTN API and returns the registered business name, active status, jurisdiction and registration date — without exposing any API key to your browser.',
  },
  {
    question: 'Are these tools free?',
    answer: 'Yes — all 8 GST tools are completely free with no login required. Most work entirely offline in your browser. Only live GSTIN verification uses our backend to call the GSTN portal.',
  },
]

// ─── Related Tools ─────────────────────────────────────────

const RELATED = [
  { name: 'PDF Tools',   href: '/tools/pdf',   desc: 'Merge, split, compress and watermark PDFs',               icon: '📄', color: 'bg-[#EFF6FF] border-[#BFDBFE]' },
  { name: 'Image Tools', href: '/tools/image', desc: 'Background remover, resize, compress product images',      icon: '🖼️', color: 'bg-[#F0FDF4] border-[#BBF7D0]' },
  { name: 'SKU Tools',   href: '/tools/sku',   desc: 'Generate SKUs, barcodes and printable product labels',     icon: '🏷️', color: 'bg-[#F5F3FF] border-[#DDD6FE]' },
  { name: 'Video Tools', href: '/tools/video', desc: 'Video to GIF, compress, resize and thumbnail generator',   icon: '🎬', color: 'bg-[#FFF1F2] border-[#FECACA]' },
]

// ─── Inline FAQ accordion ───────────────────────────────────

function GSTHubFAQ({ items }: { items: typeof FAQS }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const toggle = (idx: number) => setOpenIdx((prev) => (prev === idx ? null : idx))

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
        <p className="text-sm text-[#64748B]">Everything you need to know about EcomSathi GST tools.</p>
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

// ─── Hub page ─────────────────────────────────────────────

export const handle = {
  toolName: undefined,
  category: 'GST Tools',
  description: 'Free GST tools for Indian sellers — validate, calculate and find codes.',
}

export default function GSTToolsHub() {
  return (
    <>
      <SEO
        title="Free GST Tools for Ecommerce Sellers & Businesses | EcomSathi"
        description="GST calculator, GSTIN verification, HSN/SAC code search, rate finder and more. 8 free GST tools for Indian ecommerce sellers. No login required."
        keywords="gst tools online free, gstin verification, gst calculator, hsn code search, sac code, gst rate finder, ecommerce gst tools india"
        canonicalUrl="https://ecomsathi.vercel.app/tools/gst"
        schema={PAGE_SCHEMA}
      />

      <div className="flex flex-col gap-10">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-[12px] bg-gradient-to-br from-[#1E1B4B] via-[#4C1D95] to-[#7C3AED] px-6 py-10 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#A78BFA]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[#2563EB]/20 blur-3xl" />

          {/* breadcrumb */}
          <nav className="relative mb-5 flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/tools" className="hover:text-white transition-colors">Tools</Link>
            <ChevronRight size={12} />
            <span className="text-white font-medium">GST Tools</span>
          </nav>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            {/* icon */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[16px] bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
              <Receipt size={44} className="text-white" />
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
                <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#C4B5FD] ring-1 ring-[#C4B5FD]/30">
                  CBIC Compliant
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-white sm:text-4xl leading-tight">
                Free GST Tools for<br className="hidden sm:block" />
                <span className="text-[#C4B5FD]"> Ecommerce Sellers</span>
              </h1>
              <p className="mt-3 text-sm text-[#94A3B8] sm:text-base max-w-xl">
                Validate GSTINs, calculate tax, find HSN/SAC codes, verify suppliers and more —
                all free, most tools work fully offline in your browser.
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
              <h2 className="text-xl font-bold text-[#0F172A]">Choose a GST Tool</h2>
              <p className="text-sm text-[#64748B] mt-0.5">{GST_TOOLS.length} free tools — no account needed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GST_TOOLS.map((tool) => {
              const Icon = tool.icon
              const isLive = tool.badge === 'Live Verify'
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
                      {isLive ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                          Live Verify
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                          Offline
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                        Free
                      </span>
                    </div>
                  </div>

                  {/* content */}
                  <h3 className="text-[15px] font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-[13px] text-[#64748B] leading-relaxed flex-1">{tool.desc}</p>

                  {/* example */}
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
            <h2 className="text-lg font-bold text-[#0F172A]">Everything You Need to Handle GST</h2>
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
              { step: '01', title: 'Enter GSTIN',        desc: 'Type any 15-character GSTIN — format validation starts instantly as you type.',          color: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]' },
              { step: '02', title: '6-Step Validation',  desc: 'Length, state code, PAN format, entity number, Z marker and checksum are checked offline.', color: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]' },
              { step: '03', title: 'Verify Live',        desc: 'Click Verify Live to confirm active status directly from the GSTN government portal.',     color: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]' },
              { step: '04', title: 'Get Full Details',   desc: 'Business name, status (Active/Cancelled), registration date, jurisdiction and address.',   color: 'bg-[#FFF1F2] border-[#FECACA] text-[#DC2626]' },
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
        <GSTHubFAQ items={FAQS} />

        {/* ── TRUST FOOTER ─────────────────────────────────── */}
        <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] px-6 py-4 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: <Lock size={14} className="text-[#16A34A]" />,        text: 'No API key exposed' },
            { icon: <CheckCircle2 size={14} className="text-[#2563EB]" />, text: 'No login required' },
            { icon: <Zap size={14} className="text-[#D97706]" />,          text: 'Works offline' },
            { icon: <Download size={14} className="text-[#7C3AED]" />,     text: 'CBIC compliant rates'  },
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
