import React from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

// ─── Hero Section ──────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#CFFAFE] py-20 md:py-28">
      {/* Subtle dot-grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle, #94A3B8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Brand pill */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white/70 px-4 py-1.5 text-sm font-semibold text-[#2563EB] shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#06B6D4]" />
            EcomSathi — India&apos;s Ecommerce Toolkit
          </div>

          {/* Main headline */}
          <h1
            className="mb-5 text-5xl font-bold leading-tight text-[#0F172A] md:text-6xl"
            style={{ letterSpacing: '-1.152px' }}
          >
            One Place for All Your{' '}
            <span className="text-[#2563EB]">Ecommerce Needs</span>
          </h1>

          {/* Sub-headline */}
          <p className="mb-8 text-lg leading-relaxed text-[#475569] md:text-xl">
            Free ecommerce tools for sellers. Generate SKUs, crop labels, process PDFs,
            edit images, convert videos, verify GST details and manage ecommerce
            operations — all in one place with{' '}
            <span className="font-semibold text-[#2563EB]">EcomSathi</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-[4px] border border-[#2563EB] bg-[#2563EB] px-6 py-3 text-base font-semibold text-white shadow-[#1E293B_3px_3px_0px_0px] transition-all duration-150 hover:bg-[#1D4ED8] hover:shadow-[#1E293B_1px_1px_0px_0px]"
            >
              Explore Free Tools
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-[4px] border border-[#E2E8F0] bg-white px-6 py-3 text-base font-semibold text-[#0F172A] shadow-[#1E293B_2px_2px_0px_0px] transition-all duration-150 hover:bg-[#F8FAFC] hover:shadow-[#1E293B_1px_1px_0px_0px]"
            >
              Get Started Free
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            {[
              { value: '10+', label: 'Tool Categories' },
              { value: '50+', label: 'Free Tools' },
              { value: '100%', label: 'Indian Sellers First' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <span className="text-3xl font-bold text-[#2563EB]">{stat.value}</span>
                <span className="text-sm font-medium text-[#64748B]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Tools Showcase ────────────────────────────────────────────────────────────

const TOOL_CARDS = [
  {
    icon: Tag,
    title: 'SKU Tools',
    description: 'Generate professional SKUs, barcodes and labels',
    href: '/tools/sku',
    bg: 'bg-[#EFF6FF]',
    iconBg: 'bg-[#DBEAFE]',
    iconColor: 'text-[#2563EB]',
  },
  {
    icon: FileText,
    title: 'PDF Tools',
    description: 'Merge, split, compress and OCR your PDFs',
    href: '/tools/pdf',
    bg: 'bg-[#F0FDFF]',
    iconBg: 'bg-[#CFFAFE]',
    iconColor: 'text-[#0891B2]',
  },
  {
    icon: Image,
    title: 'Image Tools',
    description: 'Remove backgrounds, resize, compress product images',
    href: '/tools/image',
    bg: 'bg-[#F0FDF4]',
    iconBg: 'bg-[#DCFCE7]',
    iconColor: 'text-[#16A34A]',
  },
  {
    icon: Video,
    title: 'Video Tools',
    description: 'Convert, compress and extract frames from videos',
    href: '/tools/video',
    bg: 'bg-[#FFF1F2]',
    iconBg: 'bg-[#FFE4E6]',
    iconColor: 'text-[#E11D48]',
  },
  {
    icon: Scissors,
    title: 'Label Crop',
    description: 'Auto-crop shipping labels for 7 marketplaces',
    href: '/tools/label-crop',
    bg: 'bg-[#FFFBEB]',
    iconBg: 'bg-[#FEF3C7]',
    iconColor: 'text-[#D97706]',
  },
  {
    icon: Calculator,
    title: 'GST Tools',
    description: 'Search GSTIN, calculate GST, find HSN codes',
    href: '/tools/gst',
    bg: 'bg-[#EFF6FF]',
    iconBg: 'bg-[#DBEAFE]',
    iconColor: 'text-[#2563EB]',
  },
];

function ToolsShowcase() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#0F172A] md:text-4xl">
            Everything You Need to Sell Online
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B] md:text-lg">
            50+ free tools purpose-built for Indian ecommerce sellers
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`group flex flex-col gap-4 rounded-lg border border-[#E2E8F0] ${card.bg} p-6 shadow-[#E2E8F0_2px_2px_0px_0px] transition-all duration-150 hover:shadow-[#1E293B_3px_3px_0px_0px]`}
              >
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-1.5">
                  <h3 className="text-base font-semibold text-[#0F172A]">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">{card.description}</p>
                </div>

                {/* Link */}
                <Link
                  to={card.href}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] transition-all hover:gap-2"
                >
                  Try Free <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* View all CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 rounded-[4px] border border-[#2563EB] bg-[#EFF6FF] px-6 py-2.5 text-sm font-semibold text-[#2563EB] transition-all hover:bg-[#DBEAFE]"
          >
            View All 50+ Tools <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Label Crop Feature ────────────────────────────────────────────────────────

const MARKETPLACES = [
  'Amazon',
  'Flipkart',
  'Myntra',
  'Meesho',
  'AJIO',
  'Nykaa',
  'Snapdeal',
];

function LabelCropFeature() {
  return (
    <section className="bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#CFFAFE] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left — text */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white/70 px-3 py-1 text-xs font-semibold text-[#2563EB]">
              <Scissors size={12} />
              Label Crop Tool
            </div>
            <h2
              className="mb-4 text-3xl font-bold text-[#0F172A] md:text-4xl"
              style={{ letterSpacing: '-0.5px' }}
            >
              Auto-Crop Labels for Every Marketplace
            </h2>
            <p className="mb-6 text-base leading-relaxed text-[#475569]">
              Tired of manually cropping shipping labels? EcomSathi automatically detects
              and crops shipping labels from multi-label PDFs — saving hours every day.
              Supports all major Indian marketplaces.
            </p>

            {/* Marketplace checklist */}
            <ul className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {MARKETPLACES.map((mp) => (
                <li key={mp} className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {mp}
                </li>
              ))}
            </ul>

            <Link
              to="/tools/label-crop"
              className="inline-flex items-center gap-2 rounded-[4px] border border-[#2563EB] bg-[#2563EB] px-6 py-3 text-base font-semibold text-white shadow-[#1E293B_3px_3px_0px_0px] transition-all duration-150 hover:bg-[#1D4ED8] hover:shadow-[#1E293B_1px_1px_0px_0px]"
            >
              Try Label Crop Free
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Right — visual card */}
          <div className="relative">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[#1E293B_6px_6px_0px_0px]">
              <div className="mb-4 flex items-center gap-2 border-b border-[#E2E8F0] pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DBEAFE]">
                  <Scissors size={16} className="text-[#2563EB]" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">Label Crop — Marketplace Support</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {MARKETPLACES.map((mp) => (
                  <div
                    key={mp}
                    className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#06B6D4]">
                      <Check size={10} strokeWidth={3} className="text-white" />
                    </span>
                    <span className="text-xs font-semibold text-[#0F172A]">{mp}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] p-3 text-center text-sm font-medium text-[#2563EB]">
                Upload multi-label PDF → Get cropped labels instantly
              </div>
            </div>

            {/* Decorative badge */}
            <div className="absolute -right-3 -top-3 rounded-full border-2 border-white bg-[#2563EB] px-3 py-1 text-xs font-bold text-white shadow-md">
              100% Free
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Premium Modules ───────────────────────────────────────────────────────────

const RECON_FEATURES = [
  'Order tracking & reconciliation',
  'Settlement matching',
  'Missing payment detection',
  'Marketplace fee audit',
  'GST validation',
];

const INVENTORY_FEATURES = [
  'Product master catalogue',
  'Multi-warehouse support',
  'Stock movements tracking',
  'Purchase order management',
  'Low stock alerts',
];

function PremiumModules() {
  return (
    <section className="bg-[#F8FAFC] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#0F172A] md:text-4xl">
            Premium Operations Software
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B] md:text-lg">
            Take your ecommerce business to the next level
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Reconciliation card */}
          <div className="relative overflow-hidden rounded-xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] p-8 shadow-[#1E293B_4px_4px_0px_0px]">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB]">
              <FileText size={24} className="text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#0F172A]">Ecommerce Reconciliation</h3>
            <p className="mb-5 text-sm leading-relaxed text-[#475569]">
              Never miss a rupee. Automatically reconcile your orders, settlements, and
              returns across all marketplaces.
            </p>
            <ul className="mb-6 space-y-2">
              {RECON_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#334155]">
                  <Check size={14} className="text-[#2563EB]" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/reconciliation"
              className="inline-flex items-center gap-2 rounded-[4px] border border-[#2563EB] bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#1D4ED8]"
            >
              Learn More <ArrowRight size={15} />
            </Link>

            {/* Decorative circle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#BFDBFE]/40"
            />
          </div>

          {/* Inventory card */}
          <div className="relative overflow-hidden rounded-xl border border-[#A5F3FC] bg-gradient-to-br from-[#ECFEFF] to-[#CFFAFE] p-8 shadow-[#1E293B_4px_4px_0px_0px]">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#06B6D4]">
              <Tag size={24} className="text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#0F172A]">Inventory Management</h3>
            <p className="mb-5 text-sm leading-relaxed text-[#475569]">
              Keep your stock in check. Manage products across multiple warehouses and
              channels from a single dashboard.
            </p>
            <ul className="mb-6 space-y-2">
              {INVENTORY_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#334155]">
                  <Check size={14} className="text-[#0891B2]" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-[4px] border border-[#06B6D4] bg-[#06B6D4] px-5 py-2.5 text-sm font-semibold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#0891B2]"
            >
              Learn More <ArrowRight size={15} />
            </Link>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#A5F3FC]/40"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────

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
      'Get your processed output instantly. Download individually or as a zip — no waiting, no queue.',
  },
];

function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#0F172A] md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B]">
            Start using EcomSathi in seconds — no setup required
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connector line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-10 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-[#DBEAFE] via-[#06B6D4] to-[#DBEAFE] md:block"
            style={{ width: 'calc(100% - 120px)', left: '60px' }}
          />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Number + icon */}
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#DBEAFE] bg-white shadow-[#E2E8F0_3px_3px_0px_0px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB]">
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
                    {step.number.replace('0', '')}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0F172A]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Marketplace Badges ────────────────────────────────────────────────────────

function MarketplaceBadges() {
  return (
    <section className="border-y border-[#E2E8F0] bg-[#F8FAFC] py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 md:flex-row md:justify-center">
          <span className="whitespace-nowrap text-sm font-semibold text-[#64748B]">
            Built for sellers on:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {MARKETPLACES.map((mp) => (
              <span
                key={mp}
                className="rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-sm font-semibold text-[#334155] shadow-[#E2E8F0_1px_1px_0px_0px]"
              >
                {mp}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0891B2] py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          Start Using EcomSathi Today — It&apos;s Free
        </h2>
        <p className="mb-8 text-base text-blue-100">
          No credit card required. All free tools, no login needed.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-[4px] border-2 border-white bg-white px-7 py-3 text-base font-bold text-[#2563EB] shadow-[#1E293B_3px_3px_0px_0px] transition-all hover:bg-blue-50 hover:shadow-[#1E293B_1px_1px_0px_0px]"
        >
          Get Started Free
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

// ─── Page export ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ToolsShowcase />
      <LabelCropFeature />
      <PremiumModules />
      <HowItWorks />
      <MarketplaceBadges />
      <CtaSection />
    </>
  );
}
