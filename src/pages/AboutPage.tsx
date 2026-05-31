import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Globe,
  Users,
  ArrowRight,
  Check,
  Tag,
  FileText,
  Image,
  Video,
  Scissors,
  Calculator,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react';

// ─── Hero ──────────────────────────────────────────────────────────────────────

function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#CFFAFE] py-20 md:py-28">
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, #94A3B8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white/70 px-4 py-1.5 text-sm font-semibold text-[#2563EB] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#06B6D4]" />
              About EcomSathi
            </div>
            <h1
              className="mb-5 text-4xl font-bold leading-tight text-[#0F172A] md:text-5xl"
              style={{ letterSpacing: '-0.8px' }}
            >
              We Build Tools That Indian Sellers{' '}
              <span className="text-[#2563EB]">Actually Need</span>
            </h1>
            <p className="mb-6 text-lg leading-relaxed text-[#475569]">
              EcomSathi was born from the frustration of Indian ecommerce sellers spending
              hours on manual tasks — cropping labels, generating SKUs, reconciling
              payments. We&apos;re here to fix that.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 rounded-[4px] border border-[#2563EB] bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#1D4ED8]"
              >
                Explore Our Tools <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-[4px] border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F172A] shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#F8FAFC]"
              >
                Get In Touch
              </Link>
            </div>
          </div>

          {/* Illustration placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[#1E293B_8px_8px_0px_0px]">
                {/* Mock dashboard illustration */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]">
                    <span className="text-lg font-black text-white">ES</span>
                  </div>
                  <div>
                    <div className="h-3 w-24 rounded bg-[#0F172A]" />
                    <div className="mt-1 h-2 w-16 rounded bg-[#94A3B8]" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { w: 'w-full', color: 'bg-[#DBEAFE]' },
                    { w: 'w-4/5', color: 'bg-[#CFFAFE]' },
                    { w: 'w-3/5', color: 'bg-[#DCFCE7]' },
                    { w: 'w-2/3', color: 'bg-[#FEF3C7]' },
                  ].map((bar, i) => (
                    <div
                      key={i}
                      className={`h-3 rounded-full ${bar.w} ${bar.color}`}
                    />
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['SKU', 'PDF', 'GST', 'IMG', 'VID', 'LBL'].map((t) => (
                    <div
                      key={t}
                      className="flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 text-xs font-bold text-[#334155]"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative badge */}
              <div className="absolute -right-4 -top-4 rounded-full border-2 border-white bg-[#06B6D4] px-3 py-1 text-xs font-bold text-white shadow-md">
                Made in India
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mission ───────────────────────────────────────────────────────────────────

function MissionSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF]">
            <Heart size={28} className="text-[#2563EB]" />
          </div>
        </div>
        <h2
          className="mb-5 text-3xl font-bold text-[#0F172A] md:text-4xl"
          style={{ letterSpacing: '-0.5px' }}
        >
          Our Mission
        </h2>
        <p className="mb-6 text-lg leading-relaxed text-[#475569]">
          We&apos;re building the tools that Indian ecommerce sellers actually need — not
          tools designed for the US market and awkwardly adapted for India.
        </p>
        <p className="text-base leading-relaxed text-[#64748B]">
          Every feature in EcomSathi is built with Indian marketplaces, Indian tax laws,
          and Indian seller workflows in mind. From auto-cropping labels for Flipkart and
          Meesho to calculating GST with HSN codes — EcomSathi understands the Indian
          ecommerce ecosystem.
        </p>
      </div>
    </section>
  );
}

// ─── Story ─────────────────────────────────────────────────────────────────────

