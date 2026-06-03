import React from 'react'
import { Link } from 'react-router-dom'
import {
  FilePlus,
  Scissors,
  Archive,
  ScanText,
  Crop,
  RotateCw,
  FileImage,
  Stamp,
  Hash,
  LockOpen,
  FileMinus,
  GripVertical,
  ChevronRight,
  FileText,
  CheckCircle2,
  Shield,
} from 'lucide-react'

// ─── Tool list ────────────────────────────────────────────────────────────────

interface PDFTool {
  name: string
  href: string
  icon: React.ReactNode
  desc: string
  color: string
  iconBg: string
}

const PDF_TOOLS: PDFTool[] = [
  {
    name: 'Merge PDF',
    href: '/tools/pdf/merge',
    icon: <FilePlus size={22} />,
    desc: 'Combine multiple PDFs into one file',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
  },
  {
    name: 'Split PDF',
    href: '/tools/pdf/split',
    icon: <Scissors size={22} />,
    desc: 'Split by page ranges or extract pages',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
  },
  {
    name: 'Compress PDF',
    href: '/tools/pdf/compress',
    icon: <Archive size={22} />,
    desc: 'Reduce PDF file size without quality loss',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
  },
  {
    name: 'OCR PDF',
    href: '/tools/pdf/ocr',
    icon: <ScanText size={22} />,
    desc: 'Extract text from scanned PDFs',
    color: 'text-[#059669]',
    iconBg: 'bg-[#ECFDF5]',
  },
  {
    name: 'Crop PDF',
    href: '/tools/pdf/crop',
    icon: <Crop size={22} />,
    desc: 'Crop page margins and content area',
    color: 'text-[#0891B2]',
    iconBg: 'bg-[#ECFEFF]',
  },
  {
    name: 'Rotate PDF',
    href: '/tools/pdf/rotate',
    icon: <RotateCw size={22} />,
    desc: 'Rotate pages 90° or 180°',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
  },
  {
    name: 'PDF to Images',
    href: '/tools/pdf/to-images',
    icon: <FileImage size={22} />,
    desc: 'Convert PDF pages to PNG/JPEG',
    color: 'text-[#DC2626]',
    iconBg: 'bg-[#FFF1F2]',
  },
  {
    name: 'Images to PDF',
    href: '/tools/pdf/images-to-pdf',
    icon: <FilePlus size={22} />,
    desc: 'Create a PDF from multiple images',
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
  },
  {
    name: 'Add Watermark',
    href: '/tools/pdf/watermark',
    icon: <Stamp size={22} />,
    desc: 'Add text watermark to PDF pages',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
  },
  {
    name: 'Page Numbers',
    href: '/tools/pdf/page-numbers',
    icon: <Hash size={22} />,
    desc: 'Add page numbers to PDF',
    color: 'text-[#059669]',
    iconBg: 'bg-[#ECFDF5]',
  },
  {
    name: 'Remove Password',
    href: '/tools/pdf/password',
    icon: <LockOpen size={22} />,
    desc: 'Remove password from PDF files',
    color: 'text-[#DC2626]',
    iconBg: 'bg-[#FFF1F2]',
  },
  {
    name: 'Extract Pages',
    href: '/tools/pdf/extract',
    icon: <FileMinus size={22} />,
    desc: 'Extract specific pages as a new PDF',
    color: 'text-[#0891B2]',
    iconBg: 'bg-[#ECFEFF]',
  },
  {
    name: 'Rearrange Pages',
    href: '/tools/pdf/rearrange',
    icon: <GripVertical size={22} />,
    desc: 'Drag to reorder PDF pages',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#EFF6FF]',
  },
]

// ─── Hub page ─────────────────────────────────────────────────────────────────

export const handle = {
  toolName: undefined,
  category: 'PDF Tools',
  description: 'Free browser-based PDF tools — no login required.',
}

export default function PDFToolsHub() {
  return (
    <div className="flex flex-col gap-8">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border border-[#BFDBFE] bg-white text-[#2563EB] shadow-sm">
            <FileText size={28} />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
                PDF Tools
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
              {PDF_TOOLS.length} free PDF tools — all processing happens in your browser or our
              secure server. Files are never stored permanently.
            </p>

            {/* Stats row */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span className="font-bold text-[#2563EB] text-sm">{PDF_TOOLS.length}</span>
                tools available
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Shield size={13} className="text-[#16A34A]" />
                Files processed securely
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <CheckCircle2 size={13} className="text-[#2563EB]" />
                Browser-based — no install
              </div>
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
        <span className="font-medium text-[#0F172A]">PDF Tools</span>
      </nav>

      {/* ── Tool grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PDF_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className="group flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-5 transition-all duration-150 hover:border-[#2563EB] hover:shadow-[#1E293B_2px_2px_0px_0px]"
          >
            {/* Icon + badges */}
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-[8px] ${tool.iconBg} ${tool.color}`}
              >
                {tool.icon}
              </div>
              <div className="flex gap-1.5">
                <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A] border border-[#BBF7D0]">
                  Free
                </span>
                <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
                  PDF Tools
                </span>
              </div>
            </div>

            {/* Title + description */}
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[#0F172A] transition-colors group-hover:text-[#2563EB]">
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

      {/* ── Privacy note ───────────────────────────────────────── */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
        <p className="text-xs text-[#64748B]">
          Your files are processed securely. We do not store, read, or share your PDFs.
          Client-side tools never leave your browser.
        </p>
      </div>
    </div>
  )
}
