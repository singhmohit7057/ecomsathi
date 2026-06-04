import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Globe, Users, ArrowRight, Check,
  Tag, FileText, Image, Video, Scissors, Calculator,
  Zap, Shield, TrendingUp, Target, Lightbulb, Star,
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '50+',    label: 'Free Tools'          },
  { value: '8',      label: 'Marketplace Support' },
  { value: '1,000+', label: 'Sellers Trust Us'    },
  { value: '100%',   label: 'Free Forever'        },
];

const VALUES = [
  {
    icon: Heart,
    color: '#E11D48',
    bg: '#FFF1F2',
    border: '#FECDD3',
    title: 'Built with Empathy',
    desc: 'Every tool is designed by people who understand the daily grind of Indian ecommerce sellers — from label printing at midnight to reconciling marketplace settlements.',
  },
  {
    icon: Shield,
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    title: 'Privacy First',
    desc: 'Most tools process files entirely in your browser — nothing is uploaded to our servers. Your business data stays yours, always.',
  },
  {
    icon: Zap,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    title: 'Instant & Free',
    desc: 'No trials, no credit cards, no hidden limits. All 50+ free tools work instantly — just open and use, no account required.',
  },
  {
    icon: TrendingUp,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    title: 'Made for Scale',
    desc: 'Whether you ship 10 orders or 10,000, EcomSathi scales with you. Batch processing, bulk CSV exports and multi-warehouse inventory are built in.',
  },
  {
    icon: Globe,
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    title: 'India-First',
    desc: 'HSN codes, GSTIN validation, GST slabs, marketplace label formats for Amazon India, Flipkart, Meesho and Myntra — built specifically for the Indian market.',
  },
  {
    icon: Users,
    color: '#0891B2',
    bg: '#ECFEFF',
    border: '#A5F3FC',
    title: 'Community Driven',
    desc: 'Our roadmap is shaped by seller feedback. If you need a tool, tell us — we\'ve shipped features within days of requests from our community.',
  },
];

const TOOLS_OVERVIEW = [
  { icon: Tag,        label: 'SKU Tools',   count: '7 tools',  color: '#7C3AED', bg: '#F5F3FF', href: '/tools/sku'   },
  { icon: FileText,   label: 'PDF Tools',   count: '12 tools', color: '#2563EB', bg: '#EFF6FF', href: '/tools/pdf'   },
  { icon: Image,      label: 'Image Tools', count: '12 tools', color: '#16A34A', bg: '#F0FDF4', href: '/tools/image' },
  { icon: Video,      label: 'Video Tools', count: '6 tools',  color: '#E11D48', bg: '#FFF1F2', href: '/tools/video' },
  { icon: Scissors,   label: 'Label Crop',  count: '8 markets',color: '#D97706', bg: '#FFFBEB', href: '/label-crop'  },
  { icon: Calculator, label: 'GST Tools',   count: '8 tools',  color: '#EA580C', bg: '#FFF7ED', href: '/tools/gst'   },
];

