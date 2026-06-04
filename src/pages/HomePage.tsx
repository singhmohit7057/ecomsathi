import React from 'react';
import { Link } from 'react-router-dom';
import NewsletterSection from '@/components/sections/NewsletterSection';
import {
  Tag, FileText, Image, Video, Scissors, Calculator,
  ArrowRight, Check, Zap, Upload, Download,
  Package, BarChart3, Shield, Clock, Users,
} from 'lucide-react';

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Top gradient strip */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #2563EB, #06B6D4, transparent)' }}
      />

      {/* Background blob */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.04) 50%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="flex flex-col items-center text-center">

          {/* H1 */}
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-[1.12] tracking-tight text-[#0F172A] sm:text-5xl md:text-6xl lg:text-7xl">
            One Place for All Your{' '}
            <span
              className="relative inline-block"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ecommerce
            </span>{' '}
            Needs
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#64748B] md:text-xl">
            50+ free tools for Indian marketplace sellers. Generate SKUs, crop labels,
            process PDFs, edit images, verify GST — all without signup, all for free.
          </p>

          {/* CTAs */}
          <div className="mb-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2.5 rounded-[6px] bg-[#2563EB] px-7 py-3.5 text-base font-bold text-white shadow-[#1E293B_3px_3px_0px_0px] transition-all duration-150 hover:bg-[#1D4ED8] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px] active:translate-y-[2px]"
            >
              Explore Free Tools
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 rounded-[6px] border border-[#E2E8F0] bg-white px-7 py-3.5 text-base font-bold text-[#0F172A] shadow-[#1E293B_2px_2px_0px_0px] transition-all duration-150 hover:bg-[#F8FAFC] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px]"
            >
              Create Free Account
            </Link>
          </div>

          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Shield, text: 'No login for tools' },
              { icon: Zap,    text: '100% free forever' },
              { icon: Clock,  text: 'Process in seconds' },
              { icon: Users,  text: '1,000+ sellers trust us' },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-1.5 text-xs font-semibold text-[#334155]"
              >
                <Icon size={12} className="text-[#2563EB]" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="mt-16 relative mx-auto max-w-4xl">
          {/* Glow behind card */}
          <div
            className="absolute inset-0 -z-10 rounded-2xl opacity-40 blur-2xl"
            style={{ background: 'linear-gradient(135deg, #DBEAFE, #CFFAFE)' }}
          />

          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[#1E293B_6px_6px_0px_0px] overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-[#FCA5A5]" />
              <span className="h-3 w-3 rounded-full bg-[#FDE68A]" />
              <span className="h-3 w-3 rounded-full bg-[#BBF7D0]" />
              <div className="ml-4 flex-1 rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#94A3B8]">
                ecomsathi.vercel.app/tools
              </div>
            </div>

            {/* Tool cards preview */}
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
              {[
                { icon: FileText, label: 'PDF Tools',   count: '12 tools', color: '#2563EB', bg: '#EFF6FF' },
                { icon: Image,    label: 'Image Tools',  count: '12 tools', color: '#16A34A', bg: '#F0FDF4' },
                { icon: Tag,      label: 'SKU Tools',    count: '7 tools',  color: '#7C3AED', bg: '#F5F3FF' },
                { icon: Scissors, label: 'Label Crop',   count: '8 markets', color: '#D97706', bg: '#FFFBEB' },
                { icon: Calculator,label:'GST Tools',    count: '8 tools',  color: '#EA580C', bg: '#FFF7ED' },
                { icon: Video,    label: 'Video Tools',  count: '6 tools',  color: '#E11D48', bg: '#FFF1F2' },
              ].map(({ icon: Icon, label, count, color, bg }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white p-3 hover:border-[#BFDBFE] hover:shadow-[#1E293B_2px_2px_0px_0px] transition-all duration-150 cursor-pointer"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: bg, color }}
                  >
                    <Icon size={20} />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">{label}</div>
                    <div className="text-[10px] text-[#94A3B8]">{count}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-[#64748B] flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                All tools are 100% free
              </span>
              <Link to="/tools" className="text-xs font-semibold text-[#2563EB] hover:underline">
                View all 50+ tools →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <div className="border-y border-[#E2E8F0] bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: '50+',     label: 'Free Tools'           },
            { value: '8',       label: 'Marketplace Support'  },
            { value: '1,000+',  label: 'Indian Sellers'       },
            { value: '100%',    label: 'Free, No Login'       },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-0.5">
              <span className="text-2xl font-bold text-[#2563EB] sm:text-3xl">{value}</span>
              <span className="text-xs font-medium text-[#64748B] sm:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tool Categories ──────────────────────────────────────────────────────────

const CATEGORY_CARDS = [
  {
    icon: Tag,
    title: 'SKU Tools',
    description: 'Generate professional SKUs, barcodes and print-ready labels',
    href: '/tools/sku',
    accent: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    count: '7 tools',
    chips: ['Generator', 'Bulk', 'Barcode', 'Labels'],
  },
  {
    icon: FileText,
    title: 'PDF Tools',
    description: 'Merge, split, compress, watermark and OCR your PDF files',
    href: '/tools/pdf',
    accent: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    count: '12 tools',
    chips: ['Merge', 'Compress', 'OCR', 'Rotate'],
  },
  {
    icon: Image,
    title: 'Image Tools',
    description: 'Remove backgrounds, resize and optimize product images',
    href: '/tools/image',
    accent: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    count: '12 tools',
    chips: ['BG Remover', 'Resize', 'Compress', 'White BG'],
  },
  {
    icon: Video,
    title: 'Video Tools',
    description: 'Convert, compress and extract frames from product videos',
    href: '/tools/video',
    accent: '#E11D48',
    bg: '#FFF1F2',
    border: '#FECDD3',
    count: '6 tools',
    chips: ['To GIF', 'Compress', 'Convert', 'Thumbnail'],
  },
  {
    icon: Scissors,
    title: 'Label Crop',
    description: 'Auto-crop shipping labels for all major Indian marketplaces',
    href: '/label-crop',
    accent: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    count: '8 markets',
    chips: ['Amazon', 'Flipkart', 'Meesho', 'Shopsy'],
  },
  {
    icon: Calculator,
    title: 'GST Tools',
    description: 'Search GSTIN, calculate GST, find HSN codes instantly',
    href: '/tools/gst',
    accent: '#EA580C',
    bg: '#FFF7ED',
    border: '#FED7AA',
    count: '8 tools',
    chips: ['Calculator', 'GSTIN', 'HSN', 'SAC'],
  },
];

function ToolCategories() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-14 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 inline-block rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
              Free Tools
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              Everything You Need
              <br className="hidden sm:block" />
              to Sell Online
            </h2>
          </div>
          <Link
            to="/tools"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            View all 50+ tools <ArrowRight size={15} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.href}
                className="group relative flex flex-col gap-4 rounded-xl border bg-white p-6 transition-all duration-200 hover:shadow-[#1E293B_4px_4px_0px_0px] hover:-translate-y-0.5"
                style={{ borderColor: card.border }}
              >
                {/* Count badge */}
                <span
                  className="absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: card.bg, color: card.accent }}
                >
                  {card.count}
                </span>

                {/* Icon */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: card.bg }}
                >
                  <Icon size={24} style={{ color: card.accent }} />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-[#0F172A]">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">{card.description}</p>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {card.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-medium text-[#475569]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <span
                  className="inline-flex items-center gap-1 text-sm font-semibold transition-all group-hover:gap-2"
                  style={{ color: card.accent }}
                >
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Label Crop Feature ───────────────────────────────────────────────────────

const MARKETPLACES = ['Amazon', 'Flipkart', 'Myntra', 'Meesho', 'AJIO', 'Nykaa', 'Snapdeal', 'Shopsy'];

function LabelCropFeature() {
  return (
    <section className="bg-[#F8FAFC] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[#1E293B_4px_4px_0px_0px]">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Left: text */}
            <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
              <div>
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-3 py-1 text-xs font-semibold text-[#D97706]">
                  <Scissors size={11} />
                  Label Crop — Free
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl lg:text-4xl">
                  Auto-Crop Shipping
                  <br />
                  Labels in Seconds
                </h2>
              </div>

              <p className="text-base leading-relaxed text-[#64748B]">
                Tired of manually cropping shipping labels? EcomSathi automatically detects
                and crops shipping labels from multi-label PDFs — saving hours every week.
              </p>

              {/* Marketplace grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {MARKETPLACES.map((mp) => (
                  <div
                    key={mp}
                    className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2563EB]">
                      <Check size={9} strokeWidth={3} className="text-white" />
                    </span>
                    <span className="text-xs font-semibold text-[#334155]">{mp}</span>
                  </div>
                ))}
              </div>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2">
                {['Thermal output (4×6)', 'A4 output', 'Batch processing', 'Auto-detect'].map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#475569]"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div>
                <Link
                  to="/label-crop"
                  className="inline-flex items-center gap-2 rounded-[6px] bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-[#1E293B_3px_3px_0px_0px] transition-all hover:bg-[#1D4ED8] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px]"
                >
                  Try Label Crop Free
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right: visual */}
            <div
              className="flex items-center justify-center p-8 lg:p-10"
              style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #CFFAFE 100%)' }}
            >
              <div className="w-full max-w-sm">
                {/* Mock UI card */}
                <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[#1E293B_4px_4px_0px_0px]">
                  <div className="border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DBEAFE]">
                      <Scissors size={13} className="text-[#2563EB]" />
                    </div>
                    <span className="text-xs font-bold text-[#0F172A]">Label Crop Tool</span>
                    <span className="ml-auto rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                      Free
                    </span>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    {/* Upload area */}
                    <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[#BFDBFE] bg-[#EFF6FF] py-5">
                      <Upload size={20} className="text-[#2563EB]" />
                      <span className="text-xs font-semibold text-[#2563EB]">Drop PDF here</span>
                      <span className="text-[10px] text-[#64748B]">Amazon • Flipkart • Meesho</span>
                    </div>

                    {/* Progress */}
                    <div className="rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-2.5">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[#334155]">Processing 18/50...</span>
                        <span className="text-[10px] font-bold text-[#2563EB]">36%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#DBEAFE]">
                        <div
                          className="h-full rounded-full bg-[#2563EB]"
                          style={{ width: '36%' }}
                        />
                      </div>
                    </div>

                    {/* Result */}
                    <div className="flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5">
                      <Download size={13} className="text-[#16A34A] shrink-0" />
                      <span className="text-xs font-semibold text-[#15803D]">18 labels ready — Download ZIP</span>
                    </div>
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

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    icon: Zap,
    title: 'Pick a Tool',
    description: 'Browse 50+ free tools by category. No login required.',
    color: '#2563EB',
  },
  {
    number: '02',
    icon: Upload,
    title: 'Upload or Input',
    description: 'Drag & drop files or enter data. We handle PDFs, images, videos and GST.',
    color: '#7C3AED',
  },
  {
    number: '03',
    icon: Download,
    title: 'Download Instantly',
    description: 'Get processed output instantly. No queue, no waiting.',
    color: '#16A34A',
  },
];

function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        <div className="mb-14 text-center">
          <span className="mb-2 inline-block rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#64748B]">
            How it works
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Start in 3 Simple Steps
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-[#64748B]">
            No setup, no account needed — just pick a tool and go
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col gap-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-7 transition-all hover:shadow-[#1E293B_3px_3px_0px_0px] hover:border-[#CBD5E1]"
              >
                {/* Step number — large bg */}
                <span className="absolute right-5 top-4 text-5xl font-black text-[#E2E8F0] select-none leading-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl shadow-[#1E293B_2px_2px_0px_0px]"
                  style={{ background: step.color }}
                >
                  <Icon size={26} className="text-white" />
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-bold text-[#0F172A]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">{step.description}</p>
                </div>

                {/* Connector arrow (desktop only) */}
                {idx < STEPS.length - 1 && (
                  <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-[#E2E8F0] bg-white shadow-sm z-10">
                    <ArrowRight size={14} className="text-[#94A3B8]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA below */}
        <div className="mt-10 text-center">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 rounded-[6px] border border-[#E2E8F0] bg-white px-6 py-2.5 text-sm font-semibold text-[#0F172A] shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#F8FAFC] hover:shadow-[#1E293B_1px_1px_0px_0px]"
          >
            Browse all tools <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Premium Modules ──────────────────────────────────────────────────────────

function PremiumModules() {
  return (
    <section className="bg-[#F8FAFC] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        <div className="mb-14 text-center">
          <span className="mb-2 inline-block rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-3 py-1 text-xs font-semibold text-[#D97706]">
            Premium Modules
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Scale Your Ecommerce Business
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#64748B]">
            Advanced operations software built for serious Indian marketplace sellers
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Reconciliation */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#BFDBFE] bg-white p-8 shadow-[#1E293B_3px_3px_0px_0px] transition-all hover:shadow-[#1E293B_5px_5px_0px_0px] hover:-translate-y-0.5">
            {/* Decorative blob */}
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #BFDBFE, transparent)' }}
            />

            <div className="relative flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB] shadow-[#1E293B_2px_2px_0px_0px]">
                  <BarChart3 size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Reconciliation</h3>
                  <p className="text-xs text-[#64748B]">Amazon · Flipkart · Meesho · Myntra</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#475569]">
                Never miss a rupee. Automatically reconcile your orders, settlements and returns
                across all marketplaces from a single dashboard.
              </p>

              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  'Order reconciliation',
                  'Settlement matching',
                  'Missing payment detection',
                  'Marketplace fee audit',
                  'GST validation',
                  'CSV export reports',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#334155]">
                    <Check size={13} className="shrink-0 text-[#2563EB]" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/reconciliation"
                className="inline-flex w-fit items-center gap-2 rounded-[6px] bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#1D4ED8] hover:shadow-[#1E293B_1px_1px_0px_0px]"
              >
                Explore Reconciliation <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Inventory */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#A5F3FC] bg-white p-8 shadow-[#1E293B_3px_3px_0px_0px] transition-all hover:shadow-[#1E293B_5px_5px_0px_0px] hover:-translate-y-0.5">
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #A5F3FC, transparent)' }}
            />

            <div className="relative flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#06B6D4] shadow-[#1E293B_2px_2px_0px_0px]">
                  <Package size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Inventory Management</h3>
                  <p className="text-xs text-[#64748B]">Multi-warehouse · Multi-channel</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#475569]">
                Keep your stock in check. Manage products across multiple warehouses and channels
                from one intuitive dashboard.
              </p>

              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  'Product master catalogue',
                  'Multi-warehouse support',
                  'Stock movements tracking',
                  'Purchase order management',
                  'Low stock alerts',
                  'Inventory reports',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#334155]">
                    <Check size={13} className="shrink-0 text-[#0891B2]" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/inventory"
                className="inline-flex w-fit items-center gap-2 rounded-[6px] bg-[#06B6D4] px-5 py-2.5 text-sm font-bold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#0891B2] hover:shadow-[#1E293B_1px_1px_0px_0px]"
              >
                Explore Inventory <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Pricing nudge */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-3">
          <span className="text-sm text-[#64748B]">All free tools stay free forever.</span>
          <Link to="/pricing" className="text-sm font-semibold text-[#2563EB] hover:underline">
            View pricing for premium modules →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <ToolCategories />
      <LabelCropFeature />
      <HowItWorks />
      <PremiumModules />
      <NewsletterSection />
    </>
  );
}
