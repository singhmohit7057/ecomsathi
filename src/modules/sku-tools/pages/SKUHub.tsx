// ============================================================
// SKU Tools Hub Page — /tools/sku
// ============================================================

import React from 'react'
import { Link } from 'react-router-dom'
import {
  Tag, Layers, GitBranch, Settings2, QrCode, Layout, Printer,
  ChevronRight, CheckCircle2, Shield, Zap, Download, FileSpreadsheet,
  Package,
} from 'lucide-react'
import SEO from '@/components/common/SEO'
import SKUToolCard from '../components/SKUToolCard'
import SKUFAQ from '../components/SKUFAQ'

// ─── SEO ───────────────────────────────────────────────────

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Free SKU & Label Tools for Ecommerce Sellers',
  description: 'Generate product SKUs, variant SKUs, barcode labels and printable product labels for ecommerce marketplaces.',
  url: 'https://ecomsathi.vercel.app/tools/sku',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ecomsathi.vercel.app' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://ecomsathi.vercel.app/tools' },
      { '@type': 'ListItem', position: 3, name: 'SKU Tools', item: 'https://ecomsathi.vercel.app/tools/sku' },
    ],
  },
}

// ─── Tools ─────────────────────────────────────────────────

const SKU_TOOLS = [
  {
    name: 'SKU Generator',
    href: '/tools/sku/generator',
    icon: <Tag size={22} />,
    desc: 'Generate a unique SKU from brand, category, color and size — with live barcode preview.',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
    badge: undefined,
  },
  {
    name: 'Bulk SKU Generator',
    href: '/tools/sku/bulk-generator',
    icon: <Layers size={22} />,
    desc: 'Upload a CSV or Excel file and generate SKUs for all products in one click.',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
    badge: 'CSV',
  },
  {
    name: 'Variant SKU Generator',
    href: '/tools/sku/variant-generator',
    icon: <GitBranch size={22} />,
    desc: 'Generate all Color × Size × Material combinations automatically.',
    color: 'text-[#059669]',
    iconBg: 'bg-[#ECFDF5]',
    badge: undefined,
  },
  {
    name: 'Custom SKU Generator',
    href: '/tools/sku/custom-generator',
    icon: <Settings2 size={22} />,
    desc: 'Build your own SKU format using token blocks — {BRAND}-{CATEGORY}-{NUMBER}.',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
    badge: 'Templates',
  },
  {
    name: 'Barcode Generator',
    href: '/tools/sku/barcode',
    icon: <QrCode size={22} />,
    desc: 'Convert any SKU into Code128, EAN-13, EAN-8, UPC or QR Code. Download PNG/SVG.',
    color: 'text-[#DC2626]',
    iconBg: 'bg-[#FFF1F2]',
    badge: undefined,
  },
  {
    name: 'Label Generator',
    href: '/tools/sku/label-generator',
    icon: <Layout size={22} />,
    desc: 'Create printable product labels with SKU, barcode, price, MRP, brand and size.',
    color: 'text-[#0891B2]',
    iconBg: 'bg-[#ECFEFF]',
    badge: 'PDF',
  },
  {
    name: 'Label Printer',
    href: '/tools/sku/label-printer',
    icon: <Printer size={22} />,
    desc: 'Print A4 sheets or thermal labels. Supports 1-up, 2-up, 4-up and batch printing.',
    color: 'text-[#374151]',
    iconBg: 'bg-[#F1F5F9]',
    badge: undefined,
  },
]

// ─── FAQs ──────────────────────────────────────────────────

const FAQS = [
  {
    question: 'What is a SKU?',
    answer: 'A SKU (Stock Keeping Unit) is a unique alphanumeric code assigned to a product to track inventory. Each product variation (size, color, material) should have its own SKU.',
  },
  {
    question: 'How do I generate a SKU?',
    answer: 'Enter your brand name, product category, color, and size. Our tool builds a clean SKU like NIKE-TSH-BLK-M instantly. You can also use the Bulk or Variant generators for multiple products.',
  },
  {
    question: 'What barcode formats are supported?',
    answer: 'We support Code 128, EAN-13, EAN-8, UPC-A and QR Code. Code 128 works for all SKUs. EAN-13 is required for most Indian marketplaces.',
  },
  {
    question: 'Can I upload a CSV to generate SKUs in bulk?',
    answer: 'Yes! Use the Bulk SKU Generator to upload a CSV or Excel file with columns for productName, brand, color, size, and category. SKUs are generated instantly and you can download the result.',
  },
  {
    question: 'How do I print product labels?',
    answer: 'Use the Label Generator to design your label with SKU, barcode, price and MRP fields, then use the Label Printer to arrange them on A4 or thermal paper and print or download as PDF.',
  },
  {
    question: 'Are these tools free?',
    answer: 'Yes, all SKU tools are completely free with no login required. You can generate unlimited SKUs and labels.',
  },
]

// ─── Benefits ──────────────────────────────────────────────

