import React from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  CheckCircle,
  Calculator,
  ArrowLeft,
  Percent,
  MapPin,
  Shield,
  CreditCard,
  BookOpen,
  Headphones,
  ChevronRight,
  Receipt,
  CheckCircle2,
} from 'lucide-react'

// ─── Tool list ────────────────────────────────────────────────────────────────

interface GSTTool {
  name: string
  href: string
  icon: React.ReactNode
  desc: string
  color: string
  iconBg: string
  badge?: string
}

const GST_TOOLS: GSTTool[] = [
  {
    name: 'GST Verification',
    href: '/tools/gst/verify',
    icon: <Shield size={22} />,
    desc: 'Validate GSTIN format, checksum & verify live on GSTN portal',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
    badge: 'Live Verify',
  },
  {
    name: 'GST Calculator',
    href: '/tools/gst/calculator',
    icon: <Calculator size={22} />,
    desc: 'Calculate CGST, SGST, IGST instantly',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
    badge: 'Offline',
  },
  {
    name: 'Reverse GST Calculator',
    href: '/tools/gst/reverse',
    icon: <ArrowLeft size={22} />,
    desc: 'Extract base price from GST-inclusive amount',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
    badge: 'Offline',
  },
  {
    name: 'GST Rate Finder',
    href: '/tools/gst/rate-finder',
    icon: <Percent size={22} />,
    desc: 'Find GST rate by HSN or description',
    color: 'text-[#DC2626]',
    iconBg: 'bg-[#FFF1F2]',
    badge: 'Offline',
  },
  {
    name: 'HSN Code Search',
    href: '/tools/gst/hsn-search',
    icon: <BookOpen size={22} />,
    desc: 'Search HSN codes and tax rates',
    color: 'text-[#0891B2]',
    iconBg: 'bg-[#ECFEFF]',
    badge: 'Offline',
  },
  {
    name: 'SAC Code Search',
    href: '/tools/gst/sac-search',
    icon: <Headphones size={22} />,
    desc: 'Search SAC codes for services',
    color: 'text-[#BE185D]',
    iconBg: 'bg-[#FCE7F3]',
    badge: 'Offline',
  },
  {
    name: 'GST State Finder',
    href: '/tools/gst/state-finder',
    icon: <MapPin size={22} />,
    desc: 'Find state from GSTIN state code',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
    badge: 'Offline',
  },
  {
    name: 'PAN Validator',
    href: '/tools/gst/pan-validator',
    icon: <CreditCard size={22} />,
    desc: 'Validate PAN card format and type',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
    badge: 'Offline',
  },
]

const BADGE_STYLES: Record<string, string> = {
  'Live Verify': 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  Offline: 'bg-[#F0FDF4] text-[#16A34A] border-[#A7F3D0]',
}

// ─── Hub page ─────────────────────────────────────────────────────────────────

export const handle = {
  toolName: undefined,
  category: 'GST Tools',
  description: 'Free GST tools for Indian sellers — validate, calculate and find codes.',
}

export default function GSTToolsHub() {
  return (
    <div className="flex flex-col gap-8">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border border-[#FDE68A] bg-white text-[#D97706] shadow-sm">
            <Receipt size={28} />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
                GST Tools
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-[#16A34A] ring-1 ring-inset ring-[#A7F3D0]">
                <CheckCircle2 size={11} />
                No login required
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-[#D97706] ring-1 ring-inset ring-[#FDE68A]">
                100% Free
              </span>
            </div>
            <p className="mt-2 text-sm text-[#475569] sm:text-base">
  8 free tools for Indian sellers — validate GSTINs, calculate tax,
              find HSN/SAC codes and more. Most tools work offline; live verification uses the GSTN
              portal via our secure backend.
            </p>

            {/* Legend row */}
            <div className="mt-4 flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                Offline — works without internet
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]">
                <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                Live Verify — calls GSTN portal
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]">
                <span className="h-2 w-2 rounded-full bg-[#D97706]" />
                No login required
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
        <Link to="/" className="transition-colors hover:text-[#0F172A]">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link to="/tools" className="transition-colors hover:text-[#0F172A]">
          Tools
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-[#0F172A]">GST Tools</span>
      </nav>

      {/* ── Tool grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GST_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className="group flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-5 transition-all duration-150 hover:border-[#D97706] hover:shadow-[#1E293B_2px_2px_0px_0px]"
          >
            {/* Icon + badge */}
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-[8px] ${tool.iconBg} ${tool.color}`}
              >
                {tool.icon}
              </div>
              {tool.badge && (
                <span
                  className={[
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                    BADGE_STYLES[tool.badge] ?? 'bg-gray-50 text-gray-600 border-gray-200',
                  ].join(' ')}
                >
                  {tool.badge}
                </span>
              )}
            </div>

            {/* Title + description */}
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[#0F172A] transition-colors group-hover:text-[#D97706]">
                {tool.name}
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">{tool.desc}</p>
            </div>

            {/* CTA */}
            <div
              className={`flex items-center gap-1 text-sm font-medium ${tool.color}`}
            >
              Open Tool
              <ChevronRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
        <p className="text-xs text-[#64748B]">
          GST data is based on official CBIC notifications. Rates are indicative — always verify
          with your CA for specific transactions. We do not store any GSTIN or PAN data you enter.
        </p>
      </div>
    </div>
  )
}
