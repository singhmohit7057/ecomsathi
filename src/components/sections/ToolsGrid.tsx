import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  // SKU
  Tag,
  Tags,
  Layers,
  Sliders,
  Barcode,
  Printer,
  FileText,
  // PDF
  FilePlus,
  FileMinus,
  Crop,
  ScanText,
  FileDown,
  Lock,
  RotateCw,
  FileSearch,
  ListOrdered,
  Image,
  Images,
  Stamp,
  Hash,
  // Image
  Scissors,
  Maximize,
  Minimize,
  ImagePlus,
  RefreshCw,
  Droplets,
  Square,
  // Video
  Film,
  FrameCorners,
  Video,
  VideoIcon,
  Clapperboard,
  // GST
  Search,
  CheckCircle,
  Calculator,
  ArrowLeftRight,
  Percent,
  MapPin,
  ShieldCheck,
  CreditCard,
  BookOpen,
  Headphones,
  // Label
  ScissorsLineDashed,
} from 'lucide-react'

// ============================================================
// Tool interface
// ============================================================

export interface Tool {
  name: string
  description: string
  path: string
  icon: React.ReactNode
  category: string
  isPopular?: boolean
}

// ============================================================
// ALL_TOOLS catalogue
// ============================================================

export const ALL_TOOLS: Tool[] = [
  // ── SKU Tools ─────────────────────────────────────────────
  {
    name: 'SKU Generator',
    description: 'Auto-generate structured SKU codes from product attributes',
    path: '/tools/sku-generator',
    icon: <Tag size={20} />,
    category: 'SKU Tools',
    isPopular: true,
  },
  {
    name: 'Bulk SKU Creator',
    description: 'Upload a spreadsheet and generate SKUs for hundreds of products at once',
    path: '/tools/bulk-sku',
    icon: <Tags size={20} />,
    category: 'SKU Tools',
    isPopular: true,
  },
  {
    name: 'Variant SKU Builder',
    description: 'Create size/color/attribute variant SKUs from a master product code',
    path: '/tools/variant-sku',
    icon: <Layers size={20} />,
    category: 'SKU Tools',
  },
  {
    name: 'Custom SKU Format',
    description: 'Define your own prefix/suffix/separator rules for custom SKU formats',
    path: '/tools/custom-sku',
    icon: <Sliders size={20} />,
    category: 'SKU Tools',
  },
  {
    name: 'Barcode Generator',
    description: 'Generate EAN-13, Code128, and QR barcodes from SKU lists',
    path: '/tools/barcode',
    icon: <Barcode size={20} />,
    category: 'SKU Tools',
    isPopular: true,
  },
  {
    name: 'Label Generator',
    description: 'Create print-ready product labels with barcode, SKU, and price',
    path: '/tools/label-generator',
    icon: <FileText size={20} />,
    category: 'SKU Tools',
  },
  {
    name: 'Label Printer',
    description: 'Configure and print labels directly to thermal or inkjet printers',
    path: '/tools/label-printer',
    icon: <Printer size={20} />,
    category: 'SKU Tools',
  },

  // ── PDF Tools ─────────────────────────────────────────────
  {
    name: 'PDF Merger',
    description: 'Combine multiple PDF files into a single document in seconds',
    path: '/tools/pdf-merge',
    icon: <FilePlus size={20} />,
    category: 'PDF Tools',
    isPopular: true,
  },
  {
    name: 'PDF Splitter',
    description: 'Split a PDF into individual pages or custom page ranges',
    path: '/tools/pdf-split',
    icon: <FileMinus size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF Cropper',
    description: 'Crop margins or specific regions from every page of a PDF',
    path: '/tools/pdf-crop',
    icon: <Crop size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF OCR',
    description: 'Extract searchable text from scanned PDFs using OCR',
    path: '/tools/pdf-ocr',
    icon: <ScanText size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF Compressor',
    description: 'Reduce PDF file size without losing readability',
    path: '/tools/pdf-compress',
    icon: <FileDown size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF Password Protect',
    description: 'Add or remove password protection from PDF documents',
    path: '/tools/pdf-password',
    icon: <Lock size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF Rotator',
    description: 'Rotate individual pages or entire PDF documents',
    path: '/tools/pdf-rotate',
    icon: <RotateCw size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF Text Extractor',
    description: 'Extract all text content from a PDF into a plain text file',
    path: '/tools/pdf-extract',
    icon: <FileSearch size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF Page Rearranger',
    description: 'Drag and drop pages to reorder them in any PDF',
    path: '/tools/pdf-rearrange',
    icon: <ListOrdered size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF to Images',
    description: 'Convert each PDF page to a high-resolution JPG or PNG image',
    path: '/tools/pdf-to-images',
    icon: <Image size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'Images to PDF',
    description: 'Merge multiple images into a single PDF document',
    path: '/tools/images-to-pdf',
    icon: <Images size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF Watermark',
    description: 'Add text or image watermarks to every page of a PDF',
    path: '/tools/pdf-watermark',
    icon: <Stamp size={20} />,
    category: 'PDF Tools',
  },
  {
    name: 'PDF Page Numbers',
    description: 'Insert page numbers into any position of a PDF document',
    path: '/tools/pdf-page-numbers',
    icon: <Hash size={20} />,
    category: 'PDF Tools',
  },

  // ── Image Tools ───────────────────────────────────────────
  {
    name: 'Background Remover',
    description: 'Instantly remove backgrounds from product photos with AI',
    path: '/tools/background-remover',
    icon: <Scissors size={20} />,
    category: 'Image Tools',
    isPopular: true,
  },
  {
    name: 'Image Cropper',
    description: 'Crop images to custom dimensions or standard aspect ratios',
    path: '/tools/crop-image',
    icon: <Crop size={20} />,
    category: 'Image Tools',
  },
  {
    name: 'Image Resizer',
    description: 'Resize product images to marketplace-specific dimensions',
    path: '/tools/resize-image',
    icon: <Maximize size={20} />,
    category: 'Image Tools',
  },
  {
    name: 'Image Compressor',
    description: 'Compress images to reduce upload size while preserving quality',
    path: '/tools/compress-image',
    icon: <Minimize size={20} />,
    category: 'Image Tools',
  },
  {
    name: 'JPG to PNG',
    description: 'Convert JPG images to transparent-capable PNG format',
    path: '/tools/jpg-to-png',
    icon: <RefreshCw size={20} />,
    category: 'Image Tools',
  },
  {
    name: 'PNG to JPG',
    description: 'Convert PNG files to compressed JPG for faster uploads',
    path: '/tools/png-to-jpg',
    icon: <ImagePlus size={20} />,
    category: 'Image Tools',
  },
  {
    name: 'WebP Converter',
    description: 'Convert images to/from WebP for optimal web performance',
    path: '/tools/webp-converter',
    icon: <RefreshCw size={20} />,
    category: 'Image Tools',
  },
  {
    name: 'Image Watermark',
    description: 'Add your brand logo or text watermark to product images',
    path: '/tools/image-watermark',
    icon: <Stamp size={20} />,
    category: 'Image Tools',
  },
  {
    name: 'Product Image Optimizer',
    description: 'Batch optimize product images for Amazon, Flipkart, and Meesho',
    path: '/tools/product-optimizer',
    icon: <Droplets size={20} />,
    category: 'Image Tools',
    isPopular: true,
  },
  {
    name: 'White Background Adder',
    description: 'Replace transparent or coloured backgrounds with pure white',
    path: '/tools/white-background',
    icon: <Square size={20} />,
    category: 'Image Tools',
  },
  {
    name: 'Square Image Maker',
    description: 'Pad or crop any image to a perfect square with custom background',
    path: '/tools/square-image',
    icon: <Square size={20} />,
    category: 'Image Tools',
  },

  // ── Video Tools ───────────────────────────────────────────
  {
    name: 'Video to GIF',
    description: 'Convert short product video clips to animated GIFs for listings',
    path: '/tools/video-to-gif',
    icon: <Film size={20} />,
    category: 'Video Tools',
  },
  {
    name: 'Frame Extractor',
    description: 'Extract individual frames from a video as high-quality images',
    path: '/tools/frame-extractor',
    icon: <Clapperboard size={20} />,
    category: 'Video Tools',
  },
  {
    name: 'Video Compressor',
    description: 'Reduce video file size while maintaining acceptable quality',
    path: '/tools/compress-video',
    icon: <VideoIcon size={20} />,
    category: 'Video Tools',
  },
  {
    name: 'Video Resizer',
    description: 'Resize or reframe videos to required marketplace dimensions',
    path: '/tools/resize-video',
    icon: <Video size={20} />,
    category: 'Video Tools',
  },
  {
    name: 'Video Converter',
    description: 'Convert videos between MP4, WebM, MOV, and other formats',
    path: '/tools/video-converter',
    icon: <RefreshCw size={20} />,
    category: 'Video Tools',
  },
  {
    name: 'Thumbnail Generator',
    description: 'Auto-generate eye-catching video thumbnails for your listings',
    path: '/tools/thumbnail-generator',
    icon: <ImagePlus size={20} />,
    category: 'Video Tools',
  },

  // ── GST Tools ─────────────────────────────────────────────
  {
    name: 'GST Search',
    description: 'Search and verify GSTIN details by business name or tax number',
    path: '/tools/gst-search',
    icon: <Search size={20} />,
    category: 'GST Tools',
    isPopular: true,
  },
  {
    name: 'GSTIN Verifier',
    description: 'Instantly verify if a GSTIN is valid and active on the GST portal',
    path: '/tools/gst-verify',
    icon: <CheckCircle size={20} />,
    category: 'GST Tools',
  },
  {
    name: 'GST Calculator',
    description: 'Calculate GST amount, IGST/CGST/SGST split, and net price',
    path: '/tools/gst-calculator',
    icon: <Calculator size={20} />,
    category: 'GST Tools',
    isPopular: true,
  },
  {
    name: 'Reverse GST Calculator',
    description: 'Find the base price and GST amount from an inclusive total',
    path: '/tools/gst-reverse',
    icon: <ArrowLeftRight size={20} />,
    category: 'GST Tools',
  },
  {
    name: 'GST Rate Finder',
    description: 'Find the correct GST rate for any product category or HSN code',
    path: '/tools/gst-rate',
    icon: <Percent size={20} />,
    category: 'GST Tools',
  },
  {
    name: 'GST State Code Lookup',
    description: 'Look up the 2-digit state code used in GSTIN numbers',
    path: '/tools/gst-state',
    icon: <MapPin size={20} />,
    category: 'GST Tools',
  },
  {
    name: 'GSTIN Validator',
    description: 'Validate GSTIN format and checksum without an API call',
    path: '/tools/gstin-validator',
    icon: <ShieldCheck size={20} />,
    category: 'GST Tools',
  },
  {
    name: 'PAN Validator',
    description: 'Validate PAN card numbers for individuals and businesses',
    path: '/tools/pan-validate',
    icon: <CreditCard size={20} />,
    category: 'GST Tools',
  },
  {
    name: 'HSN Code Search',
    description: 'Search the HSN master to find codes and applicable GST rates',
    path: '/tools/hsn-search',
    icon: <BookOpen size={20} />,
    category: 'GST Tools',
  },
  {
    name: 'SAC Code Search',
    description: 'Look up Service Accounting Codes (SAC) and GST rates for services',
    path: '/tools/sac-search',
    icon: <Headphones size={20} />,
    category: 'GST Tools',
  },

  // ── Label Crop ────────────────────────────────────────────
  {
    name: 'Label Crop',
    description: 'Crop shipping labels from marketplace PDFs — Amazon, Flipkart, Meesho',
    path: '/label-crop',
    icon: <ScissorsLineDashed size={20} />,
    category: 'Label Crop',
    isPopular: true,
  },
]

