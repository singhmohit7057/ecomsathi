import React from 'react';
import { Link } from 'react-router-dom';
import {
  Merge,
  Scissors,
  Crop,
  ScanText,
  FileArchive,
  Unlock,
  RotateCw,
  FileMinus,
  LayoutGrid,
  ImageIcon,
  FilePlus,
  Stamp,
  Hash,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface ToolCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  color: string;
  bg: string;
}

const tools: ToolCard[] = [
  {
    icon: <Merge size={22} />,
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one. Drag to reorder.',
    to: '/tools/pdf/merge',
    color: 'text-[#2563EB]',
    bg: 'bg-[#EFF6FF]',
  },
  {
    icon: <Scissors size={22} />,
    title: 'Split PDF',
    description: 'Split by page ranges, every N pages, or individual pages.',
    to: '/tools/pdf/split',
    color: 'text-[#7C3AED]',
    bg: 'bg-[#F5F3FF]',
  },
  {
    icon: <Crop size={22} />,
    title: 'Crop PDF',
    description: 'Draw a crop rectangle and trim all or selected pages.',
    to: '/tools/pdf/crop',
    color: 'text-[#0891B2]',
    bg: 'bg-[#ECFEFF]',
  },
  {
    icon: <ScanText size={22} />,
    title: 'OCR PDF',
    description: 'Extract text from scanned PDFs using Tesseract OCR.',
    to: '/tools/pdf/ocr',
    color: 'text-[#059669]',
    bg: 'bg-[#ECFDF5]',
  },
  {
    icon: <FileArchive size={22} />,
    title: 'Compress PDF',
    description: 'Reduce PDF size with Light, Balanced, or Maximum compression.',
    to: '/tools/pdf/compress',
    color: 'text-[#D97706]',
    bg: 'bg-[#FFFBEB]',
  },
  {
    icon: <Unlock size={22} />,
    title: 'Remove Password',
    description: 'Unlock a password-protected PDF you own.',
    to: '/tools/pdf/remove-password',
    color: 'text-[#DC2626]',
    bg: 'bg-[#FFF1F2]',
  },
  {
    icon: <RotateCw size={22} />,
    title: 'Rotate PDF',
    description: 'Rotate all or specific pages 90° CW, CCW, or 180°.',
    to: '/tools/pdf/rotate',
    color: 'text-[#2563EB]',
    bg: 'bg-[#EFF6FF]',
  },
  {
    icon: <FileMinus size={22} />,
    title: 'Extract Pages',
    description: 'Select pages and extract them into a new PDF.',
    to: '/tools/pdf/extract-pages',
    color: 'text-[#7C3AED]',
    bg: 'bg-[#F5F3FF]',
  },
  {
    icon: <LayoutGrid size={22} />,
    title: 'Rearrange Pages',
    description: 'Drag page thumbnails to reorder or remove pages.',
    to: '/tools/pdf/rearrange',
    color: 'text-[#0891B2]',
    bg: 'bg-[#ECFEFF]',
  },
  {
    icon: <ImageIcon size={22} />,
    title: 'PDF to Images',
    description: 'Convert PDF pages to PNG or JPEG at 72, 150, or 300 DPI.',
    to: '/tools/pdf/to-images',
    color: 'text-[#059669]',
    bg: 'bg-[#ECFDF5]',
  },
  {
    icon: <FilePlus size={22} />,
    title: 'Images to PDF',
    description: 'Combine JPG, PNG, or WEBP images into a single PDF.',
    to: '/tools/pdf/images-to-pdf',
    color: 'text-[#D97706]',
    bg: 'bg-[#FFFBEB]',
  },
  {
    icon: <Stamp size={22} />,
    title: 'Watermark PDF',
    description: 'Add text watermark with custom color, opacity, and placement.',
    to: '/tools/pdf/watermark',
    color: 'text-[#DC2626]',
    bg: 'bg-[#FFF1F2]',
  },
  {
    icon: <Hash size={22} />,
    title: 'Page Numbers',
    description: 'Add page numbers with custom style, position, and font.',
    to: '/tools/pdf/page-numbers',
    color: 'text-[#2563EB]',
    bg: 'bg-[#EFF6FF]',
  },
];

export const handle = {
  toolName: undefined,
  category: 'PDF Tools',
  description: 'Free browser-based PDF tools — no login required.',
};

export default function PDFToolsHub() {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
        <Link to="/" className="hover:text-[#0F172A] transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link to="/tools" className="hover:text-[#0F172A] transition-colors">Tools</Link>
        <ChevronRight size={14} />
        <span className="font-medium text-[#0F172A]">PDF Tools</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-[#0F172A]">PDF Tools</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-medium text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
            <CheckCircle2 size={11} />
            No login required
          </span>
          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]">
            PDF Tools
          </span>
          <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-xs font-medium text-[#D97706]">
            100% Free
          </span>
        </div>
        <p className="text-sm text-[#475569] sm:text-base">
          {tools.length} free PDF tools — all processing happens in your browser or on our secure server.
          Files are never stored permanently.
        </p>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="group flex flex-col gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:border-[#CBD5E1] hover:shadow-[#1E293B_2px_2px_0px_0px]"
          >
            {/* Icon + badges */}
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-[8px] ${tool.bg} ${tool.color}`}>
                {tool.icon}
              </div>
              <div className="flex gap-1.5">
                <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
                  Free
                </span>
                <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#475569]">
                  PDF Tools
                </span>
              </div>
            </div>

            {/* Title + description */}
            <div>
              <h2 className="text-base font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                {tool.title}
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">{tool.description}</p>
            </div>

            {/* CTA */}
            <div className={`flex items-center gap-1 text-sm font-medium ${tool.color}`}>
              Open tool
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Privacy note */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
        <p className="text-xs text-[#64748B]">
          Your files are processed securely. We do not store, read, or share your PDFs.
          Client-side tools never leave your browser.
        </p>
      </div>
    </div>
  );
}