const TIMELINE = [
  {
    year: '2023',
    icon: Lightbulb,
    color: '#D97706',
    bg: '#FFFBEB',
    title: 'The Idea',
    desc: 'Founded after seeing Indian sellers waste hours on manual label cropping, SKU generation, and marketplace reconciliation — tasks that should take seconds.',
  },
  {
    year: '2024',
    icon: Zap,
    color: '#2563EB',
    bg: '#EFF6FF',
    title: 'Free Tools Launch',
    desc: 'Launched 50+ free tools covering PDF, image, video, GST, SKU and label crop. No login required for any of them.',
  },
  {
    year: '2025',
    icon: TrendingUp,
    color: '#16A34A',
    bg: '#F0FDF4',
    title: 'Premium Modules',
    desc: 'Launched Reconciliation and Inventory Management for sellers who need serious operations software alongside the free tools.',
  },
  {
    year: '2026',
    icon: Star,
    color: '#7C3AED',
    bg: '#F5F3FF',
    title: 'Growing Together',
    desc: '1,000+ sellers on the platform. Shopsy added. More marketplace integrations and a mobile app in the works.',
  },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-14 pb-20">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.04) 50%, transparent 100%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #6366F1, #06B6D4, transparent)' }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">

          {/* Left — text + stats */}
          <div className="flex flex-col items-start">
            <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
              We Build Tools Indian{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366F1, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Sellers Actually Need
              </span>
            </h1>

            <p className="mb-8 text-base leading-relaxed text-[#64748B] sm:text-lg">
              EcomSathi is a free toolkit for Indian marketplace sellers — built by people who understand the daily challenges of selling on Amazon, Flipkart, Meesho and Myntra.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 w-full sm:grid-cols-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white px-3 py-4 shadow-sm text-center">
                  <span className="text-xl font-bold text-[#6366F1] sm:text-2xl">{value}</span>
                  <span className="text-[10px] font-medium text-[#64748B] sm:text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — product card mockup */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="relative w-full max-w-sm rounded-2xl p-5 shadow-[#1E293B_4px_4px_0px_0px]"
              style={{ background: 'linear-gradient(135deg, #E0E7FF 0%, #CFFAFE 100%)', border: '1px solid #C7D2FE' }}
            >
              {/* Made in India badge */}
              <div
                className="absolute -top-3 -right-3 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #6366F1, #06B6D4)' }}
              >
                Made in India 🇮🇳
              </div>

              {/* Card header */}
              <div className="mb-4 flex items-center gap-3">
                {/* ES logo — inline SVG, always visible */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <defs>
                    <linearGradient id="aboutHeroGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6366F1"/>
                      <stop offset="100%" stopColor="#06B6D4"/>
                    </linearGradient>
                  </defs>
                  <rect width="48" height="48" rx="12" fill="url(#aboutHeroGrad)"/>
                  <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
                    fontSize="16" fontWeight="900" fontFamily="Inter, system-ui, sans-serif" fill="white">
                    ES
                  </text>
                </svg>
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-20 rounded-full bg-[#94A3B8]/40" />
                  <div className="h-2 w-12 rounded-full bg-[#94A3B8]/25" />
                </div>
              </div>

              {/* Skeleton bars */}
              <div className="mb-4 flex flex-col gap-2">
                <div className="h-2.5 w-full rounded-full bg-[#6366F1]/20" />
                <div className="h-2.5 w-4/5 rounded-full bg-[#06B6D4]/25" />
                <div className="h-2.5 w-3/5 rounded-full bg-[#16A34A]/20" />
                <div className="h-2.5 w-2/3 rounded-full bg-[#D97706]/20" />
              </div>

              {/* Tool category chips */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'SKU',  color: '#7C3AED', bg: 'white' },
                  { label: 'PDF',  color: '#2563EB', bg: 'white' },
                  { label: 'GST',  color: '#D97706', bg: 'white' },
                  { label: 'IMG',  color: '#16A34A', bg: 'white' },
                  { label: 'VID',  color: '#E11D48', bg: 'white' },
                  { label: 'LBL',  color: '#EA580C', bg: 'white' },
                ].map(({ label, color, bg }) => (
                  <div
                    key={label}
                    className="flex items-center justify-center rounded-lg border border-[#E2E8F0] py-2.5 text-xs font-bold shadow-sm"
                    style={{ background: bg, color }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section className="bg-[#F8FAFC] py-14 sm:py-20 border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">

          {/* Left — text */}
          <div>
            <span className="mb-3 inline-block rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-1 text-xs font-semibold text-[#7C3AED]">
              Our Mission
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              Level the playing field for every Indian seller
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#64748B]">
              Large brands have dedicated operations teams handling SKU management, label printing, reconciliation and inventory. Independent sellers doing the same work alone — often without the right tools.
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#64748B]">
              EcomSathi exists to change that. We believe every seller — whether shipping 10 orders or 10,000 — deserves professional-grade tools that are fast, free and built for the Indian market.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                'No login required for free tools',
                'Built for Indian GST, HSN codes and marketplace formats',
                'Files processed in your browser — never stored on our servers',
                'Honest pricing — free stays free, forever',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#334155]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6366F1]">
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — visual card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[#1E293B_4px_4px_0px_0px]">
            <div className="mb-5 flex items-center gap-3 border-b border-[#F1F5F9] pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F3FF]">
                <Target size={22} className="text-[#7C3AED]" />
              </div>
              <div>
                <p className="font-bold text-[#0F172A]">Our Goal</p>
                <p className="text-xs text-[#64748B]">EcomSathi in numbers</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Free tools',         value: '50+',      color: '#6366F1' },
                { label: 'Marketplaces',        value: '8',        color: '#0891B2' },
                { label: 'No login tools',      value: '100%',     color: '#16A34A' },
                { label: 'Browser-only tools',  value: '40+',      color: '#D97706' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                  <p className="text-xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-xs text-[#64748B]">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] px-4 py-3 text-sm text-[#7C3AED] font-medium text-center">
              Part of TMMT — built for Indian commerce 🇮🇳
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Values() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-2 inline-block rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#64748B]">
            What we stand for
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">Our Values</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#64748B]">
            Every decision we make at EcomSathi comes back to these principles
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-xl border bg-white p-5 sm:p-6 transition-all hover:-translate-y-0.5 hover:shadow-[#1E293B_3px_3px_0px_0px]"
              style={{ borderColor: border }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: bg }}>
                <Icon size={24} style={{ color }} />
              </div>
              <div>
                <h3 className="mb-1.5 text-base font-bold text-[#0F172A]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolsGrid() {
  return (
    <section className="bg-[#F8FAFC] py-14 sm:py-20 border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 inline-block rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
              What we offer
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">50+ Free Tools</h2>
            <p className="mt-1 text-base text-[#64748B]">All free, all in your browser</p>
          </div>
          <Link
            to="/tools"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            Browse all tools <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TOOLS_OVERVIEW.map(({ icon: Icon, label, count, color, bg, href }) => (
            <Link
              key={href}
              to={href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 text-center transition-all hover:border-[#CBD5E1] hover:shadow-[#1E293B_2px_2px_0px_0px] hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: bg }}>
                <Icon size={24} style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">{label}</p>
                <p className="text-xs text-[#94A3B8]">{count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-2 inline-block rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#64748B]">
            Our journey
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">How We Got Here</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map(({ year, icon: Icon, color, bg, title, desc }) => (
            <div
              key={year}
              className="relative flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 hover:shadow-[#1E293B_3px_3px_0px_0px] hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: bg }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <span className="text-sm font-bold" style={{ color }}>{year}</span>
              </div>
              <div>
                <h3 className="mb-1.5 text-base font-bold text-[#0F172A]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-[#F8FAFC] py-14 sm:py-20 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[#1E293B_4px_4px_0px_0px]">
          <div
            className="px-6 py-12 sm:px-8 sm:py-14 text-center relative overflow-hidden"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,102,241,0.06) 0%, transparent 70%)' }}
          >
            <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #6366F1, #06B6D4)' }} />
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              Ready to try EcomSathi?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-base text-[#64748B]">
              Start with our free tools — no account needed. Create one when you're ready for premium features.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 rounded-[6px] bg-[#6366F1] px-7 py-3.5 text-sm font-bold text-white shadow-[#1E293B_3px_3px_0px_0px] transition-all hover:bg-[#4F46E5] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px]"
              >
                Explore Free Tools <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-[6px] border border-[#E2E8F0] bg-white px-7 py-3.5 text-sm font-bold text-[#0F172A] shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#F8FAFC] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px]"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Our Story + Founder ─────────────────────────────────────────────────────

function OurStory() {
  return (
    <section className="bg-white py-14 sm:py-20 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-10 text-center">
          <span className="mb-2 inline-block rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-1 text-xs font-semibold text-[#7C3AED]">
            Our Story
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Built by a Real Seller, for Real Sellers
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#64748B]">
            EcomSathi didn't start in a boardroom. It started with a seller frustrated by tools that simply didn't exist.
          </p>
        </div>

        {/* Story + Founder card */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] items-stretch">

          {/* Left — story text */}
          <div className="flex flex-col gap-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-7 sm:p-8 h-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3FF]">
              <Heart size={20} className="text-[#7C3AED]" />
            </div>

            <blockquote className="text-lg font-semibold text-[#0F172A] leading-relaxed border-l-4 border-[#6366F1] pl-4">
              "I was selling on Amazon and Flipkart, spending 2+ hours every day just cropping shipping labels and generating SKUs manually. I looked for tools — nothing built for India existed. So I built them myself."
            </blockquote>

            <div className="flex flex-col gap-3 text-sm leading-relaxed text-[#64748B]">
              <p>
                EcomSathi started as a personal side project — a simple label crop tool built out of frustration. Within weeks, other sellers in the community were asking for the same thing. That one tool became two, then ten, then fifty.
              </p>
              <p>
                Today EcomSathi is used by 1,000+ Indian marketplace sellers every day. Every tool on the platform was built because a real seller needed it — no feature is added for the sake of it.
              </p>
              <p>
                The mission remains the same: give every independent Indian seller access to the same quality tools that large brands use — for free, forever.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {[
                '🏷️ Started with Label Crop',
                '📦 50+ tools built',
                '🇮🇳 India-first always',
                '❤️ Free forever',
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#DDD6FE] bg-white px-3 py-1 text-xs font-medium text-[#334155]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right — founder card */}
          <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[#1E293B_3px_3px_0px_0px] h-full">
            {/* Gradient top strip */}
            <div
              className="h-[5px] w-full"
              style={{ background: 'linear-gradient(90deg, #6366F1, #06B6D4)' }}
            />

            <div className="p-7">
              {/* Avatar */}
              <div className="mb-5 flex items-center gap-4">
                <div className="relative">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="avatarGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#6366F1"/>
                        <stop offset="100%" stopColor="#06B6D4"/>
                      </linearGradient>
                    </defs>
                    <rect width="64" height="64" rx="16" fill="url(#avatarGrad)"/>
                    <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
                      fontSize="22" fontWeight="800" fontFamily="Inter, system-ui, sans-serif" fill="white">
                      MS
                    </text>
                  </svg>
                  {/* Online indicator */}
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#16A34A]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Mohit Singh</h3>
                  <p className="text-sm text-[#64748B]">Founder, EcomSathi</p>
                </div>
              </div>

              {/* Roles */}
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-1 text-xs font-semibold text-[#7C3AED]">
                  🚀 Founder · EcomSathi
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                  🤝 Co-founder · TMMT
                </span>
              </div>

              {/* Bio */}
              <p className="text-sm leading-relaxed text-[#64748B] mb-5">
                Ecommerce seller turned builder. Mohit started selling on Amazon India and Flipkart before building the tools he wished existed. He co-founded{' '}
                <a href="https://tmmt.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#2563EB] hover:underline">TMMT</a>
                {' '}— a product studio focused on ecommerce and commerce tooling for Indian businesses.
              </p>

              {/* Divider */}
              <div className="border-t border-[#F1F5F9] pt-4">
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Also building</p>
                <a
                  href="https://tmmt.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 hover:border-[#BFDBFE] hover:bg-[#EFF6FF] transition-all"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E2E8F0]">
                    <span className="text-sm font-black text-[#0F172A]">T</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">TMMT.in ↗</p>
                    <p className="text-xs text-[#94A3B8]">Product studio for Indian commerce</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <Hero />
      <Mission />
      <OurStory />
      <Values />
      <ToolsGrid />
      <Timeline />
      <CTA />
    </>
  );
}
