import React from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Merge, Scissors, Crop, ScanText, FileArchive, Unlock,
  RotateCw, FileMinus, LayoutGrid, ImageIcon, FilePlus, Stamp, Hash,
  CheckCircle2, Lock, Zap, Globe, Shield,
} from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFBreadcrumb from '../components/PDFBreadcrumb'
import PDFToolCard from '../components/PDFToolCard'
import PDFFAQ from '../components/PDFFAQ'
import type { PDFToolCardData, FAQItem } from '../types'
import { canonical } from '../utils/pdfUtils'

// ─── Tool list ────────────────────────────────────────────────────────────────

const PDF_TOOLS: PDFToolCardData[] = [
  {
    icon: <Merge size={26} />,
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one. Drag to reorder files before merging.',
    path: '/pdf/merge',
    accent: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    badge: 'Popular',
  },
  {
    icon: <Scissors size={26} />,
    title: 'Split PDF',
    description: 'Split by page ranges, every N pages, or extract individual pages.',
    path: '/pdf/split',
    accent: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  },
  {
    icon: <Crop size={26} />,
    title: 'Crop PDF',
    description: 'Draw a crop rectangle and trim margins on all or selected pages.',
    path: '/pdf/crop',
    accent: 'bg-[#ECFEFF] text-[#0891B2] border-[#A5F3FC]',
  },
  {
    icon: <ScanText size={26} />,
    title: 'OCR PDF',
    description: 'Extract text from scanned PDFs using Tesseract OCR engine.',
    path: '/pdf/ocr',
    accent: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  },
  {
    icon: <FileArchive size={26} />,
    title: 'Compress PDF',
    description: 'Reduce PDF file size with Light, Balanced, or Maximum compression.',
    path: '/pdf/compress',
    accent: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    badge: 'Popular',
  },
  {
    icon: <Unlock size={26} />,
    title: 'Remove Password',
    description: 'Unlock a password-protected PDF you own. Fast and secure.',
    path: '/pdf/password-remover',
    accent: 'bg-[#FFF1F2] text-[#DC2626] border-[#FFE4E6]',
  },
  {
    icon: <RotateCw size={26} />,
    title: 'Rotate PDF',
    description: 'Rotate all or specific pages 90°, 180°, or 270° in one click.',
    path: '/pdf/rotate',
    accent: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  {
    icon: <FileMinus size={26} />,
    title: 'Extract Pages',
    description: 'Select specific pages and extract them into a new PDF document.',
    path: '/pdf/extract-pages',
    accent: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  },
  {
    icon: <LayoutGrid size={26} />,
    title: 'Rearrange Pages',
    description: 'Drag page thumbnails to reorder, delete, or restructure your PDF.',
    path: '/pdf/rearrange-pages',
    accent: 'bg-[#ECFEFF] text-[#0891B2] border-[#A5F3FC]',
  },
  {
    icon: <ImageIcon size={26} />,
    title: 'PDF to Image',
    description: 'Convert PDF pages to PNG or JPEG at 72, 150, or 300 DPI.',
    path: '/pdf/pdf-to-image',
    accent: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  },
  {
    icon: <FilePlus size={26} />,
    title: 'Image to PDF',
    description: 'Combine JPG, PNG, or WEBP images into a single PDF file.',
    path: '/pdf/image-to-pdf',
    accent: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  {
    icon: <Stamp size={26} />,
    title: 'Watermark PDF',
    description: 'Add text watermark with custom color, opacity, angle, and position.',
    path: '/pdf/watermark',
    accent: 'bg-[#FFF1F2] text-[#DC2626] border-[#FFE4E6]',
  },
  {
    icon: <Hash size={26} />,
    title: 'Page Numbers',
    description: 'Add page numbers with custom style, position, font size, and prefix.',
    path: '/pdf/page-numbers',
    accent: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
]

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Lock size={20} className="text-[#16A34A]" />,
    title: 'Secure & Private',
    description: 'Files are processed securely and never stored permanently on our servers.',
  },
  {
    icon: <Zap size={20} className="text-[#D97706]" />,
    title: 'No Signup Required',
    description: 'All 13 PDF tools are completely free to use without any registration.',
  },
  {
    icon: <Globe size={20} className="text-[#2563EB]" />,
    title: 'Works in Browser',
    description: 'No software installation needed. Works on any device with a browser.',
  },
  {
    icon: <Shield size={20} className="text-[#7C3AED]" />,
    title: 'Built for Sellers',
    description: 'Tools designed for the real needs of ecommerce sellers and businesses.',
  },
]

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS: FAQItem[] = [
  {
    question: 'Are all PDF tools on EcomSathi completely free?',
    answer:
      'Yes. All 13 PDF tools on EcomSathi are 100% free to use. There are no hidden charges, no subscriptions, and no credit card required.',
  },
  {
    question: 'Do I need to create an account to use the PDF tools?',
    answer:
      'No. All PDF tools work without any login or registration. Just upload your file, process it, and download the result.',
  },
  {
    question: 'Are my PDF files safe?',
    answer:
      'Yes. Files are processed securely on our server and are automatically deleted after processing. We never read, store, or share your documents.',
  },
  {
    question: 'What is the maximum file size for PDF tools?',
    answer:
      'Most PDF tools support files up to 50 MB. For merging, the combined total of all files must be under 50 MB.',
  },
  {
    question: 'Can I use these PDF tools on mobile?',
    answer:
      'Yes. All PDF tools are fully responsive and work on smartphones and tablets as well as desktop browsers.',
  },
  {
    question: 'Which PDF tools are most useful for ecommerce sellers?',
    answer:
      'Merge PDF (combine invoices), Compress PDF (reduce attachment sizes), OCR PDF (extract text from scanned invoices), and PDF to Image (convert pages to product listing images) are most commonly used by ecommerce sellers.',
  },
]

// ─── Schema ───────────────────────────────────────────────────────────────────

const HUB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Free PDF Tools for Ecommerce Sellers & Businesses',
  description:
    'Merge, split, crop, compress, OCR and edit PDF files online for free. No registration required.',
  url: canonical('/pdf'),
  hasPart: PDF_TOOLS.map((t) => ({
    '@type': 'SoftwareApplication',
    name: t.title,
    url: canonical(t.path),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  })),
}

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: canonical('/') },
    { '@type': 'ListItem', position: 2, name: 'PDF Tools', item: canonical('/pdf') },
  ],
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PDFHub: React.FC = () => {
  return (
    <>
      <SEO
        title="Free PDF Tools for Ecommerce Sellers & Businesses — EcomSathi"
        description="Merge, split, crop, compress, OCR and edit PDF files online for free. 13 free PDF tools — no registration required. Made for Indian ecommerce sellers."
        keywords="free pdf tools online, merge pdf free, split pdf online, compress pdf, ocr pdf, pdf to image, image to pdf, rotate pdf, watermark pdf, extract pdf pages, pdf tools india"
        canonicalUrl={canonical('/pdf')}
        schema={[HUB_SCHEMA, BREADCRUMB_SCHEMA] as unknown as object}
      />

      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        {/* Breadcrumb */}
        <PDFBreadcrumb crumbs={[{ label: 'PDF Tools' }]} />

        {/* Hero */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold w-fit">
            <FileText size={12} />
            PDF Tools
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] leading-tight">
            Free PDF Tools for<br className="hidden sm:block" /> Ecommerce Sellers & Businesses
          </h1>
          <p className="text-base text-[#64748B] max-w-2xl">
            Merge, split, crop, compress, OCR and edit PDF files online for free. No registration required. 13 tools built for Indian ecommerce sellers and small businesses.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mt-1">
            {['No signup', '100% free', '13 tools', 'Secure & private'].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E2E8F0] bg-white text-xs text-[#64748B]"
              >
                <CheckCircle2 size={11} className="text-[#16A34A]" />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Tool cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-[#0F172A]">All PDF Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PDF_TOOLS.map((tool) => (
              <PDFToolCard key={tool.path} tool={tool} />
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-[#0F172A]">Why Use EcomSathi PDF Tools?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex gap-4"
              >
                <div className="w-9 h-9 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">{f.title}</h3>
                  <p className="text-sm text-[#64748B] mt-1">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <PDFFAQ items={FAQS} pageUrl={canonical('/pdf')} />

        {/* Internal links */}
        <section className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">Explore Other Tools</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Image Tools', to: '/image' },
              { label: 'Video Tools', to: '/video' },
              { label: 'SKU Generator', to: '/tools/sku-generator' },
              { label: 'Barcode Generator', to: '/tools/barcode' },
              { label: 'Background Remover', to: '/tools/background-remover' },
              { label: 'Compress Image', to: '/tools/compress-image' },
              { label: 'GST Calculator', to: '/tools/gst-calculator' },
              { label: 'Label Crop', to: '/label-crop' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 text-sm text-[#2563EB] border border-[#BFDBFE] rounded-[4px] bg-white hover:bg-[#EFF6FF] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export default PDFHub