function StorySection() {
  return (
    <section className="bg-[#F8FAFC] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Timeline */}
          <div className="order-2 lg:order-1">
            <div className="space-y-6">
              {[
                {
                  year: 'The Problem',
                  text: 'Indian ecommerce sellers were spending 2–3 hours daily on repetitive manual tasks — cropping shipping labels, generating SKUs, reconciling marketplace settlements.',
                  color: 'bg-[#2563EB]',
                },
                {
                  year: 'The Idea',
                  text: 'What if there was one place where sellers could find all the tools they need, built specifically for the Indian ecommerce ecosystem? EcomSathi was born.',
                  color: 'bg-[#06B6D4]',
                },
                {
                  year: 'Today',
                  text: 'EcomSathi offers 50+ free tools across 10 categories, helping thousands of Indian sellers save time and grow their business every day.',
                  color: 'bg-[#16A34A]',
                },
              ].map((item) => (
                <div key={item.year} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${item.color} mt-1.5 shrink-0`} />
                    <div className="mt-2 flex-1 border-l-2 border-dashed border-[#E2E8F0]" />
                  </div>
                  <div className="pb-6">
                    <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest text-[#2563EB]">
                      {item.year}
                    </span>
                    <p className="text-sm leading-relaxed text-[#475569]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <h2
              className="mb-4 text-3xl font-bold text-[#0F172A] md:text-4xl"
              style={{ letterSpacing: '-0.5px' }}
            >
              Our Story
            </h2>
            <p className="mb-4 text-base leading-relaxed text-[#475569]">
              EcomSathi started with a simple observation: Indian ecommerce sellers were
              drowning in operational work. They were using spreadsheets to reconcile
              settlements, manually cropping thousands of shipping labels, and juggling
              different tools for every small task.
            </p>
            <p className="mb-4 text-base leading-relaxed text-[#475569]">
              We set out to build a single platform that handles it all — from the smallest
              daily task (crop a label, generate a SKU) to complex operations (reconcile
              thousands of orders, manage multi-warehouse inventory).
            </p>
            <p className="text-base leading-relaxed text-[#475569]">
              The free tools are our way of giving back to the seller community. The premium
              modules help us sustain and grow so we can keep building more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Values ────────────────────────────────────────────────────────────────────

const VALUES = [
  {
    icon: Zap,
    title: 'Free & Open',
    description:
      'Our core tools will always be free. No paywalls for basic functionality. No hidden costs. Sellers deserve access to great tools without paying just to try.',
    iconBg: 'bg-[#DBEAFE]',
    iconColor: 'text-[#2563EB]',
  },
  {
    icon: Globe,
    title: 'India-First',
    description:
      'Every tool is built with Indian marketplaces, Indian tax laws, and Indian seller workflows in mind. We understand Flipkart, Meesho, and GST — not just Amazon US.',
    iconBg: 'bg-[#CFFAFE]',
    iconColor: 'text-[#0891B2]',
  },
  {
    icon: Users,
    title: 'Seller-Centric',
    description:
      'We build what sellers actually ask for. Our roadmap is driven by real feedback from real sellers — not by what looks good in a pitch deck.',
    iconBg: 'bg-[#DCFCE7]',
    iconColor: 'text-[#16A34A]',
  },
];

function ValuesSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#0F172A] md:text-4xl">
            What We Stand For
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B]">
            The principles that guide every decision we make at EcomSathi
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-[#E2E8F0_2px_2px_0px_0px] transition-all hover:shadow-[#1E293B_3px_3px_0px_0px]"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${v.iconBg}`}
                >
                  <Icon size={24} className={v.iconColor} />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">{v.title}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{v.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── What Makes EcomSathi Different ───────────────────────────────────────────

const DIFFERENTIATORS = [
  {
    icon: Shield,
    title: 'No Login Required',
    description: 'Most tools work without creating an account. Just open and use.',
  },
  {
    icon: TrendingUp,
    title: 'Built for Scale',
    description: 'Handles 1 file or 1,000 files. Batch processing built in from day one.',
  },
  {
    icon: Globe,
    title: '7 Marketplace Support',
    description: 'Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, Snapdeal — all covered.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'No queues. No waiting. Get your processed output in seconds.',
  },
  {
    icon: Heart,
    title: 'Constantly Improving',
    description: 'New tools every month based on seller feedback and requests.',
  },
  {
    icon: Users,
    title: 'Seller Community',
    description: 'Built by sellers, for sellers. We understand your workflow.',
  },
];

function DifferentiatorsSection() {
  return (
    <section className="bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#CFFAFE] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#0F172A] md:text-4xl">
            What Makes EcomSathi Different
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B]">
            We&apos;re not just another SaaS. We&apos;re a tool built by someone who&apos;s been in your shoes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIATORS.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className="flex items-start gap-4 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[#E2E8F0_2px_2px_0px_0px]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                  <Icon size={20} className="text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-[#0F172A]">{d.title}</h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">{d.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '50+', label: 'Free Tools' },
  { value: '10+', label: 'Tool Categories' },
  { value: '7', label: 'Marketplaces Supported' },
  { value: '0', label: 'Rupees for Core Tools' },
];

function StatsSection() {
  return (
    <section className="bg-[#0F172A] py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-1 text-4xl font-black text-[#60A5FA] md:text-5xl">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-[#94A3B8]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tool Coverage ─────────────────────────────────────────────────────────────

const TOOL_COVERAGE = [
  { icon: Tag, name: 'SKU Tools', count: '8 tools' },
  { icon: FileText, name: 'PDF Tools', count: '10 tools' },
  { icon: Image, name: 'Image Tools', count: '12 tools' },
  { icon: Video, name: 'Video Tools', count: '6 tools' },
  { icon: Scissors, name: 'Label Crop', count: '7 formats' },
  { icon: Calculator, name: 'GST Tools', count: '5 tools' },
];

function ToolCoverageSection() {
  return (
    <section className="bg-[#F8FAFC] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#0F172A] md:text-4xl">
            Tools We&apos;ve Built
          </h2>
          <p className="text-base text-[#64748B]">
            Every category purpose-built for Indian ecommerce workflows
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {TOOL_COVERAGE.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.name}
                className="flex flex-col items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white p-4 text-center shadow-[#E2E8F0_2px_2px_0px_0px]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF]">
                  <Icon size={20} className="text-[#2563EB]" />
                </div>
                <span className="text-xs font-bold text-[#0F172A]">{t.name}</span>
                <span className="text-xs text-[#64748B]">{t.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Team ──────────────────────────────────────────────────────────────────────

const TEAM_PLACEHOLDERS = [
  {
    initials: 'AK',
    role: 'Founder & Product',
    bio: 'Former ecommerce seller. Built EcomSathi to solve his own operational headaches.',
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#2563EB]',
  },
  {
    initials: 'RS',
    role: 'Engineering',
    bio: 'Full-stack engineer with a passion for developer experience and fast tools.',
    bg: 'bg-[#CFFAFE]',
    text: 'text-[#0891B2]',
  },
  {
    initials: 'PM',
    role: 'Design',
    bio: 'UI/UX designer focused on making complex workflows feel effortless.',
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#16A34A]',
  },
];

function TeamSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#0F172A] md:text-4xl">
            Built by Real Sellers
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B]">
            EcomSathi is built by a small team that has sold on Indian marketplaces and
            understands the daily grind firsthand.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TEAM_PLACEHOLDERS.map((member) => (
            <div
              key={member.initials}
              className="flex flex-col items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center shadow-[#E2E8F0_2px_2px_0px_0px]"
            >
              {/* Avatar placeholder */}
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${member.bg}`}
              >
                <span className={`text-xl font-black ${member.text}`}>{member.initials}</span>
              </div>
              <div>
                <div className="text-sm font-bold text-[#0F172A]">{member.role}</div>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Hiring note */}
        <div className="mt-10 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-6 text-center">
          <p className="mb-3 text-sm font-medium text-[#334155]">
            We&apos;re a small team building big tools. If you&apos;re passionate about Indian
            ecommerce and great software, we&apos;d love to talk.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Get in touch <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────────

function AboutCta() {
  return (
    <section className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0891B2] py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          Start Using EcomSathi
        </h2>
        <p className="mb-4 text-base text-blue-100">
          50+ free tools. No credit card. No login required for most tools.
        </p>
        <ul className="mb-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
          {[
            'Free forever for core tools',
            'Indian marketplace support',
            'No setup required',
          ].map((point) => (
            <li key={point} className="flex items-center gap-1.5 text-sm text-blue-100">
              <Check size={14} className="text-[#6EE7B7]" strokeWidth={2.5} />
              {point}
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 rounded-[4px] border-2 border-white bg-white px-6 py-3 text-base font-bold text-[#2563EB] shadow-[#1E293B_3px_3px_0px_0px] transition-all hover:bg-blue-50 hover:shadow-[#1E293B_1px_1px_0px_0px]"
          >
            Explore Free Tools <ArrowRight size={18} />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-[4px] border-2 border-white/60 bg-transparent px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page export ───────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <MissionSection />
      <StorySection />
      <ValuesSection />
      <DifferentiatorsSection />
      <StatsSection />
      <ToolCoverageSection />
      <TeamSection />
      <AboutCta />
    </>
  );
}
