import React from 'react'
import { Link } from 'react-router-dom'
import {
  Linkedin, Twitter, Github, ArrowRight,
  FileType2, Image, Film, Calculator, Tag, Scissors,
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    label: 'PDF Tools',
    icon: FileType2,
    href: '/tools/pdf',
    accent: '#2563EB',
    light: '#EFF6FF',
    tools: [
      { label: 'Merge PDF',    href: '/tools/pdf/merge' },
      { label: 'Split PDF',    href: '/tools/pdf/split' },
      { label: 'Compress PDF', href: '/tools/pdf/compress' },
      { label: 'OCR PDF',      href: '/tools/pdf/ocr' },
      { label: 'PDF to Image', href: '/tools/pdf/to-images' },
      { label: 'Image to PDF', href: '/tools/pdf/images-to-pdf' },
    ],
  },
  {
    label: 'Image Tools',
    icon: Image,
    href: '/tools/image',
    accent: '#16A34A',
    light: '#F0FDF4',
    tools: [
      { label: 'Background Remover', href: '/tools/image/background-remover' },
      { label: 'Resize Image',       href: '/tools/image/resize' },
      { label: 'Compress Image',     href: '/tools/image/compress' },
      { label: 'White Background',   href: '/tools/image/white-background' },
      { label: 'Product Optimizer',  href: '/tools/image/product-optimizer' },
      { label: 'JPG to PNG',         href: '/tools/image/jpg-to-png' },
    ],
  },
  {
    label: 'Video Tools',
    icon: Film,
    href: '/tools/video',
    accent: '#E11D48',
    light: '#FFF1F2',
    tools: [
      { label: 'Video to GIF',        href: '/tools/video/to-gif' },
      { label: 'Compress Video',      href: '/tools/video/compress' },
      { label: 'Thumbnail Generator', href: '/tools/video/thumbnail-generator' },
      { label: 'Video Converter',     href: '/tools/video/converter' },
      { label: 'Resize Video',        href: '/tools/video/resize' },
      { label: 'Frame Extractor',     href: '/tools/video/frame-extractor' },
    ],
  },
  {
    label: 'GST Tools',
    icon: Calculator,
    href: '/tools/gst',
    accent: '#0891B2',
    light: '#ECFEFF',
    tools: [
      { label: 'GST Calculator',      href: '/tools/gst/calculator' },
      { label: 'GST Verification',    href: '/tools/gst/verify' },
      { label: 'Reverse GST',         href: '/tools/gst/reverse' },
      { label: 'HSN Search',          href: '/tools/gst/hsn-search' },
      { label: 'GST Rate Finder',     href: '/tools/gst/rate-finder' },
      { label: 'SAC Search',          href: '/tools/gst/sac-search' },
    ],
  },
  {
    label: 'SKU Tools',
    icon: Tag,
    href: '/tools/sku',
    accent: '#7C3AED',
    light: '#F5F3FF',
    tools: [
      { label: 'SKU Generator',   href: '/tools/sku/generator' },
      { label: 'Bulk SKU',        href: '/tools/sku/bulk' },
      { label: 'Variant SKU',     href: '/tools/sku/variant' },
      { label: 'Barcode Generator',href: '/tools/sku/barcode' },
      { label: 'Label Generator', href: '/tools/sku/label-generator' },
      { label: 'Label Printer',   href: '/tools/sku/label-printer' },
    ],
  },
  {
    label: 'Label Crop',
    icon: Scissors,
    href: '/label-crop',
    accent: '#D97706',
    light: '#FFFBEB',
    tools: [
      { label: 'Amazon',   href: '/label-crop/amazon' },
      { label: 'Flipkart', href: '/label-crop/flipkart' },
      { label: 'Myntra',   href: '/label-crop/myntra' },
      { label: 'Meesho',   href: '/label-crop/meesho' },
      { label: 'AJIO',     href: '/label-crop/ajio' },
      { label: 'Nykaa',    href: '/label-crop/nykaa' },
      { label: 'Shopsy',   href: '/label-crop/shopsy' },
    ],
  },
]