// ============================================================
// Category metadata
// ============================================================

export const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'SKU Tools': {
    icon: <Tag size={18} />,
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  'PDF Tools': {
    icon: <FileText size={18} />,
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
  },
  'Image Tools': {
    icon: <Image size={18} />,
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
  },
  'Video Tools': {
    icon: <Film size={18} />,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  'Label Crop': {
    icon: <ScissorsLineDashed size={18} />,
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
  },
  'GST Tools': {
    icon: <Calculator size={18} />,
    color: 'text-cyan-700',
    bg: 'bg-cyan-50 border-cyan-200',
  },
}

// ============================================================
// ToolCard
// ============================================================

interface ToolCardProps {
  tool: Tool
  compact?: boolean
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, compact = false }) => {
  const navigate = useNavigate()
  const meta = CATEGORY_META[tool.category]

  return (
    <button
      type="button"
      onClick={() => navigate(tool.path)}
      className={[
        'group relative flex flex-col items-start gap-3 rounded-[8px] border border-[#E2E8F0] bg-white text-left',
        'transition-all duration-150 hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-[#2563EB_2px_2px_0px_0px]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40',
        compact ? 'p-4 min-w-[200px]' : 'p-5',
      ].join(' ')}
    >
      {/* Icon bubble */}
      <div
        className={[
          'flex items-center justify-center rounded-[6px] border p-2 transition-colors',
          meta?.bg ?? 'bg-gray-50 border-gray-200',
          meta?.color ?? 'text-gray-600',
        ].join(' ')}
      >
        {tool.icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB]">
          {tool.name}
        </p>
        {!compact && (
          <p className="mt-0.5 line-clamp-2 text-xs text-[#64748B]">{tool.description}</p>
        )}
      </div>

      {/* Free badge */}
      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700 border border-green-200">
        Free
      </span>

      {/* Popular ribbon */}
      {tool.isPopular && (
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-semibold text-white">
          Popular
        </span>
      )}
    </button>
  )
}