const BENEFITS = [
  { icon: <Zap size={18} className="text-[#2563EB]" />, title: 'Instant Generation', desc: 'Generate SKUs in seconds with live preview.' },
  { icon: <FileSpreadsheet size={18} className="text-[#059669]" />, title: 'Bulk Processing', desc: 'Upload CSV/Excel and process thousands of rows.' },
  { icon: <QrCode size={18} className="text-[#7C3AED]" />, title: 'Multiple Barcode Formats', desc: 'Code 128, EAN-13, EAN-8, UPC, QR Code.' },
  { icon: <Download size={18} className="text-[#D97706]" />, title: 'Multiple Export Formats', desc: 'Download as CSV, PDF, PNG, SVG.' },
  { icon: <Shield size={18} className="text-[#DC2626]" />, title: 'No Login Required', desc: 'All tools are free and work in your browser.' },
  { icon: <CheckCircle2 size={18} className="text-[#0891B2]" />, title: 'Marketplace Ready', desc: 'Optimized for Amazon, Flipkart, Meesho formats.' },
]

// ─── Related Tools ─────────────────────────────────────────

const RELATED = [
  { name: 'PDF Tools', href: '/tools/pdf', desc: 'Merge, split, compress and edit PDFs' },
  { name: 'Image Tools', href: '/tools/image', desc: 'Background remover, resize, compress images' },
  { name: 'GST Tools', href: '/tools/gst', desc: 'GST calculator, GSTIN validator, HSN search' },
  { name: 'Label Crop', href: '/label-crop', desc: 'Crop shipping labels for all marketplaces' },
]

// ─── Component ─────────────────────────────────────────────

export default function SKUHub() {
  return (
    <>
      <SEO
        title="Free SKU & Label Tools for Ecommerce Sellers | EcomSathi"
        description="Generate product SKUs, variant SKUs, barcode labels and printable product labels for ecommerce marketplaces. Free, no login required."
        keywords="sku generator, barcode generator, product label generator, bulk sku, variant sku, custom sku, ecommerce sku tools"
        canonicalUrl="https://ecomsathi.vercel.app/tools/sku"
        schema={PAGE_SCHEMA}
      />

      <div className="flex flex-col gap-8">

        {/* Hero */}
        <div className="rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border border-[#BFDBFE] bg-white text-[#2563EB] shadow-sm">
              <Package size={28} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
                  Free SKU & Label Tools for Ecommerce Sellers
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
                  <CheckCircle2 size={11} />
                  No login required
                </span>
                <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-[#D97706] ring-1 ring-inset ring-[#FDE68A]">
                  100% Free
                </span>
              </div>
              <p className="mt-2 text-sm text-[#475569] sm:text-base">
                Generate product SKUs, variant SKUs, barcode labels and printable product labels for ecommerce marketplaces.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <span className="font-bold text-[#2563EB] text-sm">{SKU_TOOLS.length}</span>
                  tools available
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <Shield size={13} className="text-[#16A34A]" />
                  Browser-based, no data stored
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <CheckCircle2 size={13} className="text-[#2563EB]" />
                  Unlimited generation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
          <Link to="/" className="transition-colors hover:text-[#0F172A]">Home</Link>
          <ChevronRight size={14} />
          <Link to="/tools" className="transition-colors hover:text-[#0F172A]">Tools</Link>
          <ChevronRight size={14} />
          <span className="font-medium text-[#0F172A]">SKU Tools</span>
        </nav>

        {/* Tool Grid */}
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">Choose a SKU Tool</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKU_TOOLS.map((tool) => (
              <SKUToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">Why Use EcomSathi SKU Tools?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-3 p-4 rounded-[8px] bg-white border border-[#E2E8F0]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
                  {b.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{b.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">SKU Tools Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {[
              'Auto SKU Generation from product attributes',
              'CSV and Excel upload for bulk processing',
              'Variant matrix — all Color × Size combinations',
              'Custom pattern builder with token blocks',
              'Code 128, EAN-13, EAN-8, UPC, QR Code',
              'Download PNG, SVG, PDF formats',
              'Thermal and A4 label templates',
              'Print preview with batch printing',
              'Auto-numbering and sequence control',
              'Duplicate SKU detection',
              'No login or account required',
              'Works 100% in your browser',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 py-1">
                <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                <span className="text-sm text-[#374151]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Tools */}
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">Related Ecommerce Tools</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RELATED.map((r) => (
              <Link
                key={r.href}
                to={r.href}
                className="flex flex-col gap-1 p-4 rounded-[8px] border border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:shadow-[#1E293B_2px_2px_0px_0px] transition-all group"
              >
                <p className="text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB]">{r.name}</p>
                <p className="text-xs text-[#64748B]">{r.desc}</p>
                <p className="text-xs font-medium text-[#2563EB] mt-1">Explore →</p>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <SKUFAQ items={FAQS} />

        {/* Privacy Note */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
          <p className="text-xs text-[#64748B]">
            All SKU tools run in your browser. No data is sent to any server. Files and generated content stay on your device.
          </p>
        </div>

      </div>
    </>
  )
}