const COMPANY = [
  { label: 'About',         href: '/about'          },
  { label: 'FAQ',           href: '/faq'            },
  { label: 'Dashboard',     href: '/dashboard'      },
  { label: 'Reconciliation',href: '/reconciliation' },
  { label: 'Inventory',     href: '/inventory'      },
  { label: 'Register',      href: '/register'       },
  { label: 'Login',         href: '/login'          },
]

// ─── Footer ───────────────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E2E8F0]">

      {/* ── Top: brand + tool categories ─────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">

        {/* Brand row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-10 pb-10 border-b border-[#F1F5F9]">

          {/* Left: logo, tagline, socials */}
          <div className="flex flex-col gap-5 max-w-[260px]">
            <Link to="/" className="flex items-center gap-2 select-none w-fit">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366F1"/>
                    <stop offset="100%" stopColor="#06B6D4"/>
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#footerLogoGrad)"/>
                <line x1="8" y1="11" x2="24" y2="11" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="8" y1="16" x2="19" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="8" y1="21" x2="24" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[20px] font-bold leading-none tracking-tight">
                <span style={{ color: '#6366F1' }}>Ecom</span><span style={{ color: '#0F172A' }}>Sathi</span>
              </span>
            </Link>

            <p className="text-sm text-[#64748B] leading-relaxed">
              Free ecommerce tools for Indian marketplace sellers. No login. No fees.
            </p>

            <div className="flex items-center gap-2">
              {[
                { href: 'https://linkedin.com', label: 'LinkedIn', icon: <Linkedin size={18} /> },
                { href: 'https://twitter.com',  label: 'Twitter',  icon: <Twitter size={18} />  },
                { href: 'https://github.com',   label: 'GitHub',   icon: <Github size={18} />   },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-[8px] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] transition-all"
                >
                  {s.icon}
                </a>
              ))}
              <span className="text-[11px] text-[#94A3B8] font-medium ml-1">🇮🇳 Made in India</span>
            </div>
          </div>

          {/* Right: company links in a tight horizontal row */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Company</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 max-w-sm">
              {COMPANY.map((l) => (
                <Link key={l.href} to={l.href} className="text-sm text-[#475569] hover:text-[#2563EB] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tool categories — 3-col grid of horizontal cards ───────────── */}
        <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-5">Free Tools</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.label}
                className="rounded-xl border border-[#E2E8F0] overflow-hidden hover:border-[#CBD5E1] hover:shadow-sm transition-all"
              >
                {/* Category header bar */}
                <Link
                  to={cat.href}
                  className="flex items-center justify-between px-4 py-3 group"
                  style={{ backgroundColor: cat.light, borderBottom: `1px solid ${cat.accent}18` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-[5px] flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: cat.accent + '18', color: cat.accent }}
                    >
                      <Icon size={13} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: cat.accent }}>
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-[#94A3B8]">View all</span>
                    <ArrowRight size={11} className="text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Tool links — 2-column grid */}
                <div className="grid grid-cols-2 gap-0 bg-white divide-x divide-[#F8FAFC]">
                  {cat.tools.map((tool, i) => (
                    <Link
                      key={tool.href}
                      to={tool.href}
                      className={`px-3 py-2 text-[12px] text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-colors leading-snug ${
                        i < cat.tools.length - 2 ? 'border-b border-[#F8FAFC]' : ''
                      }`}
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
      <div className="border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#94A3B8] text-center sm:text-left order-2 sm:order-1">
            &copy; {new Date().getFullYear()} EcomSathi is a part of{' '}
            <a href="https://tmmt.in" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline font-medium">
              TMMT
            </a>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs order-1 sm:order-2">
            {[
              { to: '/privacy', label: 'Privacy' },
              { to: '/terms',   label: 'Terms'   },
              { to: '/sitemap', label: 'Sitemap' },
              { to: '/contact', label: 'Contact' },
            ].map((item, i, arr) => (
              <React.Fragment key={item.to}>
                <Link to={item.to} className="text-[#94A3B8] hover:text-[#64748B] transition-colors px-1">
                  {item.label}
                </Link>
                {i < arr.length - 1 && <span className="text-[#E2E8F0] select-none">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