// ============================================================
// ToolsGrid (filterable, grouped by category)
// ============================================================

interface ToolsGridProps {
  /** Pre-filter to a single category. If omitted, show all categories. */
  category?: string
  /** External search query (controlled). */
  searchQuery?: string
  /** Show category section headings (default true). */
  showCategories?: boolean
  /** Compact card variant. */
  compact?: boolean
  /** Max tools to show (useful for homepage "most popular" section). */
  limit?: number
  /** Show only isPopular tools. */
  popularOnly?: boolean
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({
  category,
  searchQuery = '',
  showCategories = true,
  compact = false,
  limit,
  popularOnly = false,
}) => {
  const filtered = useMemo(() => {
    let tools = ALL_TOOLS
    if (popularOnly) tools = tools.filter((t) => t.isPopular)
    if (category) tools = tools.filter((t) => t.category === category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
    }
    if (limit) tools = tools.slice(0, limit)
    return tools
  }, [category, searchQuery, popularOnly, limit])

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Search size={40} className="text-gray-300" />
        <p className="text-base font-semibold text-gray-500">No tools found</p>
        <p className="text-sm text-gray-400">Try a different search term</p>
      </div>
    )
  }

  if (!showCategories || category) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((tool) => (
          <ToolCard key={tool.path} tool={tool} compact={compact} />
        ))}
      </div>
    )
  }

  // Group by category in fixed order
  const ORDER = ['SKU Tools', 'PDF Tools', 'Image Tools', 'Video Tools', 'Label Crop', 'GST Tools']
  const grouped = ORDER.reduce<Record<string, Tool[]>>((acc, cat) => {
    const tools = filtered.filter((t) => t.category === cat)
    if (tools.length) acc[cat] = tools
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-10">
      {Object.entries(grouped).map(([cat, tools]) => {
        const meta = CATEGORY_META[cat]
        return (
          <section key={cat} aria-labelledby={`cat-${cat.replace(/\s+/g, '-')}`}>
            {/* Category header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    'flex items-center justify-center rounded-[6px] border p-1.5',
                    meta?.bg ?? 'bg-gray-50 border-gray-200',
                    meta?.color ?? 'text-gray-600',
                  ].join(' ')}
                >
                  {meta?.icon}
                </span>
                <h2
                  id={`cat-${cat.replace(/\s+/g, '-')}`}
                  className="text-base font-bold text-[#0F172A]"
                >
                  {cat}
                </h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  {tools.length} tool{tools.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Tool cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tools.map((tool) => (
                <ToolCard key={tool.path} tool={tool} compact={compact} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default ToolsGrid
