import React from 'react';
import { Link } from 'react-router-dom';
import NewsletterSection from '@/components/sections/NewsletterSection';
import {
  Tag,
  FileText,
  Image,
  Video,
  Scissors,
  Calculator,
  ArrowRight,
  Check,
  Zap,
  Upload,
  Download,
  Play,
  Package,
  BarChart3,
} from 'lucide-react';

// ─── Section 1: Hero ───────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#CFFAFE] py-20 md:py-28">
      {/* Dot-grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #93C5FD 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[55%_45%]">

          {/* ── Left: Text ── */}
          <div>
            {/* Announcement badge */}
            <Link
              to="/inventory"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white/80 px-4 py-1.5 text-sm font-semibold text-[#2563EB] shadow-sm backdrop-blur-sm transition-colors hover:border-[#2563EB]"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#06B6D4]" />
              New: Inventory Management is live →
            </Link>

            {/* H1 */}
            <h1 className="mb-5 text-5xl font-bold leading-tight tracking-tight text-[#0F172A] lg:text-6xl">
              One Place for All Your{' '}
              <span className="relative inline-block text-[#2563EB]">
                Ecommerce
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 300 8"
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 5.5 C50 2, 100 7, 150 4 S250 2, 298 5.5"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>{' '}
              Needs
            </h1>

            {/* Subtitle */}
            <p className="mb-8 text-lg leading-relaxed text-[#475569] md:text-xl">
              50+ free tools for Indian marketplace sellers. Generate SKUs, crop labels,
              process PDFs, edit images, verify GST — all without signup.
            </p>

            {/* CTA row */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-[#2563EB] bg-[#2563EB] px-6 py-3 text-base font-semibold text-white shadow-[#1E293B_4px_4px_0px_0px] transition-all duration-150 hover:bg-[#1D4ED8] hover:shadow-[#1E293B_2px_2px_0px_0px]"
              >
                Explore Free Tools
                <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-[#E2E8F0] bg-white px-6 py-3 text-base font-semibold text-[#0F172A] shadow-[#1E293B_2px_2px_0px_0px] transition-all duration-150 hover:bg-[#F8FAFC] hover:shadow-[#1E293B_1px_1px_0px_0px]"
              >
                <Play size={16} className="text-[#2563EB]" />
                Watch Demo
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-[#475569]">
              {['No credit card', 'No login required', '100% free'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#16A34A]">
                    <Check size={10} strokeWidth={3} className="text-white" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: Tool Preview Card (desktop only) ── */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main preview card */}
              <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-[#1E293B_6px_6px_0px_0px]">
                {/* Card header */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EFF6FF]">
                      <FileText size={16} className="text-[#2563EB]" />
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">PDF Tools</span>
                  </div>
                  <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-semibold text-[#16A34A]">
                    Free
                  </span>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-5 py-4">
                  {[
                    'Merge PDF',
                    'Split PDF',
                    'Compress',
                    'OCR PDF',
                    'Watermark',
                    'PDF → Images',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-[#334155]">
                      <Check size={13} className="shrink-0 text-[#2563EB]" strokeWidth={2.5} />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Card footer */}
                <div className="border-t border-[#E2E8F0] px-5 py-3.5">
                  <Link
                    to="/tools/pdf"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] transition-all hover:gap-2.5"
                  >
                    Open Tool <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Second card — offset behind */}
              <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-lg border border-[#DBEAFE] bg-[#EFF6FF]" />

              {/* Floating stats pill */}
              <div className="absolute -bottom-7 left-4 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-semibold text-[#334155] shadow-[#1E293B_2px_2px_0px_0px]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                2,800+ tools processed today
              </div>

              {/* Decorative card — SKU Tools */}
              <div className="absolute -right-10 top-4 rounded-lg border border-[#F5F3FF] bg-white px-4 py-3 shadow-[#1E293B_3px_3px_0px_0px]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F5F3FF]">
                    <Tag size={13} className="text-[#7C3AED]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">SKU Generator</div>
                    <div className="text-[10px] text-[#64748B]">7 tools available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Tool Categories ────────────────────────────────────────────────

const CATEGORY_CARDS = [
  {
    icon: Tag,
    title: 'SKU Tools',
    description: 'Generate professional SKUs, barcodes and labels for your products',
    href: '/tools/sku',
    bg: 'bg-[#F5F3FF]',
    border: 'border-[#DDD6FE]',
    iconBg: 'bg-[#7C3AED]',
    linkColor: 'text-[#7C3AED]',
    count: '7 tools',
    sub: 'Generator · Bulk · Barcode',
  },
  {
    icon: FileText,
    title: 'PDF Tools',
    description: 'Merge, split, compress, watermark and OCR your PDF files',
    href: '/tools/pdf',
    bg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    iconBg: 'bg-[#2563EB]',
    linkColor: 'text-[#2563EB]',
    count: '13 tools',
    sub: 'Merge · Compress · OCR',
  },
  {
    icon: Image,
    title: 'Image Tools',
    description: 'Remove backgrounds, resize and compress product images',
    href: '/tools/image',
    bg: 'bg-[#F0FDF4]',
    border: 'border-[#BBF7D0]',
    iconBg: 'bg-[#16A34A]',
    linkColor: 'text-[#16A34A]',
    count: '11 tools',
    sub: 'BG Remover · Resize · Compress',
  },
  {
    icon: Video,
    title: 'Video Tools',
    description: 'Convert, compress and extract frames from your product videos',
    href: '/tools/video',
    bg: 'bg-[#FFF1F2]',
    border: 'border-[#FECDD3]',
    iconBg: 'bg-[#E11D48]',
    linkColor: 'text-[#E11D48]',
    count: '6 tools',
    sub: 'To GIF · Compress · Convert',
  },
  {
    icon: Scissors,
    title: 'Label Crop',
    description: 'Auto-crop shipping labels for all major Indian marketplaces',
    href: '/label-crop',
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    iconBg: 'bg-[#D97706]',
    linkColor: 'text-[#D97706]',
    count: '7 markets',
    sub: 'Amazon · Flipkart · Meesho',
  },
  {
    icon: Calculator,
    title: 'GST Tools',
    description: 'Search GSTIN, calculate GST, find HSN codes instantly',
    href: '/tools/gst',
    bg: 'bg-[#FFF7ED]',
    border: 'border-[#FED7AA]',
    iconBg: 'bg-[#EA580C]',
    linkColor: 'text-[#EA580C]',
    count: '10 tools',
    sub: 'Calculator · GSTIN · HSN',
  },
];

function ToolCategories() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Everything You Need to Sell Online
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B] md:text-lg">
            50+ free tools purpose-built for Indian ecommerce sellers
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`group relative flex flex-col gap-4 rounded-lg border ${card.border} ${card.bg} p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-[#1E293B_4px_4px_0px_0px]`}
              >
                {/* Tool count badge */}
                <span className="absolute right-4 top-4 rounded-full border border-current bg-white/70 px-2.5 py-0.5 text-xs font-semibold opacity-70">
                  {card.count}
                </span>

                {/* Icon */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <Icon size={22} strokeWidth={2} className="text-white" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-1.5">
                  <h3 className="text-base font-bold text-[#0F172A]">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">{card.description}</p>
                </div>

                {/* Sub-tools chips */}
                <div className="flex flex-wrap gap-1.5">
                  {card.sub.split(' · ').map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[#E2E8F0] bg-white/80 px-2.5 py-0.5 text-xs font-medium text-[#475569]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Explore link */}
                <Link
                  to={card.href}
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${card.linkColor} transition-all hover:gap-2`}
                >
                  Explore <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* View all */}
        <div className="mt-10 text-center">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
          >
            View all 50+ free tools <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Section 4: Label Crop Feature ────────────────────────────────────────────

const MARKETPLACES = ['Amazon', 'Flipkart', 'Myntra', 'Meesho', 'AJIO', 'Nykaa', 'Snapdeal'];

function LabelCropFeature() {
  return (
    <section className="bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#CFFAFE] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* ── Left: Text ── */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white/70 px-3 py-1 text-xs font-semibold text-[#2563EB]">
              <Scissors size={12} />
              Shipping Label Tool — Free
            </div>

            <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              Auto-Crop Shipping Labels in Seconds
            </h2>
            <p className="mb-6 text-base leading-relaxed text-[#475569]">
              Tired of manually cropping shipping labels? EcomSathi automatically detects and
              crops shipping labels from multi-label PDFs — saving hours every day. Supports
              all major Indian marketplaces.
            </p>

            {/* Marketplace checklist */}
            <ul className="mb-6 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {MARKETPLACES.map((mp) => (
                <li key={mp} className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563EB]">
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </span>
                  {mp}
                </li>
              ))}
            </ul>

            {/* Feature tags */}
            <div className="mb-8 flex flex-wrap gap-2">
              {['Thermal output (4×6)', 'A4 output (4-up)', 'Batch processing', 'Auto-detection'].map(
                (f) => (
                  <span
                    key={f}
                    className="rounded-full border border-[#BFDBFE] bg-white/70 px-3 py-1 text-xs font-medium text-[#334155]"
                  >
                    {f}
                  </span>
                )
              )}
            </div>

            <Link
              to="/label-crop"
              className="inline-flex items-center gap-2 rounded-[4px] border border-[#2563EB] bg-[#2563EB] px-6 py-3 text-base font-semibold text-white shadow-[#1E293B_4px_4px_0px_0px] transition-all duration-150 hover:bg-[#1D4ED8] hover:shadow-[#1E293B_2px_2px_0px_0px]"
            >
              Try Label Crop Free
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* ── Right: Mockup card ── */}
          <div>
            <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[#1E293B_6px_6px_0px_0px]">
              {/* Card header */}
              <div className="border-b border-[#E2E8F0] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DBEAFE]">
                    <Scissors size={15} className="text-[#2563EB]" />
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">Select your marketplace</span>
                </div>
              </div>

              {/* Marketplace grid */}
              <div className="grid grid-cols-2 gap-3 p-5">
                {MARKETPLACES.map((mp) => (
                  <div
                    key={mp}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#334155] transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF]"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#06B6D4]">
                      <Check size={9} strokeWidth={3} className="text-white" />
                    </span>
                    {mp}
                  </div>
                ))}
              </div>

              {/* Progress mockup */}
              <div className="mx-5 mb-3 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#334155]">
                  <span>Processing 3/50 labels...</span>
                  <span className="font-semibold text-[#2563EB]">6%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#DBEAFE]">
                  <div className="h-full w-[6%] rounded-full bg-[#2563EB]" />
                </div>
              </div>

              {/* Output row */}
              <div className="mx-5 mb-5 flex items-center justify-between rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5">
                <span className="text-xs font-semibold text-[#15803D]">
                  ✓ 3 labels ready · Download ZIP
                </span>
                <Download size={14} className="text-[#16A34A]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 5: How It Works ───────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    icon: Zap,
    title: 'Choose Your Tool',
    description:
      'Browse 50+ free tools by category or search for what you need. No login required for most tools.',
  },
  {
    number: '02',
    icon: Upload,
    title: 'Upload or Input',
    description:
      'Drag & drop your files or enter data directly. Our tools handle PDFs, images, videos and text.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Download Results',
    description:
      'Get your processed output instantly. Download individually or as a ZIP — no waiting, no queue.',
  },
];

function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B]">
            Start using EcomSathi in seconds — no setup required
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* Dashed connector line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-8 hidden h-px w-full md:block"
            style={{
              background:
                'repeating-linear-gradient(to right, #BFDBFE 0, #BFDBFE 8px, transparent 8px, transparent 16px)',
            }}
          />

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Step number (muted, behind icon) */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-5xl font-black leading-none text-[#E2E8F0] select-none">
                  {step.number}
                </span>

                {/* Icon circle */}
                <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#2563EB] shadow-[#1E293B_4px_4px_0px_0px]">
                  <Icon size={26} className="text-white" />
                </div>

                <h3 className="mb-2 text-lg font-bold text-[#0F172A]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{step.description}</p>

                {/* Arrow between steps on desktop */}
                {idx < STEPS.length - 1 && (
                  <ArrowRight
                    size={20}
                    className="absolute -right-5 top-7 hidden text-[#93C5FD] md:block"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: Premium Modules ────────────────────────────────────────────────

const RECON_FEATURES = [
  'Order tracking & reconciliation',
  'Settlement matching',
  'Missing payment detection',
  'Marketplace fee audit',
  'GST validation on orders',
];

const INVENTORY_FEATURES = [
  'Product master catalogue',
  'Multi-warehouse support',
  'Stock movements tracking',
  'Purchase order management',
  'Low stock alerts & reports',
];

function PremiumModules() {
  return (
    <section className="bg-[#F8FAFC] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Premium Ecommerce Operations
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B] md:text-lg">
            Advanced tools to run your ecommerce business at scale
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          {/* Card 1 — Reconciliation */}
          <div className="relative flex flex-col overflow-hidden rounded-xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] p-8 shadow-[#1E293B_4px_4px_0px_0px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#BFDBFE]/40"
            />

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB]">
              <BarChart3 size={22} className="text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#0F172A]">Ecommerce Reconciliation</h3>
            <p className="mb-5 text-sm leading-relaxed text-[#475569]">
              Never miss a rupee. Automatically reconcile your orders, settlements, and returns
              across all marketplaces from a single dashboard.
            </p>
            <ul className="mb-7 flex-1 space-y-2.5">
              {RECON_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#334155]">
                  <Check size={14} className="shrink-0 text-[#2563EB]" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/reconciliation"
              className="inline-flex w-fit items-center gap-2 rounded-[4px] border border-[#2563EB] bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#1D4ED8] hover:shadow-[#1E293B_1px_1px_0px_0px]"
            >
              Get Started <ArrowRight size={15} />
            </Link>
          </div>

          {/* Card 2 — Inventory */}
          <div className="relative flex flex-col overflow-hidden rounded-xl border border-[#A5F3FC] bg-gradient-to-br from-[#ECFEFF] to-[#CFFAFE] p-8 shadow-[#1E293B_4px_4px_0px_0px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#A5F3FC]/40"
            />

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]">
              <Package size={22} className="text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#0F172A]">Inventory Management</h3>
            <p className="mb-5 text-sm leading-relaxed text-[#475569]">
              Keep your stock in check. Manage products across multiple warehouses and channels
              from a single, intuitive dashboard.
            </p>
            <ul className="mb-7 flex-1 space-y-2.5">
              {INVENTORY_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#334155]">
                  <Check size={14} className="shrink-0 text-[#0891B2]" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/inventory"
              className="inline-flex w-fit items-center gap-2 rounded-[4px] border border-[#06B6D4] bg-[#06B6D4] px-5 py-2.5 text-sm font-semibold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#0891B2] hover:shadow-[#1E293B_1px_1px_0px_0px]"
            >
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 8: Final CTA ──────────────────────────────────────────────────────

// ─── Page Export ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ToolCategories />
      <LabelCropFeature />
      <HowItWorks />
      <PremiumModules />
      <NewsletterSection />
    </>
  );
}
