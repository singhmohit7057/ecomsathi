import React from 'react'
import { Link } from 'react-router-dom'
import {
  Wand2,
  Crop,
  Maximize2,
  Archive,
  ArrowRight,
  Zap,
  Stamp,
  Star,
  Square,
  LayoutGrid,
  ChevronRight,
  ImageIcon,
  CheckCircle2,
  Shield,
} from 'lucide-react'

// ─── Tool list ────────────────────────────────────────────────────────────────

interface ImageTool {
  name: string
  href: string
  icon: React.ReactNode
  desc: string
  color: string
  iconBg: string
}

const IMAGE_TOOLS: ImageTool[] = [
  {
    name: 'Background Remover',
    href: '/tools/image/background-remover',
    icon: <Wand2 size={22} />,
    desc: 'Remove backgrounds from product images',
    color: 'text-[#DC2626]',
    iconBg: 'bg-[#FFF1F2]',
  },
  {
    name: 'Crop Image',
    href: '/tools/image/crop',
    icon: <Crop size={22} />,
    desc: 'Crop to any size or aspect ratio',
    color: 'text-[#16A34A]',
    iconBg: 'bg-[#DCFCE7]',
  },
  {
    name: 'Resize Image',
    href: '/tools/image/resize',
    icon: <Maximize2 size={22} />,
    desc: 'Resize for marketplace requirements',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#DBEAFE]',
  },
  {
    name: 'Compress Image',
    href: '/tools/image/compress',
    icon: <Archive size={22} />,
    desc: 'Reduce file size with quality control',
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FEF9C3]',
  },
  {
    name: 'JPG to PNG',
    href: '/tools/image/jpg-to-png',
    icon: <ArrowRight size={22} />,
    desc: 'Convert JPG images to transparent PNG',
    color: 'text-[#0891B2]',
    iconBg: 'bg-[#CFFAFE]',
  },
  {
    name: 'PNG to JPG',
    href: '/tools/image/png-to-jpg',
    icon: <ArrowRight size={22} />,
    desc: 'Convert PNG to JPG with white background',
    color: 'text-[#9333EA]',
    iconBg: 'bg-[#F3E8FF]',
  },
  {
    name: 'WEBP Converter',
    href: '/tools/image/webp',
    icon: <Zap size={22} />,
    desc: 'Convert to/from WEBP format',
    color: 'text-[#16A34A]',
    iconBg: 'bg-[#DCFCE7]',
  },
  {
    name: 'Image Watermark',
    href: '/tools/image/watermark',
    icon: <Stamp size={22} />,
    desc: 'Add text or logo watermark',
    color: 'text-[#EA580C]',
    iconBg: 'bg-[#FFF7ED]',
  },
  {
    name: 'Product Optimizer',
    href: '/tools/image/product-optimizer',
    icon: <Star size={22} />,
    desc: 'Optimize product images for listings',
    color: 'text-[#2563EB]',
    iconBg: 'bg-[#DBEAFE]',
  },
  {
    name: 'White Background',
    href: '/tools/image/white-background',
    icon: <Square size={22} />,
    desc: 'Add white background for marketplace',
    color: 'text-[#334155]',
    iconBg: 'bg-[#F1F5F9]',
  },
  {
    name: 'Square Image Creator',
    href: '/tools/image/square',
    icon: <LayoutGrid size={22} />,
    desc: 'Create 1:1 square images with padding',
    color: 'text-[#BE185D]',
    iconBg: 'bg-[#FCE7F3]',
  },
]

// ─── Hub page ─────────────────────────────────────────────────────────────────

export const handle = {
  toolName: undefined,
  category: 'Image Tools',
  description: 'Free image editing tools for Indian marketplace sellers.',
}

export default function ImageToolsHub() {
  return (
    <div className="flex flex-col gap-8">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="rounded-[8px] border border-[#A7F3D0] bg-[#F0FDF4] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border border-[#A7F3D0] bg-white text-[#16A34A] shadow-sm">
            <ImageIcon size={28} />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
                Image Tools
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
              {IMAGE_TOOLS.length} free image editing tools — resize, compress, remove backgrounds,
              and optimize product photos for Amazon, Flipkart, Meesho and more.
            </p>

            {/* Stats row */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span className="font-bold text-[#16A34A] text-sm">{IMAGE_TOOLS.length}</span>
                tools available
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Shield size={13} className="text-[#16A34A]" />
                Files processed securely
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <CheckCircle2 size={13} className="text-[#16A34A]" />
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
        <span className="font-medium text-[#0F172A]">Image Tools</span>
      </nav>

      {/* ── Tool grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {IMAGE_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className="group flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-5 transition-all duration-150 hover:border-[#16A34A] hover:shadow-[#1E293B_2px_2px_0px_0px]"
          >
            {/* Icon + badges */}
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-[8px] ${tool.iconBg} ${tool.color}`}
              >
                {tool.icon}
              </div>
              <div className="flex gap-1.5">
                <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A] border border-[#A7F3D0]">
                  Free
                </span>
                <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-medium text-[#16A34A]">
                  Image Tools
                </span>
              </div>
            </div>

            {/* Title + description */}
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[#0F172A] transition-colors group-hover:text-[#16A34A]">
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
          Most tools process images directly in your browser. Background Remover and White Background
          use our secure backend. Files are never stored permanently.
        </p>
      </div>
    </div>
  )
}
